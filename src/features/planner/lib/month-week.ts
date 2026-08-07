import { formatWeekRange, formatWeekStartParam } from "@/lib/week";

export type MonthWeekChip = {
  index: number;
  weekStartParam: string;
  rangeLabel: string;
  filled: number;
};

export function buildMonthWeekChips(
  weekStarts: Date[],
  counts: Map<string, number>,
): MonthWeekChip[] {
  return weekStarts.map((weekStart, i) => {
    const weekStartParam = formatWeekStartParam(weekStart);
    return {
      index: i + 1,
      weekStartParam,
      rangeLabel: formatWeekRange(weekStart),
      filled: counts.get(weekStartParam) ?? 0,
    };
  });
}
