import { defineStore } from "pinia";
export const useRoomStore = defineStore("rooms", {
  state: () => ({
    rooms: [], // 所有房间（已加入）
    invites: [], // 邀请列表
    currentRoomId: "", // 选中的房间
    bump: 0, // 用于强制刷新
  }),
  getters: {
    currentRoom(state) {
      return state.rooms.find((r) => r.roomId === state.currentRoomId);
    },
  },
  actions: {
    setRooms(rs) {
      this.rooms = rs;
    },
    setInvites(rs) {
      this.invites = rs;
    },
    select(roomId) {
      this.currentRoomId = roomId;
    },
    ping() { this.bump++; },
  },
});
