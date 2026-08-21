import "server-only";

import { prisma } from "@/lib/prisma";

/** Akun profile row (push streams separately). */
export async function getAkunProfile(userId: string) {
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
