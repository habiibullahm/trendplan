import "server-only";

import { prisma } from "@/lib/prisma";
import { weekPlanAccessWhere } from "@/features/planner/fetchers/week-share";

/** Posted content items for Riwayat. */
export async function listPostedContentItems(userId: string) {
  return prisma.contentItem.findMany({
    where: {
      status: "POSTED",
      deletedAt: null,
      dayOfWeek: { gte: 0 },
      weekPlan: weekPlanAccessWhere(userId),
    },
    include: {
      weekPlan: { select: { weekStart: true } },
      trend: { select: { title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}
