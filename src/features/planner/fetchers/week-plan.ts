import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { berandaUserTag } from "@/features/planner/lib/beranda-cache-tag";
import { purgeStaleSoftDeletes } from "@/features/planner/lib/soft-delete-purge";
import {
  weekPlanBerandaInclude,
  weekPlanBoardInclude,
  type WeekPlanForBeranda,
  type WeekPlanForViewer,
} from "@/features/planner/lib/week-plan-board-include";
import { formatWeekStartParam, getWeekStart, type PlannerView } from "@/lib/week";
import type { Prisma } from "@/generated/prisma/client";

export { berandaUserTag } from "@/features/planner/lib/beranda-cache-tag";

/** ±14h around UTC midnight covers legacy Asia/Jakarta local-midnight rows. */
const LEGACY_OFFSET_MS = 14 * 60 * 60 * 1000;

/**
 * Legacy non-UTC weekStart repair (findMany window). Exact unique miss only.
 */
async function findLegacyNormalizedWeekPlan<
  TInclude extends Prisma.WeekPlanInclude,
>(
  userId: string,
  weekStart: Date,
  include: TInclude,
): Promise<Prisma.WeekPlanGetPayload<{ include: TInclude }> | null> {
  const canonical = getWeekStart(weekStart);
  const key = formatWeekStartParam(canonical);

  const candidates = await prisma.weekPlan.findMany({
    where: {
      userId,
      weekStart: {
        gte: new Date(canonical.getTime() - LEGACY_OFFSET_MS),
        lte: new Date(canonical.getTime() + LEGACY_OFFSET_MS),
      },
    },
    include,
  });

  const match = candidates.find(
    (p) => formatWeekStartParam(p.weekStart) === key,
  );
  if (!match) return null;

  if (match.weekStart.getTime() !== canonical.getTime()) {
    return prisma.weekPlan.update({
      where: { id: match.id },
      data: { weekStart: canonical },
      include,
    });
  }
  return match;
}

/**
 * Find a week plan by calendar Senin key, repairing legacy non-UTC timestamps
 * to canonical UTC midnight so unique(userId, weekStart) stays stable.
 */
async function findOrNormalizeWeekPlan<
  TInclude extends Prisma.WeekPlanInclude,
>(
  userId: string,
  weekStart: Date,
  include: TInclude,
): Promise<Prisma.WeekPlanGetPayload<{ include: TInclude }> | null> {
  const canonical = getWeekStart(weekStart);

  const exact = await prisma.weekPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart: canonical } },
    include,
  });
  if (exact) return exact;

  return findLegacyNormalizedWeekPlan(userId, canonical, include);
}

export async function getOrCreateWeekPlan(
  userId: string,
  date = new Date(),
  opts?: { skipPurge?: boolean },
): Promise<WeekPlanForViewer> {
  if (!opts?.skipPurge) await purgeStaleSoftDeletes(userId);

  const weekStart = getWeekStart(date);
  const include = weekPlanBoardInclude();
  const existing = await findOrNormalizeWeekPlan(userId, weekStart, include);
  if (existing) return existing;

  return prisma.weekPlan.upsert({
    where: {
      userId_weekStart: { userId, weekStart },
    },
    create: { userId, weekStart },
    update: {},
    include,
  });
}

type BerandaWeekCached = {
  id: string;
  userId: string;
  weekStart: string;
  items: Array<{
    id: string;
    title: string;
    status: WeekPlanForBeranda["items"][number]["status"];
    dayOfWeek: number;
  }>;
};

function toBerandaWeekCached(plan: WeekPlanForBeranda): BerandaWeekCached {
  return {
    id: plan.id,
    userId: plan.userId,
    weekStart: plan.weekStart.toISOString(),
    items: plan.items.map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      dayOfWeek: item.dayOfWeek,
    })),
  };
}

/**
 * DB load for Beranda: exact `findUnique` first; legacy normalize / upsert only on miss.
 */
async function loadWeekPlanForBerandaFromDb(
  userId: string,
  weekStartIso: string,
): Promise<BerandaWeekCached> {
  const weekStart = getWeekStart(new Date(weekStartIso));
  const include = weekPlanBerandaInclude();

  const exact = await prisma.weekPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
    include,
  });
  if (exact) return toBerandaWeekCached(exact);

  const normalized = await findLegacyNormalizedWeekPlan(
    userId,
    weekStart,
    include,
  );
  if (normalized) return toBerandaWeekCached(normalized);

  const created = await prisma.weekPlan.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    create: { userId, weekStart },
    update: {},
    include,
  });
  return toBerandaWeekCached(created);
}

/** Owned week for Beranda — lean cached payload (warm hits ~ms). */
export async function getWeekPlanForBeranda(
  userId: string,
  date = new Date(),
): Promise<Pick<WeekPlanForBeranda, "id" | "userId" | "weekStart" | "items">> {
  const weekStart = getWeekStart(date);
  const weekKey = formatWeekStartParam(weekStart);
  const weekStartIso = weekStart.toISOString();

  const cached = await unstable_cache(
    loadWeekPlanForBerandaFromDb,
    ["beranda-week", userId, weekKey],
    { revalidate: 60, tags: [berandaUserTag(userId)] },
  )(userId, weekStartIso);

  return {
    id: cached.id,
    userId: cached.userId,
    weekStart: new Date(cached.weekStart),
    items: cached.items,
  };
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
