/**
 * 订阅并打印关键信号（成员进出、房间变更等）
 */
export function enableVerboseLogging(client) {
  client.on("RoomMember.membership", (ev, member) => {
    console.log(
      `[成员] ${member.name} -> ${member.membership} @ ${member.roomId}`
    );
  });

  client.on("Room", (room) => {
    console.log(`[房间] 已同步房间 ${room.roomId} (${room.name})`);
  });
}
