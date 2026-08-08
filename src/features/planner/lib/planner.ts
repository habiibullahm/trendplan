import { prisma } from "@/lib/prisma";
import { softDeleteStaleBefore } from "@/features/planner/lib/soft-delete";
import { formatWeekStartParam, getWeekStart } from "@/lib/week";

/** ±14h around UTC midnight covers legacy Asia/Jakarta local-midnight rows. */
const LEGACY_OFFSET_MS = 14 * 60 * 60 * 1000;

/** Hard-delete soft-parked rows past the undo window (owned by this user). */
export async function purgeStaleSoftDeletes(userId: string) {
  await prisma.contentItem.deleteMany({
    where: {
      deletedAt: { lt: softDeleteStaleBefore() },
      weekPlan: { userId },
    },
  });
}

/**
 * Find a week plan by calendar Senin key, repairing legacy non-UTC timestamps
 * to canonical UTC midnight so unique(userId, weekStart) stays stable.
 */
async function findOrNormalizeWeekPlan(userId: string, weekStart: Date) {
  const canonical = getWeekStart(weekStart);
  const key = formatWeekStartParam(canonical);

  const exact = await prisma.weekPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart: canonical } },
    include: {
      items: {
        where: { deletedAt: null, dayOfWeek: { gte: 0 } },
        include: { trend: true },
        orderBy: { dayOfWeek: "asc" as const },
      },
    },
  });
  if (exact) return exact;

  const candidates = await prisma.weekPlan.findMany({
    where: {
      userId,
      weekStart: {
        gte: new Date(canonical.getTime() - LEGACY_OFFSET_MS),
        lte: new Date(canonical.getTime() + LEGACY_OFFSET_MS),
      },
    },
    include: {
      items: {
        where: { deletedAt: null, dayOfWeek: { gte: 0 } },
        include: { trend: true },
        orderBy: { dayOfWeek: "asc" as const },
      },
    },
  });

  const match = candidates.find(
    (p) => formatWeekStartParam(p.weekStart) === key,
  );
  if (!match) return null;

  if (match.weekStart.getTime() !== canonical.getTime()) {
    return prisma.weekPlan.update({
      where: { id: match.id },
      data: { weekStart: canonical },
      include: {
        items: {
          where: { deletedAt: null, dayOfWeek: { gte: 0 } },
          include: { trend: true },
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });
  }
  return match;
}

export async function getOrCreateWeekPlan(userId: string, date = new Date()) {
  await purgeStaleSoftDeletes(userId);

  const weekStart = getWeekStart(date);
  const existing = await findOrNormalizeWeekPlan(userId, weekStart);
  if (existing) return existing;

  return prisma.weekPlan.upsert({
    where: {
      userId_weekStart: { userId, weekStart },
    },
    create: { userId, weekStart },
    update: {},
    include: {
      items: {
        where: { deletedAt: null, dayOfWeek: { gte: 0 } },
        include: { trend: true },
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });
}

/** Active item counts keyed by YYYY-MM-DD weekStart (no upsert). */
export async function countActiveItemsByWeekStarts(
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
      _count: {
        select: {
          items: {
            where: { deletedAt: null, dayOfWeek: { gte: 0 } },
          },
        },
      },
    },
  });

  for (const plan of plans) {
    const key = formatWeekStartParam(plan.weekStart);
    if (map.has(key)) {
      map.set(key, plan._count.items);
    }
  }
  return map;
}

export async function getRecommendations(
  niche: string | null = null,
  limit = 12,
) {
  return prisma.trend.findMany({
    where: niche ? { niche } : undefined,
    orderBy: { score: "desc" },
    take: limit,
  });
}

export async function requireUserId() {
  const { gateAppUser } = await import("@/lib/require-app-user");
  const gate = await gateAppUser();
  if (!gate.ok) {
    throw new Error("Unauthorized");
  }
  return gate.userId;
}
