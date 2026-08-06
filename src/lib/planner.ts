import { prisma } from "@/lib/prisma";
import { getWeekStart } from "@/lib/week";

export async function getOrCreateWeekPlan(userId: string, date = new Date()) {
  const weekStart = getWeekStart(date);
  return prisma.weekPlan.upsert({
    where: {
      userId_weekStart: { userId, weekStart },
    },
    create: { userId, weekStart },
    update: {},
    include: {
      items: {
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
