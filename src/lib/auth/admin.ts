/**
 * Owner allowlist for /admin/feedback (env ADMIN_EMAILS).
 * Pure helpers — safe for unit tests.
 */

export function parseAdminEmails(
  raw: string | null | undefined = process.env.ADMIN_EMAILS,
): string[] {
  if (!raw?.trim()) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const email = part.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  const allow = parseAdminEmails();
  if (allow.length === 0) return false;
  return allow.includes(email.trim().toLowerCase());
}
