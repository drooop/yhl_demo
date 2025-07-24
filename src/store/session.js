import { defineStore } from "pinia";
export const useSessionStore = defineStore("session", {
  state: () => ({
    client: null, // MatrixClient
    userId: "",
    accessToken: "",
    isLogin: false,
  }),
  actions: {
    setClient(c) {
      this.client = c;
      this.userId = c.getUserId();
      this.isLogin = true;
    },
    logout() {
      this.client?.logout();
      this.$reset();
    },
  },
});
