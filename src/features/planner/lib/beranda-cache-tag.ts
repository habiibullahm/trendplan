/** Cache tag for per-user Beranda week summary (`updateTag` from planner writes). */
export function berandaUserTag(userId: string) {
  return `beranda-user-${userId}`;
}
