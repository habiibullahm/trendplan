"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
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
import {
  appBaseUrl,
  createAuthToken,
  consumeAuthTokenThen,
  invalidateUnusedAuthTokens,
} from "@/lib/auth/tokens";
import { isTransactionalEmailEnabled } from "@/lib/auth/env";
import { verifyEmailTokenSchema } from "@/lib/auth/validation";
import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

const RESEND_USER_LIMIT = { limit: 3, windowMs: 60 * 60 * 1000 };
const RESEND_IP_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
const VERIFY_IP_LIMIT = { limit: 20, windowMs: 60 * 60 * 1000 };

export type EmailVerificationState = ActionResult;

export async function sendVerificationEmailForUser(
  userId: string,
  email: string,
): Promise<void> {
  if (!isTransactionalEmailEnabled()) {
    throw new Error("Email belum diaktifkan.");
  }

  const raw = await createAuthToken(userId, "EMAIL_VERIFY");
  try {
    const link = `${appBaseUrl()}/verify-email?token=${encodeURIComponent(raw)}`;
    await sendMail({
      to: email,
      subject: "Verifikasi email TrendPlan",
      text: `Verifikasi email kamu (berlaku 1 jam):\n\n${link}\n`,
      html: `<p>Verifikasi email kamu (berlaku 1 jam):</p><p><a href="${link}">${link}</a></p>`,
    });
  } catch (error) {
    await invalidateUnusedAuthTokens(userId, "EMAIL_VERIFY");
    throw error;
  }
}

async function postVerifyRedirectPath(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingComplete: true },
  });
  return user?.onboardingComplete ? "/dashboard" : "/onboarding";
}

export async function verifyEmailAction(
  _prev: EmailVerificationState,
  formData: FormData,
): Promise<EmailVerificationState> {
  return withValidation(
    verifyEmailTokenSchema,
    formData,
    (fd) => ({ token: fd.get("token") }),
    async (data) => {
      const ip = await getClientIp();
      const limited = await assertRateLimits({
        key: `email-verify:ip:${ip}`,
        options: VERIFY_IP_LIMIT,
      });
      if (limited) return limited;

      const verifiedAt = new Date();
      const consumed = await consumeAuthTokenThen(
        data.token,
        "EMAIL_VERIFY",
        async (tx, userId) => {
          await tx.user.update({
            where: { id: userId },
            data: { emailVerified: verifiedAt },
          });
          return userId;
        },
      );
      if (!consumed) return actionError(ActionErrors.verifyInvalid);

      const session = await auth();
      if (session?.user?.id === consumed) {
        const { unstable_update } = await import("@/auth");
        await unstable_update({});
        redirect(await postVerifyRedirectPath(consumed));
      }

      // Logged-out verify link: send them to login next.
      redirect("/login?verified=1");
    },
  );
}

export async function resendVerificationEmailAction(
  _prev: EmailVerificationState,
  formData: FormData,
): Promise<EmailVerificationState> {
  void formData;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return actionError(ActionErrors.unauthorized);

  if (!isTransactionalEmailEnabled()) {
    return actionError(ActionErrors.emailDisabled);
  }

  const ip = await getClientIp();
  const limited = await assertRateLimits(
    { key: `email-verify-resend:user:${userId}`, options: RESEND_USER_LIMIT },
    { key: `email-verify-resend:ip:${ip}`, options: RESEND_IP_LIMIT },
  );
  if (limited) return limited;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  });
  if (!user) return actionError(ActionErrors.unauthorized);

  if (!user.emailVerified) {
    try {
      await sendVerificationEmailForUser(userId, user.email);
    } catch {
      console.error("[email-verify] resend mail failed", userId);
    }
  }

  return actionSuccess(ActionErrors.verifySent);
}
