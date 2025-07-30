import { cfg } from "./config.js";
import { loginAndStart, logoutAndStop } from "./client.js";
import { createRoom, invite, joinRoom } from "./room.js";
import { sendText, listenMessages } from "./message.js";

(async () => {
  if (!cfg.url1 || !cfg.url2) {
    console.error("请在 .env 中为两个账号都填好信息");
    process.exit(1);
  }

  // 启动两个客户端
  const alice = await loginAndStart({
    baseUrl: cfg.url1,
    userId: cfg.mxid1,
    password: cfg.pass1,
  });
  listenMessages(alice);

  const bob = await loginAndStart({
    baseUrl: cfg.url2,
    userId: cfg.mxid2,
    password: cfg.pass2,
  });
  listenMessages(bob);

  // Alice 创建房间并邀请 Bob
  const roomId = await createRoom(alice, "Two‑Client Demo");
  await invite(alice, roomId, bob.getUserId());
  await joinRoom(bob, roomId);

  // 互相发送三条消息
  await sendText(alice, roomId, "你好 Bob，我是 Alice");
  await sendText(bob, roomId, "Hi Alice，这里是 Bob");
  await sendText(alice, roomId, "本次演示结束，拜拜!");

  // 30 秒后登出并结束进程
  setTimeout(async () => {
    await Promise.all([logoutAndStop(alice), logoutAndStop(bob)]);
    process.exit(0);
  }, 30 * 1000);
})();
