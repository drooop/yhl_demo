import { defineStore } from "pinia";
export const useCallStore = defineStore("call", {
  state: () => ({
    call: null, // MatrixCall 实例
    state: "idle", // idle | outgoing | incoming | connected
    muted: false,
    videoOff: false,
  }),
  actions: {
    setCall(c) {
      this.call = c;
    },
    updateState(s) {
      this.state = s;
    },
    toggleMute() {
      this.muted = !this.muted;
      this.call?.setMicrophoneMuted(this.muted);
    },
    toggleVideo() {
      this.videoOff = !this.videoOff;
      this.call?.setLocalVideoMuted(this.videoOff);
    },
    hangup() {
      this.call?.hangup();
      this.$reset();
    },
  },
});
