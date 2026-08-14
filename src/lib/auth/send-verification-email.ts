import "server-only";

import {
  appBaseUrl,
  isTransactionalEmailEnabled,
} from "@/lib/auth/env";
import {
  createAuthToken,
  invalidateUnusedAuthTokens,
} from "@/lib/auth/tokens";
import { sendMail } from "@/lib/mail";

/**
 * Internal helper — not a Server Action. Call only from trusted server paths
 * (register, resend) after the caller has authenticated / authorized the user.
 */
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
