import "server-only";

import { parseAdminEmails } from "@/lib/auth/admin";
import {
  appBaseUrl,
  isTransactionalEmailEnabled,
} from "@/lib/auth/env";
import { sendMail } from "@/lib/mail";
import {
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
} from "@/features/feedback/lib/validation";

export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

/** Prefer appBaseUrl; never throw (notify must stay soft-fail). */
export function feedbackInboxUrl(): string {
  try {
    return `${appBaseUrl()}/admin/feedback`;
  } catch (err) {
    console.error("[feedback] appBaseUrl failed for notify link", err);
    const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
    if (vercel) return `https://${vercel}/admin/feedback`;
    return "http://localhost:3000/admin/feedback";
  }
}

export function buildFeedbackNotifyMail(opts: {
  category: string;
  message: string;
  submitterEmail: string;
  inboxUrl: string;
}): { subject: string; text: string; html: string } {
  const label = categoryLabel(opts.category);
  const preview = truncate(opts.message);
  const subject = `[TrendPlan] Masukan baru · ${label}`;
  const text = [
    `Masukan baru (${label})`,
    "",
    `Dari: ${opts.submitterEmail}`,
    "",
    preview,
    "",
    `Buka inbox: ${opts.inboxUrl}`,
  ].join("\n");
  const html = [
    `<p><strong>Masukan baru (${escapeHtml(label)})</strong></p>`,
    `<p>Dari: ${escapeHtml(opts.submitterEmail)}</p>`,
    `<p>${escapeHtml(preview).replace(/\n/g, "<br/>")}</p>`,
    `<p><a href="${escapeHtml(opts.inboxUrl)}">Buka inbox</a></p>`,
  ].join("");
  return { subject, text, html };
}

/** Soft-fail notify to ADMIN_EMAILS. Never throws to the submit path. */
export async function notifyAdminsOfFeedback(opts: {
  category: string;
  message: string;
  submitterEmail: string;
}): Promise<void> {
  try {
    if (!isTransactionalEmailEnabled()) {
      console.info(
        "[feedback] admin notify skipped — TRANSACTIONAL_EMAIL_ENABLED off",
      );
      return;
    }

    const admins = parseAdminEmails();
    if (admins.length === 0) {
      console.info("[feedback] admin notify skipped — ADMIN_EMAILS empty");
      return;
    }

    const mail = buildFeedbackNotifyMail({
      ...opts,
      inboxUrl: feedbackInboxUrl(),
    });

    const results = await Promise.allSettled(
      admins.map((to) =>
        sendMail({
          to,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        }),
      ),
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i]!;
      const to = admins[i]!;
      if (result.status === "rejected") {
        console.error("[feedback] admin notify failed", to, result.reason);
      } else {
        console.info("[feedback] admin notify sent", to);
      }
    }
  } catch (err) {
    console.error("[feedback] admin notify unexpected failure", err);
  }
}
