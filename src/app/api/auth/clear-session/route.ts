import { NextResponse } from "next/server";
import { appBaseUrl } from "@/lib/auth/env";
import {
  AUTH_SESSION_COOKIES,
  authSessionCookieClearOptions,
  isAuthSessionCookie,
} from "@/lib/auth/session-cookies";

/**
 * Clears Auth.js session cookies then redirects to /login.
 * Cookie writes are illegal in RSC — call this via redirect() from Server Components
 * when Node auth() is empty but the edge still sees a JWT (orphan cookie).
 *
 * GET is intentional for RSC redirect(); treat as panic logout (logout CSRF risk).
 */
export function GET(request: Request) {
  let loginUrl: URL;
  try {
    loginUrl = new URL("/login", `${appBaseUrl()}/`);
  } catch {
    loginUrl = new URL("/login", request.url);
  }

  const response = NextResponse.redirect(loginUrl);

  const present = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter(Boolean);

  const toClear = new Set<string>(AUTH_SESSION_COOKIES);
  for (const name of present) {
    if (isAuthSessionCookie(name)) toClear.add(name);
  }

  for (const name of toClear) {
    response.cookies.set(name, "", authSessionCookieClearOptions(name));
  }

  return response;
}
