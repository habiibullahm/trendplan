import { prisma } from "@/lib/prisma";
import { weekPlanAccessWhere } from "@/features/planner/lib/week-share";
import { formatWeekStartParam, getWeekStart, type PlannerView } from "@/lib/week";

/** ±14h around UTC midnight covers legacy Asia/Jakarta local-midnight rows. */
const LEGACY_OFFSET_MS = 14 * 60 * 60 * 1000;

export type ActivityListItem = {
  id: string;
  dayOfWeek: number;
  title: string;
};

export type ActivityViewerListItem = ActivityListItem & { weekPlanId: string };

/** Activities for a known week plan id, ordered by day then createdAt. */
export async function listActivitiesForWeekPlan(
  weekPlanId: string,
): Promise<ActivityListItem[]> {
  return prisma.activity.findMany({
    where: { weekPlanId },
    orderBy: [{ dayOfWeek: "asc" }, { createdAt: "asc" }],
    select: { id: true, dayOfWeek: true, title: true },
  });
}

/**
 * Activities for the viewer week without waiting on the full board include.
 * view=shared prefers a partner (foreign) week in the calendar window.
 */
export async function listActivitiesForViewerWeek(
  userId: string,
  weekStart: Date,
  opts?: { view?: PlannerView },
): Promise<ActivityViewerListItem[]> {
  const canonical = getWeekStart(weekStart);
  const key = formatWeekStartParam(canonical);
  const view = opts?.view ?? "mine";
  const min = new Date(canonical.getTime() - LEGACY_OFFSET_MS);
  const max = new Date(canonical.getTime() + LEGACY_OFFSET_MS);

  const rows = await prisma.activity.findMany({
    where: {
      weekPlan: {
        AND: [
          view === "shared" ? weekPlanAccessWhere(userId) : { userId },
          { weekStart: { gte: min, lte: max } },
        ],
      },
    },
    orderBy: [{ dayOfWeek: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      dayOfWeek: true,
      title: true,
      weekPlanId: true,
      weekPlan: { select: { weekStart: true, userId: true } },
    },
  });

  const inWeek = rows.filter(
    (row) => formatWeekStartParam(row.weekPlan.weekStart) === key,
  );

  const preferred =
    view === "shared"
      ? inWeek.filter((row) => row.weekPlan.userId !== userId)
      : inWeek.filter((row) => row.weekPlan.userId === userId);
  const chosen =
    preferred.length > 0
      ? preferred
      : inWeek.filter((row) => row.weekPlan.userId === userId);

  return chosen.map(({ id, dayOfWeek, title, weekPlanId }) => ({
    id,
    dayOfWeek,
    title,
    weekPlanId,
  }));
}

/** Activities for a week plan (owned or partner), ordered by day then createdAt. */
export async function listActivitiesForWeek(
  userId: string,
  weekStart: Date,
  opts?: { view?: PlannerView },
): Promise<ActivityListItem[]> {
  const { getWeekPlanForViewer } = await import(
    "@/features/planner/lib/week-share"
  );
  const plan = await getWeekPlanForViewer(userId, weekStart, opts);
  return listActivitiesForWeekPlan(plan.id);
}

/** Activity counts keyed by YYYY-MM-DD weekStart. */
export async function countActivitiesByWeekStarts(
  userId: string,
  weekStarts: Date[],
  opts?: { view?: PlannerView },
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  for (const ws of weekStarts) {
    map.set(formatWeekStartParam(ws), 0);
  }
  if (weekStarts.length === 0) return map;

  const view = opts?.view ?? "mine";
  const times = weekStarts.map((d) => d.getTime());
  const min = Math.min(...times) - LEGACY_OFFSET_MS;
  const max = Math.max(...times) + LEGACY_OFFSET_MS;

  const plans = await prisma.weekPlan.findMany({
    where: {
      AND: [
        view === "shared" ? weekPlanAccessWhere(userId) : { userId },
        {
          weekStart: {
            gte: new Date(min),
            lte: new Date(max),
          },
        },
      ],
    },
    select: {
      weekStart: true,
      userId: true,
      members: { where: { userId }, select: { id: true } },
      _count: { select: { activities: true } },
    },
  });

  const byKey = new Map<string, { count: number; foreign: boolean }>();
  for (const plan of plans) {
    const key = formatWeekStartParam(plan.weekStart);
    if (!map.has(key)) continue;
    const foreign = plan.userId !== userId;
    const prev = byKey.get(key);
    if (view === "shared") {
      if (foreign) {
        byKey.set(key, { count: plan._count.activities, foreign: true });
      } else if (!prev?.foreign) {
        byKey.set(key, { count: plan._count.activities, foreign: false });
      }
    } else if (!foreign) {
      byKey.set(key, { count: plan._count.activities, foreign: false });
    }
  }
  for (const [key, value] of byKey) {
    map.set(key, value.count);
  }
  return map;
}
