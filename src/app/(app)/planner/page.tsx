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
import { PlannerViewToggle } from "@/features/planner/components/planner-view-toggle";
import {
  ShareWeekButton,
  SharedWeekBanner,
} from "@/features/planner/components/share-week-button";
import { STATUS_LABEL } from "@/lib/labels";
import { buildMonthWeekChips } from "@/features/planner/lib/month-week";
import {
  countActiveItemsByWeekStarts,
  getRecommendations,
} from "@/features/planner/lib/planner";
import {
  emptyPlannerDays,
  shouldShowEmptySlotSaran,
  unusedTrendsForEmptyDays,
} from "@/features/planner/lib/empty-slot-assist";
import {
  getWeekPlanForViewer,
  getWeekShareSnapshot,
  partnerDisplayName,
  shareRoleForUser,
  userHasPartnerSeatForWeek,
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
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{
    month?: string;
    week?: string;
    toast?: string;
    tab?: string;
    view?: string;
  }>;
};

export default async function PlannerPage({ searchParams }: Readonly<Props>) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  const tab = parsePlannerTab(params.tab);
  const view = parsePlannerView(params.view);
  const selection = resolvePlannerSelection({
    monthParam: params.month,
    weekParam: params.week,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyGoal: true, niche: true },
  });

  const weekStartParam = formatWeekStartParam(selection.weekStart);
  const weekLabel = formatWeekRange(selection.weekStart);
  const goal = user?.weeklyGoal ?? 3;

  const canToggleShareView = await userHasPartnerSeatForWeek(
    userId,
    selection.weekStart,
  );
  // Drop stale view=shared when this week has no partner seat (nav / after leave).
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

  const weekPlan = await getWeekPlanForViewer(userId, selection.weekStart, {
    view,
  });
  const shareSnap = await getWeekShareSnapshot(userId, weekPlan.id);
  const role = shareRoleForUser(weekPlan, userId);

  // Banner: shared view as partner, or owner looking at their plan with a partner.
  // Avoid implying Plan saya (partner's owned week) is "bersama".
  const showShareBanner =
    (view === "shared" && role === "partner") ||
    (role === "owner" && Boolean(shareSnap?.partner));

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

  // Owner controls on owned plan; partner leave only on shared view (not mine).
  const showShareButton =
    shareUi &&
    (shareUi.role === "owner" ||
      (shareUi.role === "partner" && view === "shared"));

  if (tab === "aktivitas") {
    const [activities, activityCounts] = await Promise.all([
      listActivitiesForWeek(userId, selection.weekStart, { view }),
      countActivitiesByWeekStarts(userId, selection.weekStarts, { view }),
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

  const counts = await countActiveItemsByWeekStarts(
    userId,
    selection.weekStarts,
    { view },
  );

  const weeks = buildMonthWeekChips(selection.weekStarts, counts);
  const selectedChip = weeks.find((w) => w.index === selection.weekIndex);
  if (selectedChip) {
    selectedChip.filled = weekPlan.items.length;
  }

  const catalog = await getRecommendations(user?.niche ?? null, 12);
  const unusedTrends = unusedTrendsForEmptyDays({
    trends: catalog.map((trend) => ({
      id: trend.id,
      title: trend.title,
      reason: trend.reason,
      score: trend.score,
    })),
    usedTrendIds: weekPlan.items.map((item) => item.trendId),
  });
  const emptyDays = emptyPlannerDays(
    weekPlan.items.map((item) => item.dayOfWeek),
  );
  const saran = shouldShowEmptySlotSaran({ emptyDays, unusedTrends })
    ? {
        suggestions: unusedTrends,
        emptyDays,
        weekStartParam,
        view,
      }
    : null;

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
          {showShareButton && shareUi ? (
            <ShareWeekButton share={shareUi} />
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

      <PlannerBoard
        weekStartParam={weekStartParam}
        returnMonth={selection.monthParam}
        returnWeek={selection.weekIndex}
        view={view}
        saran={saran}
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
