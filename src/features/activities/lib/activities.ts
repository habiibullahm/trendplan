import { prisma } from "@/lib/prisma";
import { formatWeekStartParam, getWeekStart } from "@/lib/week";

/** ±14h around UTC midnight covers legacy Asia/Jakarta local-midnight rows. */
const LEGACY_OFFSET_MS = 14 * 60 * 60 * 1000;

export type ActivityListItem = {
  id: string;
  dayOfWeek: number;
  title: string;
};

/** Activities for a week plan, ordered by day then createdAt. */
export async function listActivitiesForWeek(
  userId: string,
  weekStart: Date,
): Promise<ActivityListItem[]> {
  const canonical = getWeekStart(weekStart);
  const plan = await prisma.weekPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart: canonical } },
    select: {
      activities: {
        orderBy: [{ dayOfWeek: "asc" }, { createdAt: "asc" }],
        select: { id: true, dayOfWeek: true, title: true },
      },
    },
  });
  return plan?.activities ?? [];
}

/** Activity counts keyed by YYYY-MM-DD weekStart (no upsert). */
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
      userId,
      weekStart: {
        gte: new Date(min),
        lte: new Date(max),
      },
    },
    select: {
      weekStart: true,
      _count: { select: { activities: true } },
    },
  });

  for (const plan of plans) {
    const key = formatWeekStartParam(plan.weekStart);
    if (map.has(key)) {
      map.set(key, plan._count.activities);
    }
  }
  return map;
}
