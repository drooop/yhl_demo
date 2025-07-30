import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";
import App from "./App.vue";
import * as sdk from "matrix-js-sdk";
import {
  setupClient,
  ensureEncryptionSetup,
  loadCryptoWasm,
  useEncryption,
} from "./api/matrix";
import { decodeRecoveryPhrase } from "./api/recovery";
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
      // 测试环境中直接使用固定助记词解锁密钥库
      getSecretStorageKey: async ({ keys }) => {
        const keyId = Object.keys(keys)[0];
        return [keyId, decodeRecoveryPhrase()];
      },
    },
  });
  setupClient(client); // ← 同一监听
  if (useEncryption) {
    loadCryptoWasm()
      .then(() => client.initRustCrypto())
      .then(async () => {
        await ensureEncryptionSetup(client);
        client.startClient({ initialSyncLimit: 20, pollTimeout: 10000 });
      });
  }

  useSessionStore().setClient(client);
}

app.mount("#app");
