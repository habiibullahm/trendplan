import { EmptySlotSaranHost } from "@/features/planner/components/empty-slot-saran";
import { PlannerBoardInteractiveLoader } from "@/features/planner/components/planner-board-interactive-loader";
import type { EmptySlotSaranConfig } from "@/features/planner/components/empty-slot-saran-config";
import {
  PlannerHint,
  StaticBoard,
  type PlannerBoardItem,
} from "@/features/planner/components/planner-board-shared";
import type { PlannerView } from "@/lib/week";

export type { PlannerBoardItem } from "@/features/planner/components/planner-board-shared";

type BoardChrome = {
  items: PlannerBoardItem[];
  weekStartParam?: string;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
};

/** SSR/Suspense fallback: no DnD loader so the streamed board can mount once. */
export function PlannerBoardStatic({
  items,
  weekStartParam,
  returnMonth,
  returnWeek,
  view,
  showSaranHint = false,
}: BoardChrome & { showSaranHint?: boolean }) {
  return (
    <>
      <StaticBoard
        items={items}
        weekStartParam={weekStartParam}
        returnMonth={returnMonth}
        returnWeek={returnWeek}
        view={view}
      />
      <PlannerHint showSaran={showSaranHint} />
    </>
  );
}

export function PlannerBoard({
  items,
  weekStartParam,
  returnMonth,
  returnWeek,
  view,
  saran = null,
}: BoardChrome & { saran?: EmptySlotSaranConfig | null }) {
  return (
    <>
      <EmptySlotSaranHost config={saran}>
        <PlannerBoardInteractiveLoader
          items={items}
          weekStartParam={weekStartParam}
          returnMonth={returnMonth}
          returnWeek={returnWeek}
          view={view}
        >
          <StaticBoard
            items={items}
            weekStartParam={weekStartParam}
            returnMonth={returnMonth}
            returnWeek={returnWeek}
            view={view}
          />
        </PlannerBoardInteractiveLoader>
      </EmptySlotSaranHost>
      <PlannerHint showSaran={Boolean(saran)} />
    </>
  );
}

/** Public demo / embed: static week board with no auth links. */
export function ReadOnlyPlannerBoard({ items }: { items: PlannerBoardItem[] }) {
  return <StaticBoard items={items} readOnly />;
}
