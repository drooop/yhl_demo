/* -------------------------------------------------------
 * src/api/matrix.js
 * ----------------------------------------------------- */
import * as sdk from "matrix-js-sdk";
import * as RustCrypto from "@matrix-org/matrix-sdk-crypto-wasm";
import { useSessionStore } from "../store/session";
import { useRoomStore } from "../store/rooms";
import { useCallStore } from "../store/call";

import { RECOVERY_PHRASE, decodeRecoveryPhrase } from "./recovery";

// 配置标志：是否启用加密
const useEncryption = false;  // 将其设置为 false 来跳过加密模块

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

// load the crypto wasm module from the public folder
let wasmInit;
export function loadCryptoWasm() {
  if (!wasmInit && useEncryption) {
    wasmInit = RustCrypto.initAsync("/matrix_sdk_crypto_bg.wasm");
  }
  return wasmInit;
}

/**
 * 给 MatrixClient 绑定统一事件监听：
 *   ─ 同步完成后刷新房间列表
 *   ─ 当前房间时间线有变动时强制视图刷新
 *   ─ 处理来电 & 更新通话状态
 */
export function setupClient(client) {
  const rooms = useRoomStore();

  // 1) 同步完成
  client.on("sync", (state) => {
    if (state === "PREPARED") rooms.setRooms(client.getRooms());
  });

  // 2) 时间线变更
  client.on("Room.timeline", (_ev, room) => {
    if (room.roomId === rooms.currentRoomId) rooms.ping(); // 触发布局刷新
  });

  // 3) 来电 - 已弃用（使用 Jitsi 实现）
}

/* -------------------------------------------------------
 * 登录：用户名 + 密码
 * 返回携带 accessToken / deviceId 的正式 client
 * ----------------------------------------------------- */
export async function loginHomeserver({ baseUrl, user, password }) {
  // 临时 client 只用于 /login
  const tmp = sdk.createClient({ baseUrl });
  const res = await tmp.login("m.login.password", {
    identifier: {
      type: "m.id.user",
      user: user.replace(/^@/, "").split(":")[0],
    },
    password,
  });

  // 获取本地存储中的设备 ID，确保与当前设备一致
  let storedDeviceId = localStorage.getItem("deviceId");
  console.log(`Stored deviceId: ${storedDeviceId}`);

  // 如果没有存储的 deviceId，使用从登录响应中获得的 deviceId
  if (!storedDeviceId) {
    storedDeviceId = res.device_id;
    console.log(`Setting deviceId to: ${storedDeviceId}`);
    localStorage.setItem("deviceId", storedDeviceId); // 将 deviceId 存储到 localStorage
  }

  // 正式 client：必须带 deviceId，否则不能建立通话
  const client = sdk.createClient({
    baseUrl,
    accessToken: res.access_token,
    userId: res.user_id,
    deviceId: storedDeviceId,  // 使用存储的设备 ID
    cryptoCallbacks: {
      // 使用固定助记词自动解锁密钥库，正式环境应改为交互式输入
      getSecretStorageKey: async ({ keys }) => {
        const keyId = Object.keys(keys)[0];
        return [keyId, decodeRecoveryPhrase()];
      },
    },
  });

  // --- 初始化 Rust 加密模块，仅当启用加密时调用 ---
  if (useEncryption) {
    await loadCryptoWasm();
    await client.initRustCrypto();
    await ensureEncryptionSetup(client);
  }

  setupClient(client);
  client.startClient({ initialSyncLimit: 20, pollTimeout: 10000 });

  // 写入 Pinia
  useSessionStore().setClient(client);

  // 持久化（供刷新自动恢复）
  localStorage.setItem("baseUrl", baseUrl);
  localStorage.setItem("userId", res.user_id);
  localStorage.setItem("accessToken", res.access_token);

  return client;
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

  if (!session.client) throw new Error("Matrix client not ready");

  const roomName =
    "matrix" + roomId.replace(/[^a-zA-Z0-9]/g, "") + Date.now();
  const link = `https://meet.jit.si/${roomName}`;

  // send invite link to room
  await sendText(roomId, `Join video call: ${link}`);

  callStore.prepare(roomName);
}

/* -------------------------------------------------------
 * 加密辅助：初始化密钥和交叉签名
 * ----------------------------------------------------- */
export async function ensureEncryptionSetup(client) {
  if (!useEncryption) return;  // 如果没有启用加密，跳过

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
