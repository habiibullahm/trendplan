import { z } from "zod";

/** Soft caps so assist output cannot bloat planner fields / DB. */
export const CAPTION_ASSIST_MAX_CAPTION = 2000;
export const CAPTION_ASSIST_MAX_HASHTAGS = 500;

/** Schema for generateObject — no hard max (clamp after parse instead). */
export const captionAssistSchema = z.object({
  caption: z
    .string()
    .describe(
      "Caption TikTok 1–2 kalimat: hook di depan, Bahasa Indonesia untuk konten (bukan chat), tanpa hashtag di dalam teks.",
    ),
  hashtags: z
    .string()
    .describe(
      "3–6 hashtag dipisah spasi, diawali #, relevan niche, tanpa emoji.",
    ),
});

/** Why template saran was used instead of the model. */
export type CaptionAssistReason =
  | "disabled"
  | "missing_key"
  | "quota"
  | "unsupported_model"
  | "error";

export type CaptionAssistResult = z.infer<typeof captionAssistSchema> & {
  source: "ai" | "template";
  reason?: CaptionAssistReason;
};

export function clampAssistText(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

/** Hide missing_key from production clients (same UX as disabled). */
export function publicAssistReason(
  reason: CaptionAssistReason | undefined,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): CaptionAssistReason | undefined {
  if (reason === "missing_key" && nodeEnv === "production") {
    return "disabled";
  }
  return reason;
}

export type CaptionAssistContext = {
  title: string;
  hook: string | null;
  niche: string;
  trendTitle?: string | null;
  trendReason?: string | null;
  trendFormat?: string | null;
};
