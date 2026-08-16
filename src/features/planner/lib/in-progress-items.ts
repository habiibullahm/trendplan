import type { ContentStatus } from "@/generated/prisma/client";

/**
 * ContentItem is unique on (weekPlanId, dayOfWeek) — at most one slot per day.
 * Cap the Beranda list so a bad/legacy payload cannot render unbounded rows.
 */
export const MAX_WEEK_CONTENT_SLOTS = 7;

type WithStatusAndDay = {
  status: ContentStatus;
  dayOfWeek: number;
};

/** Non-posted week items for Beranda “Konten dalam proses” (IDE/DRAFT/READY). */
export function listInProgressContentItems<T extends WithStatusAndDay>(
  items: T[],
): T[] {
  return items
    .filter((item) => item.status !== "POSTED")
    .slice()
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .slice(0, MAX_WEEK_CONTENT_SLOTS);
}
