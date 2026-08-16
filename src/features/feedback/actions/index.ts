"use server";

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
import { requireAppUserAction } from "@/lib/auth/require-app-user";
import { submitFeedbackSchema } from "@/features/feedback/lib/validation";
import { prisma } from "@/lib/prisma";

const FEEDBACK_USER_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
const FEEDBACK_IP_LIMIT = { limit: 15, windowMs: 60 * 60 * 1000 };

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
        return actionError(ActionErrors.generic);
      }

      return actionSuccess("Terima kasih — masukanmu sudah terkirim.");
    },
  );
}
