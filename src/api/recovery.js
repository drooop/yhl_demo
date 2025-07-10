import { decodeRecoveryKey } from "matrix-js-sdk/lib/crypto-api/recovery-key";

export const RECOVERY_PHRASE =
  "EsTw wGmL ahjT Es63 pDa1 MuuE Dph6 SK4D ZeFX K7ah Nu64 MiPZ"; // @bot:m2m.yhlcps.com 的恢复短语

export function decodeRecoveryPhrase() {
  return decodeRecoveryKey(RECOVERY_PHRASE);
}
