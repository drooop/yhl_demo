import "dotenv/config";

export const cfg = {
  // 第一账号
  url1: process.env.HS_URL_1,
  mxid1: process.env.MXID_1,
  pass1: process.env.PASS_1,

  // 第二账号（可选）
  url2: process.env.HS_URL_2,
  mxid2: process.env.MXID_2,
  pass2: process.env.PASS_2,
};
