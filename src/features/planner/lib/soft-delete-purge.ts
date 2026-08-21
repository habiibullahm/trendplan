import "server-only";

import { prisma } from "@/lib/prisma";
import { softDeleteStaleBefore } from "@/features/planner/lib/soft-delete";

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
