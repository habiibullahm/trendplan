/** Auth.js JWT session cookie names (incl. Secure-/Host- prefixes). */
export const AUTH_SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "__Host-authjs.session-token",
] as const;

export type AuthSessionCookieName = (typeof AUTH_SESSION_COOKIES)[number];

/** Match Set-Cookie attributes so Secure-/Host-prefixed cookies actually clear. */
export function authSessionCookieClearOptions(name: string) {
  const base = { path: "/" as const, maxAge: 0 };
  if (name.startsWith("__Host-") || name.startsWith("__Secure-")) {
    return { ...base, secure: true };
  }
  return base;
}

/** Base name or Auth.js chunked suffix (`.0`, `.1`, …). */
export function isAuthSessionCookie(name: string): boolean {
  return AUTH_SESSION_COOKIES.some(
    (base) => name === base || name.startsWith(`${base}.`),
  );
}
