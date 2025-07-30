/**
 * 获取当前用户资料
 */
export async function myProfile(client) {
  return client.getProfileInfo(client.getUserId());
}

/**
 * 更新用户资料（昵称 / 头像）
 * @param {object} p {displayname?, avatarUrl?}
 */
export async function updateProfile(client, p) {
  if (p.displayname) await client.setDisplayName(p.displayname);
  if (p.avatarUrl) await client.setAvatarUrl(p.avatarUrl);
}
