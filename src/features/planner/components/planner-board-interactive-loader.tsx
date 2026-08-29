"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import type {
  LayoutKind,
  PlannerBoardItem,
} from "@/features/planner/components/planner-board-shared";
import type { PlannerView } from "@/lib/week";

/** Plan konten always uses the full-width list (readable titles on desktop). */
const BOARD_LAYOUT: LayoutKind = "list";

type InteractiveBoardProps = {
  items: PlannerBoardItem[];
  layout: LayoutKind;
  weekStartParam?: string;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
};

function scheduleIdle(fn: () => void, timeout: number) {
  if (typeof window.requestIdleCallback === "function") {
    return window.requestIdleCallback(() => fn(), { timeout });
  }
  return window.setTimeout(fn, timeout);
}

function cancelIdle(id: number) {
  if (typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}

/**
 * Static RSC board as children. Prefetch @dnd-kit when layout is known;
 * swap only after idle so the first click on links/Saran is not stolen.
 */
export function PlannerBoardInteractiveLoader({
  items,
  weekStartParam,
  returnMonth,
  returnWeek,
  view,
  children,
}: Omit<InteractiveBoardProps, "layout"> & { children: ReactNode }) {
  const [Interactive, setInteractive] = useState<ComponentType<
    InteractiveBoardProps
  > | null>(null);
  const loading = useRef(false);
  const idleReady = useRef(false);
  const moduleRef = useRef<ComponentType<InteractiveBoardProps> | null>(null);
  const boardKey = items
    .map((i) => `${i.id}:${i.dayOfWeek}:${i.status}:${i.title}`)
    .join("|");

  const commitIfReady = useCallback(() => {
    if (!idleReady.current || !moduleRef.current) return;
    const Board = moduleRef.current;
    startTransition(() => setInteractive(() => Board));
  }, []);

  const prefetch = useCallback(() => {
    if (loading.current) return;
    loading.current = true;
    void import("@/features/planner/components/planner-board-interactive")
      .then((m) => {
        moduleRef.current = m.InteractiveBoard;
        commitIfReady();
      })
      .catch(() => {
        loading.current = false;
        moduleRef.current = null;
      });
  }, [commitIfReady]);

  useEffect(() => {
    prefetch();
    const id = scheduleIdle(() => {
      idleReady.current = true;
      commitIfReady();
    }, 2000);
    return () => cancelIdle(id);
  }, [prefetch, commitIfReady]);

  if (Interactive) {
    return (
      <Interactive
        key={`${BOARD_LAYOUT}:${boardKey}`}
        items={items}
        layout={BOARD_LAYOUT}
        weekStartParam={weekStartParam}
        returnMonth={returnMonth}
        returnWeek={returnWeek}
        view={view}
      />
    );
  }

  return children;
}
