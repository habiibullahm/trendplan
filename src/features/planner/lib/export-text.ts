/** Plain-text helpers for caption/hashtag saran and clipboard paste — no DOM. */

export const DEFAULT_HASHTAGS = "#coupledate #dateideas #tiktok";

export function suggestCaption(input: {
  title: string;
  hook?: string | null;
}): string {
  const title = input.title.trim();
  const hook = input.hook?.trim() ?? "";
  if (!title && !hook) return "";
  if (!hook) return title;
  if (!title) return hook;
  return `${title}\n\n${hook}`;
}

export function suggestHashtags(): string {
  return DEFAULT_HASHTAGS;
}

export function formatItemPaste(input: {
  title: string;
  hook?: string | null;
  caption?: string | null;
  hashtags?: string | null;
}): string {
  const caption = input.caption?.trim() ?? "";
  const body =
    caption ||
    suggestCaption({ title: input.title, hook: input.hook ?? null });
  const tags = input.hashtags?.trim() ?? "";
  if (!body && !tags) return "";
  if (!tags) return body;
  if (!body) return tags;
  return `${body}\n\n${tags}`;
}

export type WeekPasteItem = {
  dayOfWeek: number;
  title: string;
  statusLabel: string;
  dayLabel: string;
};

export function formatWeekPaste(
  items: WeekPasteItem[],
  weekLabel: string,
): string {
  const lines = items.map(
    (item) => `${item.dayLabel} · ${item.title} · ${item.statusLabel}`,
  );
  return [`Rencana minggu · ${weekLabel}`, ...lines].join("\n");
}
