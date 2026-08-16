import {
  generateRawAuthToken,
  hashAuthToken,
} from "@/lib/auth/token-crypto";

export { generateRawAuthToken, hashAuthToken };

export const WEEK_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function createWeekInviteRawToken(): string {
  return generateRawAuthToken();
}

export function hashWeekInviteToken(rawToken: string): string {
  return hashAuthToken(rawToken);
}
