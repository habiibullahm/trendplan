import "server-only";

import { isTransactionalEmailEnabled } from "@/lib/auth/env";
import {
  classifyResendFailure,
  isMailSendError,
  MailSendError,
} from "@/lib/mail/errors";

export {
  classifyResendFailure,
  isMailSendError,
  MailSendError,
  type MailErrorCode,
} from "@/lib/mail/errors";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

/**
 * Thin mail abstraction: Resend when transactional email is enabled and
 * RESEND_API_KEY is set; otherwise log to the server console (dev only).
 * Never returns the message body to the client.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  // Off until a verified domain is configured (see TRANSACTIONAL_EMAIL_ENABLED).
  if (!isTransactionalEmailEnabled()) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[mail] Transactional email disabled — set TRANSACTIONAL_EMAIL_ENABLED=true after verifying a Resend domain.",
      );
      throw new MailSendError("disabled");
    }
    console.info(
      [
        "",
        "======== TrendPlan mail (dev — transactional email off) ========",
        `To: ${message.to}`,
        `Subject: ${message.subject}`,
        "",
        message.text,
        "===============================================================",
        "",
      ].join("\n"),
    );
    return;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() || "TrendPlan <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[mail] RESEND_API_KEY missing in production — refusing to send or log tokens.",
      );
      throw new MailSendError("not_configured");
    }
    console.info(
      [
        "",
        "======== TrendPlan mail (dev — no RESEND_API_KEY) ========",
        `To: ${message.to}`,
        `Subject: ${message.subject}`,
        "",
        message.text,
        "=========================================================",
        "",
      ].join("\n"),
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[mail] Resend failed", res.status, body);
      throw new MailSendError(classifyResendFailure(res.status, body));
    }
  } catch (error) {
    if (isMailSendError(error)) throw error;
    console.error("[mail] unexpected send failure", error);
    throw new MailSendError("generic");
  }
}
