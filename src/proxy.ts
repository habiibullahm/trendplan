import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import {
  authSessionCookieClearOptions,
  isAuthSessionCookie,
} from "@/lib/auth-session-cookies";

const { auth } = NextAuth(authConfig);

/** Clear stale JWT cookies (e.g. after AUTH_SECRET change) so auth() stops failing. */
export const proxy = auth((req) => {
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

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
