import type { CaptionAssistContext } from "@/features/planner/ai/types";

export const CAPTION_ASSIST_SYSTEM = `Kamu asisten copywriting untuk creator TikTok Indonesia di aplikasi TrendPlan.
Tugas: tulis caption draft + hashtag dari ide/tren yang sudah dipilih user.
Jangan riset tren baru dari internet. Jangan mengarang fakta viral.
Bahasa: Bahasa Indonesia natural, singkat, siap tempel ke TikTok.
Hashtag: 3–8 tag relevan niche, spasi-dipisah, diawali #.`;

export function buildCaptionAssistPrompt(ctx: CaptionAssistContext): string {
  const lines = [
    `Niche creator: ${ctx.niche}`,
    `Judul ide: ${ctx.title}`,
  ];
  if (ctx.hook?.trim()) lines.push(`Hook: ${ctx.hook.trim()}`);
  if (ctx.trendTitle?.trim()) {
    lines.push(`Sumber tren: ${ctx.trendTitle.trim()}`);
  }
  if (ctx.trendFormat?.trim()) {
    lines.push(`Format tren: ${ctx.trendFormat.trim()}`);
  }
  if (ctx.trendReason?.trim()) {
    lines.push(`Alasan tren: ${ctx.trendReason.trim()}`);
  }
  lines.push(
    "Hasilkan caption draft dan hashtag yang cocok untuk slot konten ini.",
  );
  return lines.join("\n");
}
