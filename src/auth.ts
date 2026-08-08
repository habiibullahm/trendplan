import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

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
        const user = await prisma.user.findUnique({ where: { email } });
        const hash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
        const valid = await compare(parsed.data.password, hash);
        if (!user || !valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          onboardingComplete: user.onboardingComplete,
        };
      },
    }),
  ],
});
