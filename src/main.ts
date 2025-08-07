import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./styles/theme.scss";
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
import pinia from "./stores";
import { useSessionStore } from "./stores/session";

const app = createApp(App);
app.use(pinia);
app.use(ElementPlus);
app.use(router);

const session = useSessionStore();

if (session.isLogin && session.baseUrl && session.accessToken && session.userId) {
  const client = sdk.createClient({
    baseUrl: session.baseUrl,
    accessToken: session.accessToken,
    userId: session.userId,
    deviceId: session.deviceId,
    cryptoCallbacks: {
      getSecretStorageKey: async ({ keys }) => {
        const keyId = Object.keys(keys)[0];
        return [keyId, decodeRecoveryPhrase()];
      },
    },
  });
  setupClient(client);
  if (useEncryption) {
    loadCryptoWasm()
      .then(() => client.initRustCrypto())
      .then(async () => {
        await ensureEncryptionSetup(client);
        client.startClient({ initialSyncLimit: 20, pollTimeout: 10000 });
      });
  } else {
    client.startClient({ initialSyncLimit: 20, pollTimeout: 10000 });
  }
  session.setClient(client);
}

app.mount("#app");
