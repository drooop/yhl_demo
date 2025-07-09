import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";
import App from "./App.vue";
import * as sdk from "matrix-js-sdk";
import { setupClient } from "./api/matrix";
import { useSessionStore } from "./store/session";

// -------- 自动恢复 Matrix 会话 ----------
const baseUrl = localStorage.getItem("baseUrl");
const accessToken = localStorage.getItem("accessToken");
const userId = localStorage.getItem("userId");
const deviceId = localStorage.getItem("deviceId");

const app = createApp(App);
app.use(createPinia());
app.use(ElementPlus);
app.use(router);

if (baseUrl && accessToken && userId) {
  const client = sdk.createClient({ baseUrl, accessToken, userId, deviceId });
  setupClient(client); // ← 同一监听
  client.initRustCrypto().then(() => {
    client.startClient({ initialSyncLimit: 20, pollTimeout: 10000 });
  });

  useSessionStore().setClient(client);
}

app.mount("#app");
