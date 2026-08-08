"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { sendVerificationEmailForUser } from "@/app/actions/email-verification";
import {
  ActionErrors,
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";
import {
  assertRateLimits,
  getClientIp,
  withValidation,
} from "@/lib/action-middleware";
import { isEmailVerificationRequired } from "@/lib/auth-env";
import {
  REGISTER_EMAIL_LIMIT,
  REGISTER_IP_LIMIT,
} from "@/lib/auth-rate-limits";
import { loginSchema, registerSchema } from "@/lib/auth-validation";
import { DEFAULT_NICHE } from "@/lib/niches";
import { prisma } from "@/lib/prisma";

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

      return actionSuccess(ActionErrors.registerNeutral);
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
      const email = data.email.toLowerCase().trim();
      // Rate limits enforced in authorize() so /api/auth/callback is covered too.

      const user = await prisma.user.findUnique({
        where: { email },
        select: { onboardingComplete: true, emailVerified: true },
      });

      const verificationRequired = isEmailVerificationRequired();
      const needsVerify =
        verificationRequired && user && !user.emailVerified;

      try {
        await signIn("credentials", {
          email,
          password: data.password,
          redirectTo: needsVerify
            ? "/verify-email"
            : user?.onboardingComplete
              ? "/dashboard"
              : "/onboarding",
        });
      } catch (error) {
        if (error instanceof AuthError) {
          return actionError(ActionErrors.loginFailed);
        }
        throw error;
      }

      return {};
    },
  );
}
