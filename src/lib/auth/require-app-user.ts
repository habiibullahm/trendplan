import "server-only";

import { auth } from "@/auth";
import {
  actionFail,
  type ActionResult,
} from "@/lib/action-result";
import { isEmailVerificationRequired } from "./env";
import { isPasswordVersionCurrent } from "./jwt-claims";
import { prisma } from "@/lib/prisma";

export type AppUserGate =
  | { ok: true; userId: string }
  | { ok: false; kind: "unauthorized" | "unverified" | "stale" };

export type GateAppUserOptions = {
  /** Default true when EMAIL_VERIFICATION_REQUIRED. */
  requireVerified?: boolean;
};

/** Session gate (passwordVersion + optional emailVerified). */
export async function gateAppUser(
  options: GateAppUserOptions = {},
): Promise<AppUserGate> {
  const requireVerified = options.requireVerified !== false;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, kind: "unauthorized" };

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true, passwordVersion: true },
  });
  if (!row) return { ok: false, kind: "unauthorized" };

  if (
    !isPasswordVersionCurrent(session.user.passwordVersion, row.passwordVersion)
  ) {
    return { ok: false, kind: "stale" };
  }

  if (
    requireVerified &&
    isEmailVerificationRequired() &&
    !row.emailVerified
  ) {
    return { ok: false, kind: "unverified" };
  }

  return { ok: true, userId };
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
