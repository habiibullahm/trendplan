import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSafeSession } from "@/lib/auth/session";
import {
  countActivitiesByWeekStarts,
  listActivitiesForViewerWeek,
} from "@/features/activities/lib/activities";
import { ActivitiesBoard } from "@/features/activities/components/activities-board";
import { CopyWeekButton } from "@/features/planner/components/copy-week-button";
import { DeferredShareWeekButton } from "@/features/planner/components/deferred-share-week-button";
import { MonthWeekNav } from "@/features/planner/components/month-week-nav";
import { PlannerBoardStatic } from "@/features/planner/components/planner-board";
import { PlannerBoardWithEmptySlotSaran } from "@/features/planner/components/planner-board-with-saran";
import { PlannerTabs } from "@/features/planner/components/planner-tabs";
import { PlannerToastFromQuery } from "@/features/planner/components/planner-toast";
import { PlannerViewToggle } from "@/features/planner/components/planner-view-toggle";
import type { ShareWeekUiSnapshot } from "@/features/planner/components/share-week-button";
import { SharedWeekBanner } from "@/features/planner/components/shared-week-banner";
import { STATUS_LABEL } from "@/lib/labels";
import { buildMonthWeekChips } from "@/features/planner/lib/month-week";
import { countActiveItemsByWeekStarts } from "@/features/planner/fetchers/week-plan";
import { getPlannerUser } from "@/features/planner/fetchers/planner-user";
import { emptyPlannerDays } from "@/features/planner/lib/empty-slot-assist";
import {
  getWeekPlanForViewer,
  partnerDisplayName,
  shareRoleForUser,
  userHasPartnerSeatForWeek,
  weekShareSnapshotFromPlan,
} from "@/features/planner/lib/week-share";
import {
  DAY_SHORT,
  formatWeekRange,
  formatWeekStartParam,
  parsePlannerTab,
  parsePlannerView,
  plannerHref,
  resolvePlannerSelection,
} from "@/lib/week";

type Props = {
  searchParams: Promise<{
    month?: string;
    week?: string;
    toast?: string;
    tab?: string;
    view?: string;
  }>;
};

function buildShareUi(
  shareSnap: ReturnType<typeof weekShareSnapshotFromPlan>,
  weekLabel: string,
): ShareWeekUiSnapshot | null {
  if (!shareSnap) return null;
  if (shareSnap.role !== "owner" && shareSnap.role !== "partner") return null;
  return {
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
  };
}


