/**
 * Pure JWT security-claim helpers (unit-tested).
 * Session update must apply these from the DB row only — never from client payload.
 */

export type UserSecurityClaimsRow = {
  onboardingComplete: boolean;
  passwordNeedsUpgrade: boolean;
  passwordVersion: number;
  emailVerified: Date | null;
};

export type JwtSecurityClaims = {
  onboardingComplete: boolean;
  passwordNeedsUpgrade: boolean;
  passwordVersion: number;
  emailVerified: string | null;
};

/**
 * Max age of JWT-embedded security claims before Node reloads them from DB.
 *
 * Intentional revoke window: other devices / stolen cookies may keep working for
 * up to this long after a passwordVersion bump or user delete, until the next
 * DB refresh. Same-tab flows (verify-email, password change, onboarding) call
 * Auth.js `update` and refresh immediately. Keep this short (≤30s).
 */
export const SECURITY_CLAIMS_MAX_AGE_MS = 30_000;

/** Map DB user security fields onto JWT claim shape. */
export function dbSecurityClaims(
  row: UserSecurityClaimsRow,
): JwtSecurityClaims {
  return {
    onboardingComplete: row.onboardingComplete,
    passwordNeedsUpgrade: row.passwordNeedsUpgrade,
    passwordVersion: row.passwordVersion,
    emailVerified: row.emailVerified
      ? row.emailVerified.toISOString()
      : null,
  };
}

/** True when JWT passwordVersion matches the DB (session still valid). */
export function isPasswordVersionCurrent(
  tokenVersion: unknown,
  dbVersion: number,
): boolean {
  const v = typeof tokenVersion === "number" ? tokenVersion : 0;
  return v === dbVersion;
}

/**
 * True when JWT passwordVersion diverges from DB.
 * Session refresh after a bump must use a signed grace cookie (not Auth.js
 * `trigger === "update"` alone — that is client-callable).
 */
export function shouldInvalidateForPasswordVersion(
  _trigger: string | undefined,
  tokenVersion: unknown,
  dbVersion: number,
): boolean {
  return !isPasswordVersionCurrent(tokenVersion, dbVersion);
}

/** Whether the Node jwt callback should reload security claims from DB. */
export function shouldRefreshSecurityClaims(opts: {
  trigger: string | undefined;
  securityClaimsAt: unknown;
  now?: number;
  maxAgeMs?: number;
}): boolean {
  if (opts.trigger === "update") return true;
  const claimsAt =
    typeof opts.securityClaimsAt === "number" ? opts.securityClaimsAt : 0;
  const maxAge = opts.maxAgeMs ?? SECURITY_CLAIMS_MAX_AGE_MS;
  return (opts.now ?? Date.now()) - claimsAt >= maxAge;
}
