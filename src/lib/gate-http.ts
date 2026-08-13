import { ActionErrors } from "@/lib/action-result";
import type { AppUserGate } from "@/lib/auth/require-app-user";

/** Map gateAppUser failure to a JSON Response (API routes). */
export function gateFailureResponse(gate: Extract<AppUserGate, { ok: false }>) {
  const status =
    gate.kind === "unauthorized"
      ? 401
      : gate.kind === "unverified"
        ? 403
        : 401;
  const error =
    gate.kind === "unverified"
      ? ActionErrors.emailUnverified
      : gate.kind === "stale"
        ? ActionErrors.sessionStale
        : ActionErrors.unauthorized;
  return Response.json({ error }, { status });
}
