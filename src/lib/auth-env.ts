/**
 * Edge-safe auth env helpers (no Prisma / server-only).
 * Used by middleware auth.config and Node auth/mail paths.
 */

export function isEmailVerificationRequired(): boolean {
  const raw = process.env.EMAIL_VERIFICATION_REQUIRED;
  if (raw === "false" || raw === "0") return false;
  if (raw === "true" || raw === "1") return true;
  // Default: require in production, soft in local/dev.
  return process.env.NODE_ENV === "production";
}

/** Canonical app origin for reset/verify links. */
export function appBaseUrl(): string {
  const fromEnv =
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  if (process.env.NODE_ENV === "production") {
    console.error(
      "[auth] AUTH_URL missing in production — refusing localhost mail links.",
    );
    throw new Error("AUTH_URL belum dikonfigurasi.");
  }

  return "http://localhost:3000";
}
