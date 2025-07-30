/* -------------------------------------------------------
 * src/api/matrix.js
 * ----------------------------------------------------- */
import * as sdk from "matrix-js-sdk";
import * as RustCrypto from "@matrix-org/matrix-sdk-crypto-wasm";
import { useSessionStore } from "../store/session";
import { useRoomStore } from "../store/rooms";
import { useCallStore } from "../store/call";

import { RECOVERY_PHRASE, decodeRecoveryPhrase } from "./recovery";

// 控制是否启用加密
export let useEncryption = false;  // 设置为 false 跳过加密初始化

// 加载crypto wasm模块
let wasmInit;
export function loadCryptoWasm() {
  if (!wasmInit && useEncryption) {
    wasmInit = RustCrypto.initAsync("/matrix_sdk_crypto_bg.wasm");
    // wasmInit = RustCrypto.initAsync("http://localhost:8000/assets/matrix_sdk_crypto_bg.wasm");
  }
  return wasmInit;
}

// Ensure the public identity is available by performing keys query
export async function ensurePublicIdentity(client) {
  if (!useEncryption) return; // Skip when encryption is disabled
  try {
    await client.getCrypto().getKeys([client.getUserId()]); // Query the keys for the current user
    console.log("Public identity query completed successfully.");
  } catch (error) {
    console.error("Failed to query public identity:", error);
  }
}

// 设置 Matrix 客户端
export function setupClient(client) {
  const rooms = useRoomStore();
  const callStore = useCallStore();
  const session = useSessionStore();

  function refresh() {
    const all = client.getRooms();
    rooms.setRooms(all.filter((r) => r.getMyMembership() === "join"));
    rooms.setInvites(all.filter((r) => r.getMyMembership() === "invite"));
  }

  // 1) 同步完成
  client.on("sync", (state) => {
    if (state === "PREPARED") refresh();
  });

  client.on("Room.myMembership", refresh);

  // 2) 时间线变更
  client.on("Room.timeline", (ev, room) => {
    if (room.roomId === rooms.currentRoomId) rooms.ping(); // 触发布局刷新

    // 来电事件: 旧版 m.call.invite
    if (ev.getType() === "m.call.invite" && ev.getSender() !== session.userId) {
      const { roomName, call_id, domain } = ev.getContent() || {};
      if (roomName) callStore.prepare(roomName, true, call_id, domain);
    }

    // 来电事件: MSC3401 群组呼叫
    if (
      ev.getType() === "org.matrix.msc3401.call.member" &&
      ev.getSender() !== session.userId
    ) {
      const focus = ev.getContent()?.foci_preferred?.[0];
      const roomName = focus?.livekit_alias;
      const domain = focus?.livekit_service_url
        ? new URL(focus.livekit_service_url).hostname
        : undefined;
      if (roomName) callStore.prepare(roomName, true, "", domain);
    }
  });

  // 3) 来电 - 已弃用（使用 Jitsi 实现）
}

/**
 * 登录：用户名 + 密码
 * 返回携带 accessToken / deviceId 的正式 client
 */
