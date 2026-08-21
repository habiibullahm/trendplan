import "server-only";

import type { FeedbackCategory } from "@/features/feedback/lib/validation";
import { prisma } from "@/lib/prisma";

export async function listAdminFeedback(opts?: {
  category?: FeedbackCategory | null;
  take?: number;
}) {
  return prisma.feedback.findMany({
    where: opts?.category ? { category: opts.category } : undefined,
    orderBy: { createdAt: "desc" },
    take: opts?.take ?? 50,
    select: {
      id: true,
      category: true,
      message: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });
}
