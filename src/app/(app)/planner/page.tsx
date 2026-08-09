import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CopyWeekButton } from "@/features/planner/components/copy-week-button";
import { MonthWeekNav } from "@/features/planner/components/month-week-nav";
import { PlannerBoard } from "@/features/planner/components/planner-board";
import { PlannerToastFromQuery } from "@/features/planner/components/planner-toast";
import { STATUS_LABEL } from "@/lib/labels";
import { buildMonthWeekChips } from "@/features/planner/lib/month-week";
import {
  countActiveItemsByWeekStarts,
  getOrCreateWeekPlan,
} from "@/features/planner/lib/planner";
import {
  DAY_SHORT,
  formatWeekRange,
  formatWeekStartParam,
  resolvePlannerSelection,
} from "@/lib/week";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ month?: string; week?: string; toast?: string }>;
};

export default async function PlannerPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  const selection = resolvePlannerSelection({
    monthParam: params.month,
    weekParam: params.week,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyGoal: true },
  });

  const [weekPlan, counts] = await Promise.all([
    getOrCreateWeekPlan(userId, selection.weekStart),
    countActiveItemsByWeekStarts(userId, selection.weekStarts),
  ]);

  const goal = user?.weeklyGoal ?? 3;
  const weekLabel = formatWeekRange(weekPlan.weekStart);
  const weekStartParam = formatWeekStartParam(selection.weekStart);
  const weeks = buildMonthWeekChips(selection.weekStarts, counts);
  // Selected week count should match loaded plan after upsert
  const selectedChip = weeks.find((w) => w.index === selection.weekIndex);
  if (selectedChip) {
    selectedChip.filled = weekPlan.items.length;
  }

  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={null}>
        <PlannerToastFromQuery />
      </Suspense>
      <h1 className="sr-only">Planner</h1>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 text-sm text-ink-muted">
          Minggu {selection.weekIndex} · {weekLabel}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <p
            className="text-sm font-medium tabular-nums text-ink"
            aria-label={`${weekPlan.items.length} dari ${goal} target minggu terisi`}
          >
            {weekPlan.items.length}/{goal} terisi
          </p>
          <CopyWeekButton
            weekLabel={weekLabel}
            items={weekPlan.items.map((item) => ({
              dayOfWeek: item.dayOfWeek,
              title: item.title,
              statusLabel: STATUS_LABEL[item.status],
              dayLabel: DAY_SHORT[item.dayOfWeek],
            }))}
          />
        </div>
      </div>

      <MonthWeekNav
        year={selection.year}
        month={selection.month}
        weekIndex={selection.weekIndex}
        weeks={weeks}
      />

      <PlannerBoard
        weekStartParam={weekStartParam}
        returnMonth={selection.monthParam}
        returnWeek={selection.weekIndex}
        items={weekPlan.items.map((item) => ({
          id: item.id,
          dayOfWeek: item.dayOfWeek,
          title: item.title,
          status: item.status,
        }))}
      />
    </main>
  );
}
