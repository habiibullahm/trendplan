import "server-only";

import {
  actionFail,
  type ActionResult,
} from "@/lib/action-result";
import { getSafeSession } from "@/lib/auth/session";
import { isEmailVerificationRequired } from "./env";

export type AppUserGate =
  | {
      ok: true;
      userId: string;
      onboardingComplete: boolean;
      passwordNeedsUpgrade: boolean;
    }
  | { ok: false; kind: "unauthorized" | "unverified" | "stale" };

export type GateAppUserOptions = {
  /** Default true when EMAIL_VERIFICATION_REQUIRED. */
  requireVerified?: boolean;
};

/**
 * Session gate for RSC/actions.
 * Relies on auth() JWT callback (security claims refreshed at least every
 * SECURITY_CLAIMS_MAX_AGE_MS / on session update — see jwt-claims.ts);
 * getSafeSession is React.cache'd so layout + page share one auth() call per request.
 */
export async function gateAppUser(
  options: GateAppUserOptions = {},
): Promise<AppUserGate> {
  const requireVerified = options.requireVerified !== false;
  const session = await getSafeSession();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, kind: "unauthorized" };

  // JWT callback returns null when passwordVersion is stale (or user missing).
  // A session here already passed that check for this request.
  if (
    requireVerified &&
    isEmailVerificationRequired() &&
    !session.user.emailVerified
  ) {
    return { ok: false, kind: "unverified" };
  }

  return {
    ok: true,
    userId,
    onboardingComplete: Boolean(session.user.onboardingComplete),
    passwordNeedsUpgrade: Boolean(session.user.passwordNeedsUpgrade),
  };
}

/** Maps gate failures to ActionResult. */
export async function requireAppUserAction(
  options?: GateAppUserOptions,
): Promise<{ ok: true; userId: string } | { ok: false; result: ActionResult }> {
  const gate = await gateAppUser(options);
  if (gate.ok) return gate;

  if (gate.kind === "unverified") {
    return { ok: false, result: actionFail("emailUnverified") };
  }
  if (gate.kind === "stale") {
    return { ok: false, result: actionFail("sessionStale") };
  }
  return { ok: false, result: actionFail("unauthorized") };
}
