import { decodeRecoveryKey } from "matrix-js-sdk/lib/crypto-api/recovery-key";

export const RECOVERY_PHRASE =
  "EsTZ dyEr fz4E rCYt 8Frv 64Vo DEeb somw Yvnu ty3v 76Ju QXgL"; // @bot:m2m.yhlcps.com 的恢复短语

export function decodeRecoveryPhrase() {
  return decodeRecoveryKey(RECOVERY_PHRASE);
}
