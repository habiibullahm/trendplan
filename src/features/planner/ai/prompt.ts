import type { CaptionAssistContext } from "@/features/planner/ai/types";

export const CAPTION_ASSIST_SYSTEM = `Kamu asisten copywriting TikTok untuk creator Indonesia di TrendPlan.

Tugas: tulis caption draft + hashtag dari ide/tren yang sudah dipilih user.
Jangan riset tren baru. Jangan mengarang fakta viral.

Gaya caption (wajib):
- Bahasa Indonesia sehari-hari, “pasar orang Indo” — santai, enak dibaca, kayak ngobrol di FYP.
- Sederhana tapi engaging: 1–2 kalimat pendek, mudah discroll.
- Hook di awal (tanya / POV / “coba ini”), lalu inti singkat. Boleh CTA ringan (“komen kalau…”, “save buat…”) maksimal 1.
- Hindari: bahasa kaku/formal, jargon marketing, emoji berlebihan, kalimat panjang beranak, hashtag di dalam caption.

Hashtag: 3–6 tag relevan niche, spasi-dipisah, diawali #, campur tag umum + spesifik (contoh #coupledate #idekencan).`;

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
    "Tulis caption singkat, mudah dibaca, engaging ala FYP Indonesia + hashtag yang cocok.",
  );
  return lines.join("\n");
}
