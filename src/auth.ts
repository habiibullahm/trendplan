import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { getClientIp } from "@/lib/action-middleware";
import {
  LOGIN_EMAIL_LIMIT,
  LOGIN_IP_LIMIT,
} from "@/lib/auth/rate-limits";
import {
  dbSecurityClaims,
  shouldInvalidateForPasswordVersion,
  shouldRefreshSecurityClaims,
} from "@/lib/auth/jwt-claims";
import { passwordSchema } from "@/lib/auth/validation";
import {
  PASSWORD_CHANGE_REFRESH_COOKIE,
  passwordChangeRefreshClearOptions,
  verifyPasswordChangeRefresh,
} from "@/lib/auth/password-change-refresh";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const credentialsSchema = z.object({
  email: z.email(),
  // min(1) keeps legacy short passwords working; max caps bcrypt DoS.
  password: z.string().min(1).max(128),
});

/** Precomputed bcrypt hash — used when no user row so compare timing is similar. */
const DUMMY_PASSWORD_HASH =
  "$2b$10$nGLCsnO9cU1wRCHyj3Kg7eGRHiTLgep8PRVfpx0XF5s0w.UIj4Yxa";

/**
 * Prefer AUTH_URL in production. Enable trustHost only when explicitly set
 * or on Vercel (platform sets forwarded host safely). Self-hosted: set AUTH_URL
 * and leave AUTH_TRUST_HOST unset/false unless the edge strips untrusted
 * X-Forwarded-Host.
 */
const trustHost =
  process.env.AUTH_TRUST_HOST === "true" || process.env.VERCEL === "1";

const baseJwt = authConfig.callbacks?.jwt;
const baseSession = authConfig.callbacks?.session;

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  trustHost,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const ip = await getClientIp();
        // Same buckets as loginAction — covers direct /api/auth/callback/credentials.
        const ipLimit = await checkRateLimit(`login:ip:${ip}`, LOGIN_IP_LIMIT);
        if (!ipLimit.ok) return null;
        const emailLimit = await checkRateLimit(
          `login:email:${email}`,
          LOGIN_EMAIL_LIMIT,
        );
        if (!emailLimit.ok) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        const storedHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
        const valid = await compare(parsed.data.password, storedHash);
        if (!user || !valid) return null;

        const needsUpgrade = !passwordSchema.safeParse(parsed.data.password)
          .success;
        if (user.passwordNeedsUpgrade !== needsUpgrade) {
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordNeedsUpgrade: needsUpgrade },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          onboardingComplete: user.onboardingComplete,
          emailVerified: user.emailVerified,
          passwordNeedsUpgrade: needsUpgrade,
          passwordVersion: user.passwordVersion,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const token = baseJwt
        ? await baseJwt(params)
        : params.token;

      if (!token) return token;

      // Sign-in already stamped claims from authorize().
      if (params.user) {
        token.securityClaimsAt = Date.now();
        return token;
      }
      if (typeof token.id !== "string") return token;

      // Soft-nav hits auth() often. Reload security claims on `update` or when
      // SECURITY_CLAIMS_MAX_AGE_MS elapses (documented ≤30s revoke window for
      // passwordVersion / deleted user on other sessions). Verify / password /
      // onboarding call unstable_update and refresh immediately.
      if (
        !shouldRefreshSecurityClaims({
          trigger: params.trigger,
          securityClaimsAt: token.securityClaimsAt,
        })
      ) {
        return token;
      }

      const row = await prisma.user.findUnique({
        where: { id: token.id },
        select: {
          onboardingComplete: true,
          passwordNeedsUpgrade: true,
          passwordVersion: true,
          emailVerified: true,
        },
      });
      if (!row) return null;

      // passwordVersion bump invalidates JWTs unless this browser holds a
      // signed grace cookie from changePasswordAction (RSC race / update).
      const invalidate = shouldInvalidateForPasswordVersion(
        params.trigger,
        token.passwordVersion,
        row.passwordVersion,
      );
      if (invalidate) {
        try {
          const jar = await cookies();
          const grace = jar.get(PASSWORD_CHANGE_REFRESH_COOKIE)?.value;
          if (
            !verifyPasswordChangeRefresh(
              grace,
              token.id,
              row.passwordVersion,
            )
          ) {
            return null;
          }
          // Keep cookie through Auth.js `update` so the follow-up RSC can
          // still race-refresh; clear on the next non-update request.
          if (params.trigger !== "update") {
            jar.set(
              PASSWORD_CHANGE_REFRESH_COOKIE,
              "",
              passwordChangeRefreshClearOptions(),
            );
          }
        } catch {
          return null;
        }
      } else {
        // Opportunistic cleanup after session already matches DB.
        try {
          const jar = await cookies();
          if (jar.get(PASSWORD_CHANGE_REFRESH_COOKIE)?.value) {
            jar.set(
              PASSWORD_CHANGE_REFRESH_COOKIE,
              "",
              passwordChangeRefreshClearOptions(),
            );
          }
        } catch {
          // ignore
        }
      }

      Object.assign(token, dbSecurityClaims(row), {
        securityClaimsAt: Date.now(),
      });
      return token;
    },
    async session(params) {
      if (!params.token?.id) {
        return { ...params.session, user: undefined as never };
      }
      if (baseSession) return baseSession(params);
      return params.session;
    },
  },
});
