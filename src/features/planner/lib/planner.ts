import { prisma } from "@/lib/prisma";
import { softDeleteStaleBefore } from "@/features/planner/lib/soft-delete";
import { formatWeekStartParam, getWeekStart, type PlannerView } from "@/lib/week";

/** ±14h around UTC midnight covers legacy Asia/Jakarta local-midnight rows. */
const LEGACY_OFFSET_MS = 14 * 60 * 60 * 1000;

/** Hard-delete soft-parked rows past the undo window (owned by this user). */
export async function purgeStaleSoftDeletes(userId: string) {
  const { weekPlanAccessWhere } = await import(
    "@/features/planner/lib/week-share"
  );
  await prisma.contentItem.deleteMany({
    where: {
      deletedAt: { lt: softDeleteStaleBefore() },
      weekPlan: weekPlanAccessWhere(userId),
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
        view === "shared"
          ? { OR: [{ userId }, { members: { some: { userId } } }] }
          : { userId },
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
      _count: {
        select: {
          items: {
            where: { deletedAt: null, dayOfWeek: { gte: 0 } },
          },
        },
      },
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
        byKey.set(key, { count: plan._count.items, foreign: true });
      } else if (!prev?.foreign) {
        byKey.set(key, { count: plan._count.items, foreign: false });
      }
    } else if (!foreign) {
      byKey.set(key, { count: plan._count.items, foreign: false });
    }
  }
  for (const [key, value] of byKey) {
    map.set(key, value.count);
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
    // Explicit scalars so media fields stay selected even if client/schema drift.
    select: {
      id: true,
      title: true,
      hook: true,
      format: true,
      score: true,
      reason: true,
      niche: true,
      coverUrl: true,
      videoUrl: true,
      audioTitle: true,
      audioUrl: true,
      createdAt: true,
    },
  });
}

export async function requireUserId() {
  const { gateAppUser } = await import("@/lib/auth/require-app-user");
  const gate = await gateAppUser();
  if (!gate.ok) {
    throw new Error("Unauthorized");
  }
  return gate.userId;
}
