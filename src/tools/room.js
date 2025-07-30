/**
 * 创建房间，返回 roomId
 */
export async function createRoom(client, name, visibility = "public") {
  const { room_id } = await client.createRoom({
    name,
    visibility,
    preset: "public_chat",
  }); // :contentReference[oaicite:1]{index=1}
  return room_id;
}

/**
 * 邀请用户进入房间
 */
export const invite = (client, roomId, userId) => client.invite(roomId, userId);

/**
 * 加入房间（可用于接受邀请或通过 roomId 直接加入）
 */
export const joinRoom = (client, roomId) => client.joinRoom(roomId);

/**
 * 离开房间
 */
export const leaveRoom = (client, roomId) => client.leave(roomId);

/**
 * 获取当前已加入的房间列表
 */
export const listJoinedRooms = (client) =>
  client.getRooms().map((r) => ({ id: r.roomId, name: r.name }));
