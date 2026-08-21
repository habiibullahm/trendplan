import "server-only";

import { prisma } from "@/lib/prisma";
import { weekPlanAccessWhere } from "@/features/planner/fetchers/week-share";

export async function getActivityForEditor(
  userId: string,
  activityId: string,
) {
  return prisma.activity.findFirst({
    where: {
      id: activityId,
      weekPlan: weekPlanAccessWhere(userId),
    },
    include: {
      weekPlan: { select: { weekStart: true, userId: true } },
    },
  });
}
