import { defineStore } from "pinia";
export const useRoomStore = defineStore("rooms", {
  state: () => ({
    rooms: [], // 所有房间
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
    select(roomId) {
      this.currentRoomId = roomId;
    },
    ping() { this.bump++; },
  },
});
