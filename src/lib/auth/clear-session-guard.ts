import { appBaseUrl } from "@/lib/auth/env";

/**
 * CSRF guard for session-clear navigations (logout / orphan JWT wipe).
 * Allow when Origin/Referer absent; otherwise require same origin as the
 * incoming request and/or configured AUTH_URL (local vs prod mismatch).
 */
export function isClearSessionRequestAllowed(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");
  if (!originHeader && !refererHeader) return true;

  const allowed = new Set<string>();
  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    /* ignore */
  }
  try {
    allowed.add(new URL(`${appBaseUrl()}/`).origin);
  } catch {
    /* ignore */
  }
  if (allowed.size === 0) return false;

  if (originHeader) {
    try {
      return allowed.has(new URL(originHeader).origin);
    } catch {
      return false;
    }
  }

  try {
    return allowed.has(new URL(refererHeader!).origin);
  } catch {
    return false;
  }
}
