import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
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
      const isAuthPage = path === "/login" || path === "/register";
      const isProtected =
        path.startsWith("/dashboard") ||
        path.startsWith("/onboarding") ||
        path.startsWith("/tren") ||
        path.startsWith("/rekomendasi") ||
        path.startsWith("/planner") ||
        path.startsWith("/riwayat") ||
        path.startsWith("/akun");

      if (isAuthPage) {
        if (isLoggedIn) {
          const done = Boolean(auth.user?.onboardingComplete);
          return Response.redirect(
            new URL(done ? "/dashboard" : "/onboarding", nextUrl),
          );
        }
        return true;
      }

      if (isProtected) {
        if (!isLoggedIn) return false;
        const done = Boolean(auth.user?.onboardingComplete);
        if (!done && !path.startsWith("/onboarding")) {
          return Response.redirect(new URL("/onboarding", nextUrl));
        }
        if (done && path.startsWith("/onboarding")) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.onboardingComplete = Boolean(user.onboardingComplete);
      }
      if (trigger === "update" && session?.user) {
        token.onboardingComplete = Boolean(session.user.onboardingComplete);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.onboardingComplete = Boolean(token.onboardingComplete);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
