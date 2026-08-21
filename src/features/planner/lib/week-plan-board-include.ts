import type { Prisma as PrismaTypes } from "@/generated/prisma/client";

/** Board/share shape: content rows + owner/partner (+ pending invite). */
export function weekPlanBoardInclude() {
  return {
    items: {
      where: { deletedAt: null, dayOfWeek: { gte: 0 } },
      orderBy: { dayOfWeek: "asc" as const },
    },
    user: { select: { id: true, name: true, email: true, imageUrl: true } },
    members: {
      include: {
        user: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
      },
      take: 1,
    },
    invites: {
      where: {
        revokedAt: null,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" as const },
      take: 1,
      select: { id: true, invitedEmail: true, expiresAt: true },
    },
  } satisfies PrismaTypes.WeekPlanInclude;
}

export type WeekPlanForViewer = PrismaTypes.WeekPlanGetPayload<{
  include: ReturnType<typeof weekPlanBoardInclude>;
}>;
