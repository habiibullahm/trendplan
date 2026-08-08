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
