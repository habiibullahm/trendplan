import { z } from "zod";

export const captionAssistSchema = z.object({
  caption: z
    .string()
    .describe("Draft caption TikTok dalam Bahasa Indonesia, 1–4 kalimat."),
  hashtags: z
    .string()
    .describe(
      "Satu baris hashtag dipisah spasi, diawali #, tanpa emoji berlebih.",
    ),
});

export type CaptionAssistResult = z.infer<typeof captionAssistSchema> & {
  source: "ai" | "template";
};

export type CaptionAssistContext = {
  title: string;
  hook: string | null;
  niche: string;
  trendTitle?: string | null;
  trendReason?: string | null;
  trendFormat?: string | null;
};
