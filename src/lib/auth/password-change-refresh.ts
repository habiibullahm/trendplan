import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Short-lived signed httpOnly cookie set when the current browser changes password.
 * Lets the next RSC request (often racing before Auth.js Set-Cookie applies)
 * refresh JWT claims instead of invalidating → clear-session.
 *
 * Value is HMAC-bound to userId + passwordVersion + expiry so a stolen JWT
 * cannot be revived by forging a bare version integer.
 */
export const PASSWORD_CHANGE_REFRESH_COOKIE = "trendplan.pw-refresh";

const MAX_AGE_SEC = 60;
const PARTS = 4;

function refreshSecret(explicit?: string): string | null {
  const secret =
    explicit ?? process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  return secret && secret.length > 0 ? secret : null;
}

function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signPayload(payload: string, secret: string): string {
  return base64url(createHmac("sha256", secret).update(payload).digest());
}

function safeEqualB64Url(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function passwordChangeRefreshCookieOptions() {
  return {
    httpOnly: true,
    path: "/" as const,
    sameSite: "lax" as const,
    maxAge: MAX_AGE_SEC,
    secure: process.env.NODE_ENV === "production",
  };
}

/** Clear attributes (same path/flags as set). */
export function passwordChangeRefreshClearOptions() {
  return {
    httpOnly: true,
    path: "/" as const,
    sameSite: "lax" as const,
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  };
}

export type SignPasswordChangeRefreshOptions = {
  secret?: string;
  nowMs?: number;
  ttlSec?: number;
};

/** Build signed cookie value: userId.version.exp.sig */
export function signPasswordChangeRefresh(
  userId: string,
  passwordVersion: number,
  options: SignPasswordChangeRefreshOptions = {},
): string {
  const secret = refreshSecret(options.secret);
  if (!secret) {
    throw new Error("AUTH_SECRET required to sign password-change refresh");
  }
  if (!userId || !Number.isInteger(passwordVersion) || passwordVersion < 0) {
    throw new Error("Invalid password-change refresh inputs");
  }

  const ttlSec = options.ttlSec ?? MAX_AGE_SEC;
  const nowMs = options.nowMs ?? Date.now();
  const exp = Math.floor(nowMs / 1000) + ttlSec;
  const payload = `${userId}.${passwordVersion}.${exp}`;
  const sig = signPayload(payload, secret);
  return `${payload}.${sig}`;
}

export type VerifyPasswordChangeRefreshOptions = {
  secret?: string;
  nowMs?: number;
};

/**
 * True when cookie is a valid HMAC for this userId and DB passwordVersion,
 * and not expired.
 */
export function verifyPasswordChangeRefresh(
  cookieValue: string | undefined,
  userId: string,
  passwordVersion: number,
  options: VerifyPasswordChangeRefreshOptions = {},
): boolean {
  if (!cookieValue || !userId) return false;
  const secret = refreshSecret(options.secret);
  if (!secret) return false;

  const parts = cookieValue.split(".");
  if (parts.length !== PARTS) return false;

  const [cookieUserId, versionRaw, expRaw, sig] = parts;
  if (!cookieUserId || !versionRaw || !expRaw || !sig) return false;
  if (cookieUserId !== userId) return false;

  const version = Number(versionRaw);
  if (!Number.isInteger(version) || version !== passwordVersion) return false;

  const exp = Number(expRaw);
  if (!Number.isFinite(exp)) return false;
  const nowSec = Math.floor((options.nowMs ?? Date.now()) / 1000);
  if (nowSec > exp) return false;

  const payload = `${cookieUserId}.${versionRaw}.${expRaw}`;
  const expected = signPayload(payload, secret);
  return safeEqualB64Url(sig, expected);
}
