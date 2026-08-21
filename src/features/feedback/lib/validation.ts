import { z } from "zod";

export const FEEDBACK_CATEGORIES = ["saran", "bug", "lainnya"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  saran: "Saran",
  bug: "Bug / masalah",
  lainnya: "Lainnya",
};

/** Strip C0 controls (keep \\t \\n \\r) so stored text stays safe for the admin inbox. */
export function sanitizeFeedbackMessage(raw: string): string {
  return raw
    .trim()
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export const submitFeedbackSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES, {
    error: "Pilih kategori masukan.",
  }),
  message: z
    .string()
    .transform(sanitizeFeedbackMessage)
    .pipe(
      z
        .string()
        .min(10, "Masukan minimal 10 karakter.")
        .max(1000, "Masukan maksimal 1000 karakter."),
    ),
});
