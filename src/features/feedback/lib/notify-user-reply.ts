import "server-only";

import { isTransactionalEmailEnabled } from "@/lib/auth/env";
import { sendMail } from "@/lib/mail";
import {
  escapeHtml,
} from "@/features/feedback/lib/notify-admins";
import {
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
} from "@/features/feedback/lib/validation";

function categoryLabel(category: string): string {
  if (category in FEEDBACK_CATEGORY_LABELS) {
    return FEEDBACK_CATEGORY_LABELS[category as FeedbackCategory];
  }
  return category;
}

function truncate(message: string, max = 200): string {
  const t = message.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function buildFeedbackReplyMail(opts: {
  category: string;
  originalMessage: string;
  reply: string;
}): { subject: string; text: string; html: string } {
  const label = categoryLabel(opts.category);
  const quote = truncate(opts.originalMessage);
  const subject = "[TrendPlan] Balasan untuk masukanmu";
  const text = [
    "Halo,",
    "",
    `Kami membalas masukanmu (${label}):`,
    "",
    `"${quote}"`,
    "",
    "Balasan:",
    opts.reply.trim(),
    "",
    "— Tim TrendPlan",
  ].join("\n");
  const html = [
    `<p>Halo,</p>`,
    `<p>Kami membalas masukanmu (<strong>${escapeHtml(label)}</strong>):</p>`,
    `<blockquote style="margin:0;padding:0.5rem 0.75rem;border-left:3px solid #ccc">${escapeHtml(quote).replace(/\n/g, "<br/>")}</blockquote>`,
    `<p><strong>Balasan:</strong></p>`,
    `<p>${escapeHtml(opts.reply.trim()).replace(/\n/g, "<br/>")}</p>`,
    `<p>— Tim TrendPlan</p>`,
  ].join("");
  return { subject, text, html };
}

/**
 * Soft-fail email to the feedback submitter.
 * @returns true if sendMail was attempted and succeeded.
 */
export async function notifyUserOfFeedbackReply(opts: {
  to: string;
  category: string;
  originalMessage: string;
  reply: string;
}): Promise<boolean> {
  try {
    if (!isTransactionalEmailEnabled()) {
      console.info(
        "[feedback] user reply notify skipped — TRANSACTIONAL_EMAIL_ENABLED off",
      );
      return false;
    }

    const mail = buildFeedbackReplyMail({
      category: opts.category,
      originalMessage: opts.originalMessage,
      reply: opts.reply,
    });

    await sendMail({
      to: opts.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    console.info("[feedback] user reply notify sent", opts.to);
    return true;
  } catch (err) {
    console.error("[feedback] user reply notify failed", opts.to, err);
    return false;
  }
}
