import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";
import { isClearSessionRequestAllowed } from "@/lib/auth/clear-session-guard";
import {
  AUTH_SESSION_COOKIES,
  authSessionCookieClearOptions,
  isAuthSessionCookie,
} from "@/lib/auth/session-cookies";

const { auth } = NextAuth(authConfig);

function clearAuthCookies(res: NextResponse, request: NextRequest) {
  const toClear = new Set<string>(AUTH_SESSION_COOKIES);
  for (const cookie of request.cookies.getAll()) {
    if (isAuthSessionCookie(cookie.name)) toClear.add(cookie.name);
  }
  for (const name of toClear) {
    res.cookies.set(name, "", authSessionCookieClearOptions(name));
  }
}

function handleLogout(req: NextRequest) {
  if (!isClearSessionRequestAllowed(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const res = NextResponse.redirect(new URL("/login", req.nextUrl));
  clearAuthCookies(res, req);
  return res;
}

/**
 * Auth.js `auth()` can re-issue the session cookie on the response. Handle
 * `/logout` *outside* that wrapper so clears stick, then run the usual gate.
 */
const withAuthProxy = auth((req) => {
  if (req.auth) return;

  const staleNames = req.cookies
    .getAll()
    .map((c) => c.name)
    .filter(isAuthSessionCookie);
  if (staleNames.length === 0) return;

  const res = NextResponse.next();
  for (const name of staleNames) {
    res.cookies.set(name, "", authSessionCookieClearOptions(name));
  }
  return res;
});

export function proxy(
  ...args: Parameters<typeof withAuthProxy>
): ReturnType<typeof withAuthProxy> {
  const req = args[0];
  if (req.nextUrl.pathname === "/logout") {
    return handleLogout(req);
  }
  return withAuthProxy(...args);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
