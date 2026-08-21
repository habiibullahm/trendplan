"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { sendVerificationEmailForUser } from "@/lib/auth/send-verification-email";
import {
  actionErrorCode,
  type ActionResult,
} from "@/lib/action-result";
import {
  assertRateLimits,
  getClientIp,
  withValidation,
} from "@/lib/action-middleware";
import { isEmailVerificationRequired } from "@/lib/auth/env";
import {
  REGISTER_EMAIL_LIMIT,
  REGISTER_IP_LIMIT,
} from "@/lib/auth/rate-limits";
import { loginSchema, registerSchema } from "@/lib/auth/validation";
import { DEFAULT_NICHE } from "@/lib/niches";
import { prisma } from "@/lib/prisma";
import {
  loginPath,
  safeAuthCallbackUrl,
} from "@/lib/auth/callback-url";

export type AuthFormState = ActionResult;

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  return withValidation(
    registerSchema,
    formData,
    (fd) => ({
      name: fd.get("name"),
      email: fd.get("email"),
      password: fd.get("password"),
    }),
    async (data) => {
      const email = data.email.toLowerCase().trim();
      const ip = await getClientIp();
      const limited = await assertRateLimits(
        { key: `register:ip:${ip}`, options: REGISTER_IP_LIMIT },
        { key: `register:email:${email}`, options: REGISTER_EMAIL_LIMIT },
      );
      if (limited) return limited;

      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existing) {
        await hash(data.password, 10);
      } else {
        const passwordHash = await hash(data.password, 10);
        const verificationRequired = isEmailVerificationRequired();
        const user = await prisma.user.create({
          data: {
            email,
            name: data.name,
            passwordHash,
            niche: DEFAULT_NICHE,
            weeklyGoal: 3,
            onboardingComplete: false,
            passwordNeedsUpgrade: false,
            emailVerified: verificationRequired ? null : new Date(),
          },
        });

        if (verificationRequired) {
          try {
            await sendVerificationEmailForUser(user.id, user.email);
          } catch {
            console.error("[register] verification mail failed", user.id);
          }
        }
      }

      const callbackUrl = safeAuthCallbackUrl(
        String(formData.get("callbackUrl") ?? ""),
      );
      // Same path for new + existing email (anti-enumeration).
      redirect(loginPath({ registered: true, callbackUrl }));
    },
  );
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  return withValidation(
    loginSchema,
    formData,
    (fd) => ({
      email: fd.get("email"),
      password: fd.get("password"),
    }),
    async (data) => {
      // Redirect target is coarse; verify/onboarding gates run on the destination.
      // Skipping a pre-signIn User.findUnique saves a Neon RTT (authorize loads the user).
      const safeCallback = safeAuthCallbackUrl(
        String(formData.get("callbackUrl") ?? ""),
      );
      const redirectTo = safeCallback ?? "/dashboard";

      try {
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirectTo,
        });
      } catch (error) {
        if (error instanceof AuthError) {
          return actionErrorCode("loginFailed");
        }
        throw error;
      }

      return { status: "success" };
    },
  );
}
