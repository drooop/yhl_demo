import { defineStore } from "pinia";

export const useCallStore = defineStore("call", {
  state: () => ({
    api: null, // JitsiMeetExternalAPI instance
    state: "idle", // idle | pending | connected
    roomName: "",
  }),
  actions: {
    prepare(roomName) {
      this.roomName = roomName;
      this.state = "pending";
    },
    start(parentNode) {
      if (!this.roomName) return;
      const domain = "meeting.yhlcps.com";
      this.api = new window.JitsiMeetExternalAPI(domain, {
        roomName: this.roomName,
        parentNode,
      });
      this.api.addEventListener("readyToClose", () => this.hangup());
      this.state = "connected";
    },
    toggleMute() {
      this.api?.executeCommand("toggleAudio");
    },
    toggleVideo() {
      this.api?.executeCommand("toggleVideo");
    },
    hangup() {
      this.api?.executeCommand("hangup");
      this.api?.dispose();
      this.$reset();
    },
  },
});
