/** Pure helpers for partner week share (safe for unit tests). */

export type ShareRole = "owner" | "partner" | null;

export {
  safeAuthCallbackUrl,
  withAuthCallbackQuery,
} from "@/lib/auth/callback-url";

export function partnerDisplayName(user: {
  name: string | null;
  email: string;
}): string {
  const name = user.name?.trim();
  if (name) return name.split(/\s+/)[0] ?? name;
  const local = user.email.split("@")[0] ?? user.email;
  return local;
}

export function shareRoleForUser(
  plan: { userId: string; members: { userId: string }[] },
  userId: string,
): ShareRole {
  if (plan.userId === userId) return "owner";
  if (plan.members.some((m) => m.userId === userId)) return "partner";
  return null;
}

export function buildInviteUrl(appBase: string, rawToken: string): string {
  const base = appBase.replace(/\/$/, "");
  return `${base}/invite/week?token=${encodeURIComponent(rawToken)}`;
}
