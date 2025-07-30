import { cfg } from "./config.js";
import { loginAndStart, logoutAndStop } from "./client.js";
import { createRoom, listJoinedRooms, joinRoom } from "./room.js";
import { sendText, listenMessages } from "./message.js";
import { myProfile } from "./user.js";
import { setPresence } from "./presence.js";
import { enableVerboseLogging } from "./eventLogger.js";

(async () => {
  if (!cfg.url1) {
    console.error("请先在 .env 中配置 HS_URL_1 / MXID_1 / PASS_1");
    process.exit(1);
  }

  const client = await loginAndStart({
    baseUrl: cfg.url1,
    userId: cfg.mxid1,
    password: cfg.pass1,
  });

  enableVerboseLogging(client);
  listenMessages(client);

  // 展示资料
  const profile = await myProfile(client);
  console.log("我的资料:", profile);

  // 设置 presence
  await setPresence(client, "online", "Matrix‑JS‑SDK Demo");

  // 创建房间并自说自话
  const roomId = await createRoom(client, "My First Matrix Room");
  console.log("已创建房间", roomId);

  await sendText(client, roomId, "Hello, Matrix!");
  console.log("房间列表 ->", listJoinedRooms(client));

  // 2 分钟后退出
  setTimeout(async () => {
    console.log("演示结束，登出...");
    await logoutAndStop(client);
    process.exit(0);
  }, 2 * 60 * 1000);
})();