export default async function PlannerPage({ searchParams }: Readonly<Props>) {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  const tab = parsePlannerTab(params.tab);
  const view = parsePlannerView(params.view);
  const selection = resolvePlannerSelection({
    monthParam: params.month,
    weekParam: params.week,
  });

  const weekStartParam = formatWeekStartParam(selection.weekStart);
  const weekLabel = formatWeekRange(selection.weekStart);

  const weekPlanPromise = getWeekPlanForViewer(userId, selection.weekStart, {
    view,
  });

  if (tab === "aktivitas") {
    const [canToggleShareView, weekPlan, activityCounts, activityRows] =
      await Promise.all([
        userHasPartnerSeatForWeek(userId, selection.weekStart),
        weekPlanPromise,
        countActivitiesByWeekStarts(userId, selection.weekStarts, { view }),
        listActivitiesForViewerWeek(userId, selection.weekStart, { view }),
      ]);

    if (view === "shared" && !canToggleShareView) {
      redirect(
        plannerHref({
          weekStart: selection.weekStart,
          monthParam: selection.monthParam,
          weekParam: String(selection.weekIndex),
          tab,
          toast: params.toast,
        }),
      );
    }

    const activities = activityRows.filter(
      (row) => row.weekPlanId === weekPlan.id,
    );
    const shareSnap = weekShareSnapshotFromPlan(weekPlan, userId);
    const role = shareRoleForUser(weekPlan, userId);
    const shareUi = buildShareUi(shareSnap, weekLabel);

    const showShareBanner =
      (view === "shared" && role === "partner") ||
      (role === "owner" && Boolean(shareSnap.partner));

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

        {canToggleShareView ? (
          <PlannerViewToggle
            view={view}
            tab={tab}
            year={selection.year}
            month={selection.month}
            weekIndex={selection.weekIndex}
          />
        ) : null}

        <PlannerTabs
          tab={tab}
          year={selection.year}
          month={selection.month}
          weekIndex={selection.weekIndex}
          view={view}
        />

        <MonthWeekNav
          year={selection.year}
          month={selection.month}
          weekIndex={selection.weekIndex}
          weeks={weeks}
          tab={tab}
          view={view}
          metric="activities"
        />

        <ActivitiesBoard
          weekStartParam={weekStartParam}
          returnMonth={selection.monthParam}
          returnWeek={selection.weekIndex}
          view={view}
          items={activities}
        />
      </main>
    );
  }

  const userPromise = getPlannerUser(userId);

  const [user, canToggleShareView, weekPlan, counts] = await Promise.all([
    userPromise,
    userHasPartnerSeatForWeek(userId, selection.weekStart),
    weekPlanPromise,
    countActiveItemsByWeekStarts(userId, selection.weekStarts, { view }),
  ]);
  const goal = user?.weeklyGoal ?? 3;

  if (view === "shared" && !canToggleShareView) {
    redirect(
      plannerHref({
        weekStart: selection.weekStart,
        monthParam: selection.monthParam,
        weekParam: String(selection.weekIndex),
        tab,
        toast: params.toast,
      }),
    );
  }

  const shareSnap = weekShareSnapshotFromPlan(weekPlan, userId);
  const role = shareRoleForUser(weekPlan, userId);
  const shareUi = buildShareUi(shareSnap, weekLabel);

  // Banner: shared view as partner, or owner looking at their plan with a partner.
  // Avoid implying Plan saya (partner's owned week) is "bersama".
  const showShareBanner =
    (view === "shared" && role === "partner") ||
    (role === "owner" && Boolean(shareSnap.partner));

  // Owner controls on owned plan; partner leave only on shared view (not mine).
  const showShareButton =
    shareUi &&
    (shareUi.role === "owner" ||
      (shareUi.role === "partner" && view === "shared"));

  const weeks = buildMonthWeekChips(selection.weekStarts, counts);
  const selectedChip = weeks.find((w) => w.index === selection.weekIndex);
  if (selectedChip) {
    selectedChip.filled = weekPlan.items.length;
  }

  const boardItems = weekPlan.items.map((item) => ({
    id: item.id,
    dayOfWeek: item.dayOfWeek,
    title: item.title,
    status: item.status,
  }));
  const emptyDays = emptyPlannerDays(
    weekPlan.items.map((item) => item.dayOfWeek),
  );
  const usedTrendIds = weekPlan.items.map((item) => item.trendId);
  const boardProps = {
    weekStartParam,
    returnMonth: selection.monthParam,
    returnWeek: selection.weekIndex,
    view,
    items: boardItems,
  } as const;

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
            aria-label={`${weekPlan.items.length} dari ${goal} target minggu`}
          >
            {weekPlan.items.length} ide · target {goal}
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
          {showShareButton && shareUi ? (
            <DeferredShareWeekButton share={shareUi} />
          ) : null}
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

      {canToggleShareView ? (
        <PlannerViewToggle
          view={view}
          tab={tab}
          year={selection.year}
          month={selection.month}
          weekIndex={selection.weekIndex}
        />
      ) : null}

      <PlannerTabs
        tab={tab}
        year={selection.year}
        month={selection.month}
        weekIndex={selection.weekIndex}
        view={view}
      />

      <MonthWeekNav
        year={selection.year}
        month={selection.month}
        weekIndex={selection.weekIndex}
        weeks={weeks}
        tab={tab}
        view={view}
        metric="content"
      />

      <Suspense
        fallback={<PlannerBoardStatic {...boardProps} />}
      >
        <PlannerBoardWithEmptySlotSaran
          {...boardProps}
          niche={user?.niche ?? null}
          usedTrendIds={usedTrendIds}
          emptyDays={emptyDays}
        />
      </Suspense>
    </main>
  );
}
