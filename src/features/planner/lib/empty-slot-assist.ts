/** Rank unused curated trends for empty planner days (no Groq). */

export const EMPTY_SLOT_SARAN_LIMIT = 2;

export type EmptySlotTrend = {
  id: string;
  title: string;
  reason: string | null;
  score: number;
};

/** Days 0–6 that do not already have a content item. */
export function emptyPlannerDays(occupiedDays: Iterable<number>): number[] {
  const occupied = new Set(occupiedDays);
  return [0, 1, 2, 3, 4, 5, 6].filter((day) => !occupied.has(day));
}

/**
 * Highest-score unused catalog rows. `trends` must already be score-desc
 * (same order as `getRecommendations`).
 */
export function unusedTrendsForEmptyDays<T extends { id: string }>(opts: {
  trends: readonly T[];
  usedTrendIds: Iterable<string | null | undefined>;
  limit?: number;
}): T[] {
  const used = new Set<string>();
  for (const id of opts.usedTrendIds) {
    if (id) used.add(id);
  }
  return opts.trends
    .filter((trend) => !used.has(trend.id))
    .slice(0, opts.limit ?? EMPTY_SLOT_SARAN_LIMIT);
}

export function shouldShowEmptySlotSaran(opts: {
  emptyDays: readonly number[];
  unusedTrends: readonly unknown[];
}): boolean {
  return opts.emptyDays.length > 0 && opts.unusedTrends.length > 0;
}
