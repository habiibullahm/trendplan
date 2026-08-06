import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "__Host-authjs.session-token",
] as const;

/** Clear stale JWT cookies (e.g. after AUTH_SECRET change) so auth() stops failing. */
export const proxy = auth((req) => {
  if (req.auth) return;

  const hasStale = SESSION_COOKIES.some((name) => req.cookies.has(name));
  if (!hasStale) return;

  const res = NextResponse.next();
  for (const name of SESSION_COOKIES) {
    if (req.cookies.has(name)) {
      res.cookies.set(name, "", { path: "/", maxAge: 0 });
    }
  }
  return res;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
