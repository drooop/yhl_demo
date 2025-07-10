import { decodeRecoveryKey } from "matrix-js-sdk/lib/crypto-api/recovery-key";

// 固定助记词（仅供测试）
export const RECOVERY_PHRASE =
  "EsUG BNSP HxK6 SM9j EHPk SsSE UW4r 238h Bz97 rtJ3 RfGZ JUb2";

export function decodeRecoveryPhrase() {
  return decodeRecoveryKey(RECOVERY_PHRASE);
}
