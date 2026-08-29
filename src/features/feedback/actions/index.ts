"use server";

import { revalidatePath } from "next/cache";
import {
  actionErrorCode,
  actionFail,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";
import {
  assertRateLimits,
  getClientIp,
  withValidation,
} from "@/lib/action-middleware";
import { isAdminEmail } from "@/lib/auth/admin";
import { requireAppUserAction } from "@/lib/auth/require-app-user";
import { getSafeSession } from "@/lib/auth/session";
import { notifyAdminsOfFeedback } from "@/features/feedback/lib/notify-admins";
import { notifyUserOfFeedbackReply } from "@/features/feedback/lib/notify-user-reply";
import {
  replyFeedbackSchema,
  submitFeedbackSchema,
} from "@/features/feedback/lib/validation";
import { prisma } from "@/lib/prisma";

const FEEDBACK_USER_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
const FEEDBACK_IP_LIMIT = { limit: 15, windowMs: 60 * 60 * 1000 };
const REPLY_ADMIN_LIMIT = { limit: 30, windowMs: 60 * 60 * 1000 };

export type FeedbackActionState = ActionResult;

export async function submitFeedbackAction(
  _prev: FeedbackActionState,
  formData: FormData,
): Promise<FeedbackActionState> {
  const ip = await getClientIp();
  // Before validation/auth so anonymous spam cannot burn CPU or session lookups.
  const ipLimited = await assertRateLimits({
    key: `feedback:ip:${ip}`,
    options: FEEDBACK_IP_LIMIT,
  });
  if (ipLimited) return ipLimited;

  return withValidation(
    submitFeedbackSchema,
    formData,
    (fd) => ({
      category: fd.get("category"),
      message: fd.get("message"),
    }),
    async (data) => {
      const gated = await requireAppUserAction();
      if (!gated.ok) return gated.result;
      const userId = gated.userId;

      const userLimited = await assertRateLimits({
        key: `feedback:user:${userId}`,
        options: FEEDBACK_USER_LIMIT,
      });
      if (userLimited) return userLimited;

      try {
        await prisma.feedback.create({
          data: {
            userId,
            category: data.category,
            message: data.message,
          },
        });
      } catch (err) {
        console.error("[feedback] create failed", err);
        return actionErrorCode("generic");
      }

      try {
        const submitter = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });
        await notifyAdminsOfFeedback({
          category: data.category,
          message: data.message,
          submitterEmail: submitter?.email ?? userId,
        });
      } catch (err) {
        console.error("[feedback] admin notify wrapper failed", err);
      }

      return actionSuccess("Terima kasih — masukanmu sudah terkirim.");
    },
  );
}

async function requireAdminActionEmail(): Promise<
  | { ok: true; userId: string; email: string }
  | { ok: false; result: ActionResult }
> {
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated;

  const session = await getSafeSession();
  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  if (sessionEmail && isAdminEmail(sessionEmail)) {
    return { ok: true, userId: gated.userId, email: sessionEmail };
  }

  const user = await prisma.user.findUnique({
    where: { id: gated.userId },
    select: { email: true },
  });
  const email = user?.email?.trim().toLowerCase() ?? "";
  if (!isAdminEmail(email)) {
    return { ok: false, result: actionFail("unauthorized") };
  }
  return { ok: true, userId: gated.userId, email };
}

export async function replyToFeedbackAction(
  _prev: FeedbackActionState,
  formData: FormData,
): Promise<FeedbackActionState> {
  const admin = await requireAdminActionEmail();
  if (!admin.ok) return admin.result;

  const limited = await assertRateLimits({
    key: `feedback:reply:${admin.userId}`,
    options: REPLY_ADMIN_LIMIT,
  });
  if (limited) return limited;

  return withValidation(
    replyFeedbackSchema,
    formData,
    (fd) => ({
      feedbackId: fd.get("feedbackId"),
      reply: fd.get("reply"),
    }),
    async (data) => {
      const row = await prisma.feedback.findUnique({
        where: { id: data.feedbackId },
        select: {
          id: true,
          category: true,
          message: true,
          user: { select: { email: true } },
        },
      });
      if (!row) {
        return actionFail("not_found", {
          message: "Masukan tidak ditemukan.",
        });
      }

      try {
        await prisma.feedback.update({
          where: { id: row.id },
          data: {
            adminReply: data.reply,
            repliedAt: new Date(),
            repliedByEmail: admin.email,
          },
        });
      } catch (err) {
        console.error("[feedback] reply update failed", err);
        return actionErrorCode("generic");
      }

      const mailed = await notifyUserOfFeedbackReply({
        to: row.user.email,
        category: row.category,
        originalMessage: row.message,
        reply: data.reply,
      });

      revalidatePath("/admin/feedback");

      if (mailed) {
        return actionSuccess("Balasan tersimpan dan email dikirim.");
      }
      return actionSuccess(
        "Balasan tersimpan. Email tidak terkirim (cek pengaturan email).",
      );
    },
  );
}
