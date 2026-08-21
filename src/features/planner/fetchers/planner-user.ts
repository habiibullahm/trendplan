import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Planner shell user (goal + niche). */
export const getPlannerUser = cache(async (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyGoal: true, niche: true },
  }),
);

/** Niche-only row for Tren / Rekomendasi. */
export const getUserNiche = cache(async (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: { niche: true },
  }),
);
