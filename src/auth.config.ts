import type { NextAuthConfig } from "next-auth";
import { isEmailVerificationRequired } from "@/lib/auth/env";
import {
  safeAuthCallbackUrl,
  withAuthCallbackQuery,
} from "@/lib/auth/callback-url";

function postAuthHome(
  nextUrl: URL,
  done: boolean,
  callbackRaw: string | null,
): URL {
  const callback = safeAuthCallbackUrl(callbackRaw);
  if (done) {
    return new URL(callback ?? "/dashboard", nextUrl);
  }
  return new URL(withAuthCallbackQuery("/onboarding", callback), nextUrl);
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // Absolute session lifetime (Auth.js default is 30 days).
    maxAge: 7 * 24 * 60 * 60,
  },
  logger: {
    error(error) {
      // Stale cookie after AUTH_SECRET change — treat as logged out
      if (
        error &&
        typeof error === "object" &&
        "type" in error &&
        (error as { type: string }).type === "JWTSessionError"
      ) {
        return;
      }
      console.error(
        `[auth][error]`,
        error instanceof Error ? error.message : error,
      );
    },
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isAuthPage =
        path === "/login" ||
        path === "/register" ||
        path === "/forgot-password";
      // Public so email links work while logged out or with a stale session.
      const isResetPage = path.startsWith("/reset-password");
      const isVerifyPage = path.startsWith("/verify-email");
      const isProtected =
        path.startsWith("/dashboard") ||
        path.startsWith("/onboarding") ||
        path.startsWith("/tren") ||
        path.startsWith("/rekomendasi") ||
        path.startsWith("/planner") ||
        path.startsWith("/riwayat") ||
        path.startsWith("/akun") ||
        path.startsWith("/invite");

      // Reset links must work even if the user still has a session cookie.
      if (isResetPage) return true;

      if (isAuthPage || isVerifyPage) {
        if (isLoggedIn) {
          const needsVerify =
            isEmailVerificationRequired() && !auth.user?.emailVerified;
          const queryCallback = nextUrl.searchParams.get("callbackUrl");

          if (isVerifyPage) {
            // Stay on verify until done; leave once verified.
            if (!needsVerify) {
              const done = Boolean(auth.user?.onboardingComplete);
              return Response.redirect(
                postAuthHome(nextUrl, done, queryCallback),
              );
            }
            return true;
          }

          if (needsVerify) {
            return Response.redirect(
              new URL(
                withAuthCallbackQuery("/verify-email", queryCallback),
                nextUrl,
              ),
            );
          }
          const done = Boolean(auth.user?.onboardingComplete);
          return Response.redirect(postAuthHome(nextUrl, done, queryCallback));
        }
        return true;
      }

      if (isProtected) {
        if (!isLoggedIn) return false;

        const needsVerify =
          isEmailVerificationRequired() && !auth.user?.emailVerified;
        if (needsVerify) {
          const returnTo = `${path}${nextUrl.search}`;
          return Response.redirect(
            new URL(
              withAuthCallbackQuery("/verify-email", returnTo),
              nextUrl,
            ),
          );
        }

        const done = Boolean(auth.user?.onboardingComplete);
        if (!done && !path.startsWith("/onboarding")) {
          const returnTo = `${path}${nextUrl.search}`;
          return Response.redirect(
            new URL(withAuthCallbackQuery("/onboarding", returnTo), nextUrl),
          );
        }
        if (done && path.startsWith("/onboarding")) {
          const callback = safeAuthCallbackUrl(
            nextUrl.searchParams.get("callbackUrl"),
          );
          return Response.redirect(new URL(callback ?? "/dashboard", nextUrl));
        }
      }

      return true;
    },
    jwt({ token, user }) {
      // Initial sign-in only. Session "update" must not trust client payload —
      // Node jwt callback in auth.ts reloads security claims from the DB.
      if (user) {
        token.id = user.id;
        token.onboardingComplete = Boolean(user.onboardingComplete);
        token.passwordNeedsUpgrade = Boolean(user.passwordNeedsUpgrade);
        token.passwordVersion =
          typeof user.passwordVersion === "number" ? user.passwordVersion : 0;
        token.emailVerified = user.emailVerified
          ? new Date(user.emailVerified).toISOString()
          : null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.onboardingComplete = Boolean(token.onboardingComplete);
        session.user.passwordNeedsUpgrade = Boolean(token.passwordNeedsUpgrade);
        session.user.passwordVersion =
          typeof token.passwordVersion === "number" ? token.passwordVersion : 0;
        (session.user as { emailVerified: string | null }).emailVerified =
          typeof token.emailVerified === "string" ? token.emailVerified : null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
