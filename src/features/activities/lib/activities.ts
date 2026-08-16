import { prisma } from "@/lib/prisma";
import { weekPlanAccessWhere } from "@/features/planner/lib/week-share";
import { formatWeekStartParam } from "@/lib/week";

/** ±14h around UTC midnight covers legacy Asia/Jakarta local-midnight rows. */
const LEGACY_OFFSET_MS = 14 * 60 * 60 * 1000;

export type ActivityListItem = {
  id: string;
  dayOfWeek: number;
  title: string;
};

/** Activities for a week plan (owned or partner), ordered by day then createdAt. */
export async function listActivitiesForWeek(
  userId: string,
  weekStart: Date,
): Promise<ActivityListItem[]> {
  const { getWeekPlanForViewer } = await import(
    "@/features/planner/lib/week-share"
  );
  const plan = await getWeekPlanForViewer(userId, weekStart);
  const activities = await prisma.activity.findMany({
    where: { weekPlanId: plan.id },
    orderBy: [{ dayOfWeek: "asc" }, { createdAt: "asc" }],
    select: { id: true, dayOfWeek: true, title: true },
  });
  return activities;
}

/** Activity counts keyed by YYYY-MM-DD weekStart (owned + partner seats). */
export async function countActivitiesByWeekStarts(
  userId: string,
  weekStarts: Date[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  for (const ws of weekStarts) {
    map.set(formatWeekStartParam(ws), 0);
  }
  if (weekStarts.length === 0) return map;

  const times = weekStarts.map((d) => d.getTime());
  const min = Math.min(...times) - LEGACY_OFFSET_MS;
  const max = Math.max(...times) + LEGACY_OFFSET_MS;

  const plans = await prisma.weekPlan.findMany({
    where: {
      AND: [
        weekPlanAccessWhere(userId),
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

  // Prefer shared membership counts over personal for the same calendar week.
  const byKey = new Map<
    string,
    { count: number; shared: boolean }
  >();
  for (const plan of plans) {
    const key = formatWeekStartParam(plan.weekStart);
    if (!map.has(key)) continue;
    const shared = plan.userId !== userId || plan.members.length > 0;
    const prev = byKey.get(key);
    if (!prev || (shared && !prev.shared) || (shared === prev.shared && plan._count.activities > prev.count)) {
      // If membership on someone else's plan, always prefer it.
      if (plan.userId !== userId) {
        byKey.set(key, { count: plan._count.activities, shared: true });
      } else if (!prev?.shared) {
        byKey.set(key, {
          count: plan._count.activities,
          shared: plan.members.length > 0,
        });
      }
    }
  }
  for (const [key, value] of byKey) {
    map.set(key, value.count);
  }
  return map;
}
