/** Cache tag for Akun profile row (`updateTag` after niche/goal/avatar writes). */
export function akunUserTag(userId: string) {
  return `akun-user-${userId}`;
}
