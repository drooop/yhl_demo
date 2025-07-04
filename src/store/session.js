import { defineStore } from "pinia";
export const useSessionStore = defineStore("session", {
  state: () => ({
    client: null, // MatrixClient
    userId: "",
    accessToken: "",
  }),
  actions: {
    setClient(c) {
      this.client = c;
      this.userId = c.getUserId();
    },
    logout() {
      this.client?.logout();
      this.$reset();
    },
  },
});
