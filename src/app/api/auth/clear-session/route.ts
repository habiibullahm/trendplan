import { NextResponse } from "next/server";
import { appBaseUrl } from "@/lib/auth/env";
import { isClearSessionRequestAllowed } from "@/lib/auth/clear-session-guard";
import {
  AUTH_SESSION_COOKIES,
  authSessionCookieClearOptions,
  isAuthSessionCookie,
} from "@/lib/auth/session-cookies";

/**
 * Clears Auth.js session cookies then redirects to /login.
 * Prefer `/logout` (proxy) for app logout — Route Handlers under /api can 404
 * in some next dev / Turbopack states. This path remains for older links.
 */
export function GET(request: Request) {
  if (!isClearSessionRequestAllowed(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

export { isClearSessionRequestAllowed };
