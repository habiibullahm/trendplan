/** Shared Groq caption budget — Pakai and Bantu AI. */
export const CAPTION_AI_RATE = {
  limit: 20,
  windowMs: 60 * 60 * 1000,
} as const;

export function captionAiRateKey(userId: string): string {
  return `ai-caption:${userId}`;
}
