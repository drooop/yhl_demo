import type { MatrixClient } from "matrix-js-sdk";
import { defineStore } from "pinia";

interface SessionState {
  client: MatrixClient | null;
  userId: string;
  accessToken: string;
  baseUrl: string;
  deviceId: string;
  isLogin: boolean;
}

export const useSessionStore = defineStore("session", {
  state: (): SessionState => ({
    client: null,
    userId: "",
    accessToken: "",
    baseUrl: "",
    deviceId: "",
    isLogin: false,
  }),
  persist: {
    paths: ["userId", "accessToken", "baseUrl", "deviceId", "isLogin"],
  },
  actions: {
    setClient(client: MatrixClient) {
      this.client = client;
      this.userId = client.getUserId();
      this.deviceId = client.getDeviceId() ?? "";
      this.isLogin = true;
    },
    setToken(payload: {
      baseUrl: string;
      accessToken: string;
      userId: string;
      deviceId: string;
    }) {
      this.baseUrl = payload.baseUrl;
      this.accessToken = payload.accessToken;
      this.userId = payload.userId;
      this.deviceId = payload.deviceId;
      this.isLogin = true;
    },
    async logout() {
      await this.client?.logout();
      this.$reset();
    },
  },
});
