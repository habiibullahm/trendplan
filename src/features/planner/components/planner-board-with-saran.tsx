import {
  PlannerBoard,
  type PlannerBoardItem,
} from "@/features/planner/components/planner-board";
import { getRecommendations } from "@/features/planner/fetchers/recommendations";
import {
  shouldShowEmptySlotSaran,
  unusedTrendsForEmptyDays,
} from "@/features/planner/lib/empty-slot-assist";
import type { PlannerView } from "@/lib/week";

type Props = {
  niche: string | null;
  usedTrendIds: Array<string | null | undefined>;
  emptyDays: number[];
  weekStartParam: string;
  returnMonth: string;
  returnWeek: number;
  view: PlannerView;
  items: PlannerBoardItem[];
};

/** Fetches trend catalog and paints Plan board with empty-slot saran when useful. */
export async function PlannerBoardWithEmptySlotSaran({
  niche,
  usedTrendIds,
  emptyDays,
  weekStartParam,
  returnMonth,
  returnWeek,
  view,
  items,
}: Props) {
  if (emptyDays.length === 0) {
    return (
      <PlannerBoard
        weekStartParam={weekStartParam}
        returnMonth={returnMonth}
        returnWeek={returnWeek}
        view={view}
        saran={null}
        items={items}
      />
    );
  }

  const catalog = await getRecommendations(niche, 12);
  const unusedTrends = unusedTrendsForEmptyDays({
    trends: catalog.map((trend) => ({
      id: trend.id,
      title: trend.title,
      reason: trend.reason,
      score: trend.score,
    })),
    usedTrendIds,
  });
  const saran = shouldShowEmptySlotSaran({ emptyDays, unusedTrends })
    ? {
        suggestions: unusedTrends,
        emptyDays,
        weekStartParam,
        view,
      }
    : null;

  return (
    <PlannerBoard
      weekStartParam={weekStartParam}
      returnMonth={returnMonth}
      returnWeek={returnWeek}
      view={view}
      saran={saran}
      items={items}
    />
  );
}
