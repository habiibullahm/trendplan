import { cache } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

function isJwtSessionError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "type" in error &&
    (error as { type: string }).type === "JWTSessionError"
  );
}

/**
 * auth() that treats invalid/expired JWT as logged out (no throw).
 * Unexpected failures (e.g. DB blips in the jwt callback) rethrow so callers
 * do not wipe session cookies on a transient outage.
 *
 * React.cache dedupes within one RSC request so layout + page share a single
 * auth()/JWT callback (avoids repeated User round-trips on soft nav).
 */
export const getSafeSession = cache(async () => {
  try {
    return await auth();
  } catch (error) {
    if (isJwtSessionError(error)) return null;
    throw error;
  }
});

/**
 * Node may invalidate the JWT (user missing / passwordVersion) while the
 * cookie still looks valid to the edge proxy — bare redirect("/login") leaves
 * the cookie and causes login ↔ onboarding loops.
 * Cookie writes are illegal in RSC; clear via `/logout` (proxy Set-Cookie).
 */
export function redirectToLoginClearingSession(): never {
  redirect("/logout");
}
