/* -------------------------------------------------------
 * src/api/matrix.js
 * ----------------------------------------------------- */
import * as sdk from "matrix-js-sdk";
import { useSessionStore } from "../store/session";
import { useRoomStore } from "../store/rooms";
import { useCallStore } from "../store/call";

import { decodeRecoveryKey } from "matrix-js-sdk/lib/crypto-api/recovery-key";

// 测试用助记词（不应在生产环境使用）
const RECOVERY_PHRASE =
  "EsUG BNSP HxK6 SM9j EHPk SsSE UW4r 238h Bz97 rtJ3 RfGZ JUb2";
// fallback for incorrect wasm MIME types
if (WebAssembly && WebAssembly.instantiateStreaming) {
  const orig = WebAssembly.instantiateStreaming;
  WebAssembly.instantiateStreaming = async (src, importObject) => {
    try {
      return await orig(src, importObject);
    } catch (e) {
      const resp = await src;
      const bytes = await resp.arrayBuffer();
      return await WebAssembly.instantiate(bytes, importObject);
    }
  };
}

/**
 * 给 MatrixClient 绑定统一事件监听：
 *   ─ 同步完成后刷新房间列表
 *   ─ 当前房间时间线有变动时强制视图刷新
 *   ─ 处理来电 & 更新通话状态
 */
export function setupClient(client) {
  const rooms = useRoomStore();
  const callStore = useCallStore();

  // 1) 同步完成
  client.on("sync", (state) => {
    if (state === "PREPARED") rooms.setRooms(client.getRooms());
  });

  // 2) 时间线变更
  client.on("Room.timeline", (_ev, room) => {
    if (room.roomId === rooms.currentRoomId) rooms.ping(); // 触发布局刷新
  });

  // 3) 来电
  client.on("Call.incoming", (call) => {
    callStore.setCall(call);
    callStore.updateState("incoming");

    // 状态流转
    call.on("state", () => callStore.updateState(call.state));
    // 音视频流变化
    call.on("feeds_changed", () => rooms.ping());
  });
}

/* -------------------------------------------------------
 * 登录：用户名 + 密码
 * 返回携带 accessToken / deviceId 的正式 client
 * ----------------------------------------------------- */
export async function loginHomeserver({ baseUrl, user, password }) {
  // 临时 client 只用于 /login
  const tmp = sdk.createClient({ baseUrl });
  // const { flows } = await tmp.loginFlows()
  
  const res = await tmp.login("m.login.password", {
    identifier: {
      type: "m.id.user",
      user: user.replace(/^@/, "").split(":")[0],
    },
    password,
  });

  // 正式 client：必须带 deviceId，否则不能建立通话
  const client = sdk.createClient({
    baseUrl,
    accessToken: res.access_token,
    userId: res.user_id,
    deviceId: res.device_id,
    cryptoCallbacks: {
      // 使用固定助记词自动解锁密钥库，正式环境应改为交互式输入
      getSecretStorageKey: async ({ keys }) => {
        const keyId = Object.keys(keys)[0];
        return [keyId, decodeRecoveryKey(RECOVERY_PHRASE)];
      },
    },
  });

  // --- initialize rust crypto for end-to-end encryption ---
  await client.initRustCrypto();
  await ensureEncryptionSetup(client);

  setupClient(client);
  client.startClient({ initialSyncLimit: 20, pollTimeout: 10000 });

  // 写入 Pinia
  useSessionStore().setClient(client);

  // 持久化（供刷新自动恢复）
  localStorage.setItem("baseUrl", baseUrl);
  localStorage.setItem("userId", res.user_id);
  localStorage.setItem("accessToken", res.access_token);
  localStorage.setItem("deviceId", res.device_id);

  // client.createCall().placeVideoCall()

  return client;
}

/* -------------------------------------------------------
 * 文本消息
 * ----------------------------------------------------- */
export async function sendText(roomId, body) {
  const { client } = useSessionStore();
  await client.sendEvent(
    roomId,
    "m.room.message",
    {
      msgtype: "m.text",
      body,
    },
    ""
  );
}

/* -------------------------------------------------------
 * 单个附件（图片 / 文件）上传 + 发送
 * ----------------------------------------------------- */
export async function sendContent(roomId, file) {
  const { client } = useSessionStore();

  // 上传得到 mxc:// URL
  const { content_uri: mxc } = await client.uploadContent(file, {
    name: file.name,
    type: file.type,
  });

  const isImage = file.type.startsWith("image");

  await client.sendEvent(
    roomId,
    "m.room.message",
    {
      msgtype: isImage ? "m.image" : "m.file",
      url: mxc,
      body: file.name,
      info: {
        size: file.size,
        mimetype: file.type,
      },
    },
    ""
  );
}

/* -------------------------------------------------------
 * 发起 1‑to‑1 视频通话
 * ----------------------------------------------------- */
export async function placeVideoCall(roomId) {
  const session = useSessionStore();
  const callStore = useCallStore();
  const rooms = useRoomStore();

  if (!session.client) throw new Error("Matrix client not ready");

  const call = session.client.createCall(roomId);
  callStore.setCall(call);
  callStore.updateState("outgoing");

  // 状态监听
  call.on("state", () => callStore.updateState(call.state));
  call.on("feeds_changed", () => rooms.ping());

  await call.placeVideoCall();
}

/* -------------------------------------------------------
 * 登出：清 Pinia + localStorage
 * ----------------------------------------------------- */
export async function logout() {
  const session = useSessionStore();
  try {
    await session.client?.logout();
  } catch {
    /* ignore */
  }
  session.$reset();
  ["baseUrl", "userId", "accessToken", "deviceId"].forEach((k) =>
    localStorage.removeItem(k)
  );
}

/* -------------------------------------------------------
 * 加密辅助：初始化密钥和交叉签名
 * ----------------------------------------------------- */
export async function ensureEncryptionSetup(client) {
  const crypto = client.getCrypto();
  await crypto.bootstrapSecretStorage({
    // 自动创建密钥库，使用上方常量作为恢复短语
    createSecretStorageKey: async () => {
      return crypto.createRecoveryKeyFromPassphrase(RECOVERY_PHRASE);
    },
  });

  await crypto.bootstrapCrossSigning({
    authUploadDeviceSigningKeys: async (makeRequest) => makeRequest({}),
  });

  const hasBackup = (await crypto.checkKeyBackupAndEnable()) !== null;
  if (!hasBackup) await crypto.resetKeyBackup();
}

/* -------------------------------------------------------
 * 向主设备发送验证请求
 * ----------------------------------------------------- */
export function requestVerificationFromMobile() {
  const { client } = useSessionStore();
  return client.getCrypto().requestOwnUserVerification();
}
