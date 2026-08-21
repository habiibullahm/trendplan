import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getRecommendations(
  niche: string | null = null,
  limit = 12,
) {
  const nicheKey = niche ?? "all";
  return unstable_cache(
    async (cachedNicheKey: string, cachedLimit: number) => {
      const cachedNiche = cachedNicheKey === "all" ? null : cachedNicheKey;
      return prisma.trend.findMany({
        where: cachedNiche ? { niche: cachedNiche } : undefined,
        orderBy: { score: "desc" },
        take: cachedLimit,
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
    },
    ["recommendations"],
    { revalidate: 120, tags: ["trends"] },
  )(nicheKey, limit);
}
