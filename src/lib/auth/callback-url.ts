/**
 * Safe post-auth return paths (invite, etc.). Edge-safe — no Node APIs.
 */

/** Relative callback only — rejects protocol-relative and absolute URLs. */
export function safeAuthCallbackUrl(
  raw: string | null | undefined,
): string | null {
  const value = raw?.trim() ?? "";
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

/**
 * Append `callbackUrl` to a path (with optional existing query), keeping the
 * callback as a single encoded search param.
 */
export function withAuthCallbackQuery(
  pathWithQuery: string,
  callbackUrl: string | null | undefined,
): string {
  const safe = safeAuthCallbackUrl(callbackUrl);
  if (!safe) return pathWithQuery;

  const url = new URL(pathWithQuery, "https://local.invalid");
  url.searchParams.set("callbackUrl", safe);
  return `${url.pathname}${url.search}`;
}

/** Build `/login` with optional registered/verified flags + callback. */
export function loginPath(options?: {
  registered?: boolean;
  verified?: boolean;
  callbackUrl?: string | null;
}): string {
  const url = new URL("/login", "https://local.invalid");
  if (options?.registered) url.searchParams.set("registered", "1");
  if (options?.verified) url.searchParams.set("verified", "1");
  const safe = safeAuthCallbackUrl(options?.callbackUrl);
  if (safe) url.searchParams.set("callbackUrl", safe);
  return `${url.pathname}${url.search}`;
}

/** Build `/register` optionally carrying callbackUrl. */
export function registerPath(callbackUrl?: string | null): string {
  return withAuthCallbackQuery("/register", callbackUrl);
}
