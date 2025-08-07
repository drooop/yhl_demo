import type { Room } from "matrix-js-sdk";
import { defineStore } from "pinia";

interface RoomsState {
  rooms: Room[];
  invites: Room[];
  currentRoomId: string;
  bump: number;
}

export const useRoomStore = defineStore("rooms", {
  state: (): RoomsState => ({
    rooms: [],
    invites: [],
    currentRoomId: "",
    bump: 0,
  }),
  getters: {
    currentRoom(state): Room | undefined {
      return state.rooms.find((r) => r.roomId === state.currentRoomId);
    },
  },
  actions: {
    setRooms(rs: Room[]) {
      this.rooms = rs;
    },
    setInvites(rs: Room[]) {
      this.invites = rs;
    },
    select(roomId: string) {
      this.currentRoomId = roomId;
    },
    ping() {
      this.bump++;
    },
  },
});
