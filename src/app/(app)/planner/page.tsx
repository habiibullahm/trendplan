import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  countActivitiesByWeekStarts,
  listActivitiesForWeek,
} from "@/features/activities/lib/activities";
import { ActivitiesBoard } from "@/features/activities/components/activities-board";
import { CopyWeekButton } from "@/features/planner/components/copy-week-button";
import { MonthWeekNav } from "@/features/planner/components/month-week-nav";
import { PlannerBoard } from "@/features/planner/components/planner-board";
import { PlannerTabs } from "@/features/planner/components/planner-tabs";
import { PlannerToastFromQuery } from "@/features/planner/components/planner-toast";
import {
  ShareWeekButton,
  SharedWeekBanner,
} from "@/features/planner/components/share-week-button";
import { STATUS_LABEL } from "@/lib/labels";
import { buildMonthWeekChips } from "@/features/planner/lib/month-week";
import { countActiveItemsByWeekStarts } from "@/features/planner/lib/planner";
import {
  getWeekPlanForViewer,
  getWeekShareSnapshot,
  partnerDisplayName,
  shareRoleForUser,
} from "@/features/planner/lib/week-share";
import {
  DAY_SHORT,
  formatWeekRange,
  formatWeekStartParam,
  parsePlannerTab,
  resolvePlannerSelection,
} from "@/lib/week";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{
    month?: string;
    week?: string;
    toast?: string;
    tab?: string;
  }>;
};

export default async function PlannerPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  const tab = parsePlannerTab(params.tab);
  const selection = resolvePlannerSelection({
    monthParam: params.month,
    weekParam: params.week,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyGoal: true },
  });

  const weekStartParam = formatWeekStartParam(selection.weekStart);
  const weekLabel = formatWeekRange(selection.weekStart);
  const goal = user?.weeklyGoal ?? 3;

  const weekPlan = await getWeekPlanForViewer(userId, selection.weekStart);
  const shareSnap = await getWeekShareSnapshot(userId, weekPlan.id);
  const role = shareRoleForUser(weekPlan, userId);
  const showShareBanner =
    Boolean(shareSnap?.partner) && (role === "owner" || role === "partner");

  const shareUi =
    shareSnap && (shareSnap.role === "owner" || shareSnap.role === "partner")
      ? {
          role: shareSnap.role,
          weekPlanId: shareSnap.weekPlanId,
          weekLabel,
          partner: shareSnap.partner,
          pendingInvite: shareSnap.pendingInvite
            ? {
                id: shareSnap.pendingInvite.id,
                invitedEmail: shareSnap.pendingInvite.invitedEmail,
                expiresAt: shareSnap.pendingInvite.expiresAt.toISOString(),
              }
            : null,
          partnerLabel: shareSnap.partner
            ? partnerDisplayName(shareSnap.partner)
            : null,
        }
      : null;

  if (tab === "aktivitas") {
    const [activities, activityCounts] = await Promise.all([
      listActivitiesForWeek(userId, selection.weekStart),
      countActivitiesByWeekStarts(userId, selection.weekStarts),
    ]);
    const weeks = buildMonthWeekChips(selection.weekStarts, activityCounts);
    const selectedChip = weeks.find((w) => w.index === selection.weekIndex);
    if (selectedChip) {
      selectedChip.filled = activities.length;
    }

    return (
      <main className="flex flex-1 flex-col">
        <Suspense fallback={null}>
          <PlannerToastFromQuery />
        </Suspense>
        <h1 className="sr-only">Planner Aktivitas</h1>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 text-sm text-ink-muted">
            Minggu {selection.weekIndex} · {weekLabel}
          </p>
          <p className="text-sm font-medium tabular-nums text-ink">
            {activities.length} aktivitas
          </p>
        </div>

        {showShareBanner && shareUi ? (
          <div className="mt-3">
            <SharedWeekBanner
              role={shareUi.role}
              ownerLabel={partnerDisplayName(weekPlan.user)}
            />
          </div>
        ) : null}

        <PlannerTabs
          tab={tab}
          year={selection.year}
          month={selection.month}
          weekIndex={selection.weekIndex}
        />

        <MonthWeekNav
          year={selection.year}
          month={selection.month}
          weekIndex={selection.weekIndex}
          weeks={weeks}
          tab={tab}
          metric="activities"
        />

        <ActivitiesBoard
          weekStartParam={weekStartParam}
          returnMonth={selection.monthParam}
          returnWeek={selection.weekIndex}
          items={activities}
        />
      </main>
    );
  }

  const counts = await countActiveItemsByWeekStarts(
    userId,
    selection.weekStarts,
  );

  const weeks = buildMonthWeekChips(selection.weekStarts, counts);
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
          {shareUi ? <ShareWeekButton share={shareUi} /> : null}
        </div>
      </div>

      {showShareBanner && shareUi ? (
        <div className="mt-3">
          <SharedWeekBanner
            role={shareUi.role}
            ownerLabel={partnerDisplayName(weekPlan.user)}
          />
        </div>
      ) : null}

      <PlannerTabs
        tab={tab}
        year={selection.year}
        month={selection.month}
        weekIndex={selection.weekIndex}
      />

      <MonthWeekNav
        year={selection.year}
        month={selection.month}
        weekIndex={selection.weekIndex}
        weeks={weeks}
        tab={tab}
        metric="content"
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
