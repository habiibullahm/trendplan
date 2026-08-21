import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Request-deduped Beranda profile row (shell + niche for recs). */
export const getBerandaUser = cache(async (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyGoal: true, niche: true, name: true },
  }),
);