export async function loginHomeserver({ baseUrl, user, password }) {
  const tmp = sdk.createClient({ baseUrl });
  const res = await tmp.login("m.login.password", {
    identifier: {
      type: "m.id.user",
      user: user.replace(/^@/, "").split(":")[0],
    },
    password,
  });

  const storedDeviceId = localStorage.getItem("deviceId");
  const deviceId = storedDeviceId || res.device_id;

  const client = sdk.createClient({
    baseUrl,
    accessToken: res.access_token,
    userId: res.user_id,
    deviceId,
    cryptoCallbacks: {
      getSecretStorageKey: async ({ keys }) => {
        const keyId = Object.keys(keys)[0];
        return [keyId, decodeRecoveryPhrase()];
      },
    },
  });

  if (useEncryption) {
    await loadCryptoWasm();
    await client.initRustCrypto();
    await ensureEncryptionSetup(client); // 初始化加密
    await ensurePublicIdentity(client); // Ensure public identity is available
    try {
      await client.getCrypto().requestOwnUserVerification();
    } catch {
      /* ignore */
    }
  }

  setupClient(client);
  client.startClient({ initialSyncLimit: 20, pollTimeout: 10000 });

  useSessionStore().setClient(client);

  localStorage.setItem("baseUrl", baseUrl);
  localStorage.setItem("userId", res.user_id);
  localStorage.setItem("accessToken", res.access_token);
  localStorage.setItem("deviceId", deviceId);

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
 * 房间/成员相关操作
 * ----------------------------------------------------- */
export async function createRoom(name) {
  const { client } = useSessionStore();
  return client.createRoom({ visibility: "private", name });
}

export async function joinRoom(roomIdOrAlias) {
  const { client } = useSessionStore();
  return client.joinRoom(roomIdOrAlias);
}

export async function inviteUser(roomId, userId) {
  const { client } = useSessionStore();
  return client.invite(roomId, userId);
}

export function refreshRooms() {
  const { client } = useSessionStore();
  const rooms = useRoomStore();
  const all = client.getRooms();
  rooms.setRooms(all.filter((r) => r.getMyMembership() === "join"));
  rooms.setInvites(all.filter((r) => r.getMyMembership() === "invite"));
  rooms.ping();
}

/* -------------------------------------------------------
 * 发起 1‑to‑1 视频通话
 * 使用 Jitsi 进行视频通话
 * ----------------------------------------------------- */
export async function placeVideoCall(roomId) {
  const session = useSessionStore();
  const callStore = useCallStore();

  if (!session.client) throw new Error("Matrix client not ready");

  const roomName = "matrix" + roomId.replace(/[^a-zA-Z0-9]/g, "") + Date.now();
  const domain = "meeting.yhlcps.com";
  const link = `https://${domain}/${roomName}`;

  // 发送 Element 风格的通话事件，携带 Jitsi 信息
  const callId = "jitsi-" + Date.now();
  const content = {
    roomName,
    link,
    domain,
    call_id: callId,
    version: "1",
    party_id: session.client.getDeviceId(),
    lifetime: 60000,
    offer: { sdp: "", type: "offer" },
  };
  await session.client.sendEvent(roomId, "m.call.invite", content, "");

  // 准备通话
  callStore.prepare(roomName, false, callId, domain);
}

/**
 * 加密辅助：初始化密钥和交叉签名
 */
export async function ensureEncryptionSetup(client) {
  if (!useEncryption) return; // 如果不开启加密，跳过

  const crypto = client.getCrypto();
  if (!(await crypto.isSecretStorageReady())) {
    await crypto.bootstrapSecretStorage({
      createSecretStorageKey: async () => {
        return crypto.createRecoveryKeyFromPassphrase(RECOVERY_PHRASE);
      },
    });
  }

  try {
    await crypto.bootstrapCrossSigning({
      authUploadDeviceSigningKeys: async (makeRequest) => makeRequest({}),
    });
  } catch (error) {
    console.error("Failed to bootstrap cross-signing:", error);
  }

  const hasBackup = (await crypto.checkKeyBackupAndEnable()) !== null;
  if (!hasBackup) await crypto.resetKeyBackup();
}

/* -------------------------------------------------------
 * 向主设备发送验证请求
 * ----------------------------------------------------- */
export function requestVerificationFromMobile() {
  const { client } = useSessionStore();
  if (!useEncryption) return Promise.resolve();
  return client.getCrypto().requestOwnUserVerification();
}

/**
 * 导入交叉签名密钥时遇到错误
 */
export async function importCrossSigningKeys() {
  const { client } = useSessionStore();
  if (!useEncryption) return;
  try {
    await client.getCrypto().importCrossSigningKeys();
  } catch (error) {
    console.error("Failed to import cross-signing keys:", error);
  }
}
