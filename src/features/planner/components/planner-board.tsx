"use client";

import {
  startTransition,
  useEffect,
  useState,
  type ComponentType,
} from "react";
import { usePlannerLayout } from "@/hooks/use-planner-layout";
import type { PlannerView } from "@/lib/week";
import {
  PlannerHint,
  StaticBoard,
  type LayoutKind,
  type PlannerBoardItem,
} from "@/features/planner/components/planner-board-shared";

export type { PlannerBoardItem } from "@/features/planner/components/planner-board-shared";

type InteractiveBoardProps = {
  items: PlannerBoardItem[];
  layout: LayoutKind;
  weekStartParam?: string;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
};

export function PlannerBoard({
  items,
  weekStartParam,
  returnMonth,
  returnWeek,
  view,
}: {
  items: PlannerBoardItem[];
  weekStartParam?: string;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
}) {
  const layout = usePlannerLayout();
  const [Interactive, setInteractive] = useState<ComponentType<
    InteractiveBoardProps
  > | null>(null);
  const boardKey = items
    .map((i) => `${i.id}:${i.dayOfWeek}:${i.status}:${i.title}`)
    .join("|");

  useEffect(() => {
    if (!layout) return;
    let cancelled = false;
    const id = window.setTimeout(() => {
      void import(
        "@/features/planner/components/planner-board-interactive"
      ).then((m) => {
        if (cancelled) return;
        startTransition(() => setInteractive(() => m.InteractiveBoard));
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [layout]);

  const staticBoard = (
    <StaticBoard
      items={items}
      weekStartParam={weekStartParam}
      returnMonth={returnMonth}
      returnWeek={returnWeek}
      view={view}
    />
  );

  return (
    <>
      {layout && Interactive ? (
        <Interactive
          key={`${layout}:${boardKey}`}
          items={items}
          layout={layout}
          weekStartParam={weekStartParam}
          returnMonth={returnMonth}
          returnWeek={returnWeek}
          view={view}
        />
      ) : (
        staticBoard
      )}
      <PlannerHint />
    </>
  );
}

/** Public demo / embed: static week board with no auth links. */
export function ReadOnlyPlannerBoard({ items }: { items: PlannerBoardItem[] }) {
  return <StaticBoard items={items} readOnly />;
}
