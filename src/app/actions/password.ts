"use server";

import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ActionErrors,
  actionError,
  actionFieldErrors,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";
import {
  PASSWORD_CHANGE_REFRESH_COOKIE,
  passwordChangeRefreshCookieOptions,
  signPasswordChangeRefresh,
} from "@/lib/password-change-refresh";
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
} from "@/lib/auth-tokens";
import { isTransactionalEmailEnabled } from "@/lib/auth-env";
import {
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/lib/auth-validation";
import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { requireAppUserAction } from "@/lib/require-app-user";

const CHANGE_USER_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
const CHANGE_IP_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };
const RESET_IP_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
const RESET_EMAIL_LIMIT = { limit: 3, windowMs: 60 * 60 * 1000 };

/** Matches bcrypt cost used elsewhere so missing emails are harder to time. */
async function equalizeResetTiming() {
  await hash("password-reset-timing", 10);
}

export type PasswordActionState = ActionResult;

export async function changePasswordAction(
  _prev: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  return withValidation(
    changePasswordSchema,
    formData,
    (fd) => ({
      currentPassword: fd.get("currentPassword"),
      newPassword: fd.get("newPassword"),
      confirmPassword: fd.get("confirmPassword"),
    }),
    async (data) => {
      // Allow change while unverified; still reject stale passwordVersion sessions.
      const gated = await requireAppUserAction({ requireVerified: false });
      if (!gated.ok) return gated.result;
      const userId = gated.userId;

      const ip = await getClientIp();
      const limited = await assertRateLimits(
        { key: `password-change:user:${userId}`, options: CHANGE_USER_LIMIT },
        { key: `password-change:ip:${ip}`, options: CHANGE_IP_LIMIT },
      );
      if (limited) return limited;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });
      if (!user) return actionError(ActionErrors.unauthorized);

      const matches = await compare(data.currentPassword, user.passwordHash);
      if (!matches) return actionError(ActionErrors.currentPasswordWrong);

      const sameAsCurrent = await compare(data.newPassword, user.passwordHash);
      if (sameAsCurrent) {
        return {
          error: ActionErrors.passwordUnchanged,
          ...actionFieldErrors({
            newPassword: [ActionErrors.passwordUnchanged],
          }),
        };
      }

      const passwordHash = await hash(data.newPassword, 10);
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          passwordNeedsUpgrade: false,
          passwordVersion: { increment: 1 },
        },
        select: { passwordVersion: true },
      });

      // Signed grace cookie for RSC race before Auth.js Set-Cookie sticks.
      const jar = await cookies();
      jar.set(
        PASSWORD_CHANGE_REFRESH_COOKIE,
        signPasswordChangeRefresh(userId, updated.passwordVersion),
        passwordChangeRefreshCookieOptions(),
      );

      const { unstable_update } = await import("@/auth");
      await unstable_update({});

      // Redirect (not actionSuccess) so the next /akun document request carries
      // Set-Cookie from unstable_update — avoids RSC refresh with a stale JWT.
      redirect("/akun?toast=password_changed");
    },
  );
}

export async function requestPasswordResetAction(
  _prev: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  return withValidation(
    requestPasswordResetSchema,
    formData,
    (fd) => ({ email: fd.get("email") }),
    async (data) => {
      // Until a verified Resend domain is configured, do not pretend mail was sent.
      if (!isTransactionalEmailEnabled()) {
        return actionError(ActionErrors.emailDisabled);
      }

      const email = data.email.toLowerCase().trim();
      const ip = await getClientIp();
      const limited = await assertRateLimits(
        { key: `password-reset:ip:${ip}`, options: RESET_IP_LIMIT },
        { key: `password-reset:email:${email}`, options: RESET_EMAIL_LIMIT },
      );
      if (limited) return limited;

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
      });

      // Always pay bcrypt cost so missing vs existing emails are closer in time.
      await equalizeResetTiming();

      if (user) {
        try {
          const raw = await createAuthToken(user.id, "PASSWORD_RESET");
          const link = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(raw)}`;
          await sendMail({
            to: user.email,
            subject: "Reset password TrendPlan",
            text: `Gunakan tautan ini untuk mengatur password baru (berlaku 1 jam):\n\n${link}\n\nJika kamu tidak meminta reset, abaikan email ini.`,
            html: `<p>Gunakan tautan ini untuk mengatur password baru (berlaku 1 jam):</p><p><a href="${link}">${link}</a></p><p>Jika kamu tidak meminta reset, abaikan email ini.</p>`,
          });
        } catch {
          console.error("[password-reset] mail failed for user", user.id);
          await invalidateUnusedAuthTokens(user.id, "PASSWORD_RESET");
        }
      }

      // Always the same client message (anti-enumeration), even if mail failed.
      return actionSuccess(ActionErrors.resetRequested);
    },
  );
}

export async function resetPasswordAction(
  _prev: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  return withValidation(
    resetPasswordSchema,
    formData,
    (fd) => ({
      token: fd.get("token"),
      newPassword: fd.get("newPassword"),
      confirmPassword: fd.get("confirmPassword"),
    }),
    async (data) => {
      const ip = await getClientIp();
      const limited = await assertRateLimits({
        key: `password-reset-consume:ip:${ip}`,
        options: RESET_IP_LIMIT,
      });
      if (limited) return limited;

      const passwordHash = await hash(data.newPassword, 10);
      const consumed = await consumeAuthTokenThen(
        data.token,
        "PASSWORD_RESET",
        async (tx, userId) => {
          await tx.user.update({
            where: { id: userId },
            data: {
              passwordHash,
              passwordNeedsUpgrade: false,
              passwordVersion: { increment: 1 },
            },
          });
          return true;
        },
      );
      if (!consumed) return actionError(ActionErrors.resetInvalid);

      redirect("/login");
    },
  );
}
