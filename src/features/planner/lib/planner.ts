import { prisma } from "@/lib/prisma";
import { softDeleteStaleBefore } from "@/features/planner/lib/soft-delete";
import { getWeekStart } from "@/lib/week";

/** Hard-delete soft-parked rows past the undo window (owned by this user). */
export async function purgeStaleSoftDeletes(userId: string) {
  await prisma.contentItem.deleteMany({
    where: {
      deletedAt: { lt: softDeleteStaleBefore() },
      weekPlan: { userId },
    },
  });
}

export async function getOrCreateWeekPlan(userId: string, date = new Date()) {
  await purgeStaleSoftDeletes(userId);

  const weekStart = getWeekStart(date);
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

export async function getRecommendations(limit = 12) {
  return prisma.trend.findMany({
    where: { niche: "Couple Date Ideas" },
    orderBy: { score: "desc" },
    take: limit,
  });
}

export async function requireUserId() {
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}
