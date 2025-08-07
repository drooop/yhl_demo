import { defineStore } from "pinia";

interface JitsiAPI {
  addEventListener(event: string, cb: () => void): void;
  executeCommand(command: string): void;
  dispose(): void;
}

interface CallState {
  api: JitsiAPI | null;
  state: "idle" | "pending" | "connected";
  roomName: string;
  callId: string;
  incoming: boolean;
  domain: string;
}

export const useCallStore = defineStore("call", {
  state: (): CallState => ({
    api: null,
    state: "idle",
    roomName: "",
    callId: "",
    incoming: false,
    domain: "meeting.yhlcps.com",
  }),
  actions: {
    prepare(
      roomName: string,
      incoming = false,
      callId = "",
      domain = "meeting.yhlcps.com"
    ) {
      this.roomName = roomName;
      this.callId = callId;
      this.incoming = incoming;
      this.domain = domain;
      this.state = "pending";
    },
    start(parentNode: HTMLElement, displayName: string) {
      if (!this.roomName) return;
      const domain = this.domain || "meeting.yhlcps.com";
      this.api = new (window as any).JitsiMeetExternalAPI(domain, {
        roomName: this.roomName,
        parentNode,
        userInfo: { displayName },
        iframeAttrs: {
          allow: "camera; microphone; fullscreen; display-capture",
        },
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
