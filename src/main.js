import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";
import App from "./App.vue";
import * as sdk from "matrix-js-sdk";
import { setupClient, ensureEncryptionSetup } from "./api/matrix";
import { decodeRecoveryKey } from "matrix-js-sdk/lib/crypto-api/recovery-key";

// 与 api/matrix.js 中保持一致的测试助记词
const RECOVERY_PHRASE =
  "EsUG BNSP HxK6 SM9j EHPk SsSE UW4r 238h Bz97 rtJ3 RfGZ JUb2";
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
        return [keyId, decodeRecoveryKey(RECOVERY_PHRASE)];
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
