/**
 * 发送文本消息
 */
export function sendText(client, roomId, body) {
  return client.sendEvent(
    roomId,
    "m.room.message",
    { msgtype: "m.text", body },
    "" /* txnId 让 SDK 生成 */
  ); // :contentReference[oaicite:2]{index=2}
}

/**
 * 开始监听并打印收到的文本消息
 */
export function listenMessages(client) {
  client.on("Room.timeline", (ev, room, toStart) => {
    if (toStart || ev.getType() !== "m.room.message") return;
    const { body } = ev.getContent();
    console.log(`[${room.name}] ${ev.getSender().split(":")[0]} › ${body}`);
  });
}
