// src/client.js
import sdk from 'matrix-js-sdk';

/**
 * localpart:   alice
 * fullUserId:  @alice:example.com   也支持，但会自动截出 localpart
 */
function toIdentifier(userId) {
  const localpart = userId.startsWith('@')
    ? userId.slice(1).split(':')[0]
    : userId;
  return { type: 'm.id.user', user: localpart };
}

export async function loginAndStart({ baseUrl, userId, password }) {
  // 1) “临时” client，用密码换 token
  const loginClient = sdk.createClient({ baseUrl });
  const loginResp = await loginClient.login('m.login.password', {
    identifier: toIdentifier(userId),
    password,
    initial_device_display_name: 'matrix-js-demo',
  });

  // 2) 真正的长连 client
  const client = sdk.createClient({
    baseUrl,
    accessToken: loginResp.access_token,
    userId: loginResp.user_id,
    deviceId: loginResp.device_id,
  });

  // 3) 同步至 PREPARED
  client.startClient({ initialSyncLimit: 20 });
  await new Promise((res) =>
    client.once('sync', (s) => s === 'PREPARED' && res())
  );
  console.log(`[${userId}] 同步完成，客户端就绪`);
  return client;
}

export async function logoutAndStop(client) {
  try {
    await client.logout(); // 服务端注销
  } finally {
    client.stopClient();   // 本地停止
  }
}
