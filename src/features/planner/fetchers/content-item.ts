import "server-only";

import { prisma } from "@/lib/prisma";
import { weekPlanAccessWhere } from "@/features/planner/fetchers/week-share";

/** Slim content item for Plan detail / edit RSC. */
export async function getContentItemForEditor(userId: string, itemId: string) {
  return prisma.contentItem.findFirst({
    where: {
      id: itemId,
      deletedAt: null,
      dayOfWeek: { gte: 0 },
      weekPlan: weekPlanAccessWhere(userId),
    },
    select: {
      id: true,
      title: true,
      hook: true,
      caption: true,
      hashtags: true,
      status: true,
      dayOfWeek: true,
      trend: { select: { title: true } },
      weekPlan: { select: { weekStart: true, userId: true } },
    },
  });
}
