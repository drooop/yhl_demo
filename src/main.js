import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";
import App from "./App.vue";
import * as sdk from "matrix-js-sdk";
import { setupClient, ensureEncryptionSetup } from "./api/matrix";
import { decodeRecoveryKey } from "matrix-js-sdk/lib/crypto-api/recovery-key";
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
  const client = sdk.createClient({
    baseUrl,
    accessToken,
    userId,
    deviceId,
    cryptoCallbacks: {
      getSecretStorageKey: async ({ keys }) => {
        const key = prompt("输入恢复密钥以解锁密钥库");
        if (!key) return null;
        const keyId = Object.keys(keys)[0];
        return [keyId, decodeRecoveryKey(key)];
      },
    },
  });
  setupClient(client); // ← 同一监听
  client.initRustCrypto().then(async () => {
    await ensureEncryptionSetup(client);
    client.startClient({ initialSyncLimit: 20, pollTimeout: 10000 });
  });

  useSessionStore().setClient(client);
}

app.mount("#app");
