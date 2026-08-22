import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { akunUserTag } from "@/features/auth/lib/akun-cache-tag";

export type AkunProfile = {
  name: string | null;
  email: string;
  imageUrl: string | null;
  niche: string;
  weeklyGoal: number;
};

async function loadAkunProfile(userId: string): Promise<AkunProfile | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      imageUrl: true,
      niche: true,
      weeklyGoal: true,
    },
  });
}

/** Akun profile row (push streams separately). Cached ~60s per user. */
export const getAkunProfile = cache(async (userId: string) =>
  unstable_cache(loadAkunProfile, ["akun-profile", userId], {
    revalidate: 60,
    tags: [akunUserTag(userId)],
  })(userId),
);
