import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { appBaseUrl } from "@/lib/auth/env";
import { prisma } from "@/lib/prisma";
import { formatWeekStartParam, getWeekStart, type PlannerView } from "@/lib/week";
import {
  createWeekInviteRawToken,
  hashWeekInviteToken,
  WEEK_INVITE_TTL_MS,
} from "@/features/planner/lib/week-share-tokens";
import {
  buildInviteUrl,
  isSelfInviteEmail,
  normalizeInviteEmail,
  partnerDisplayName,
  shareRoleForUser,
  type ShareRole,
} from "@/features/planner/lib/week-share-pure";
import { softDeleteStaleBefore } from "@/features/planner/lib/soft-delete";
import {
  weekPlanBoardInclude,
  type WeekPlanForViewer,
} from "@/features/planner/lib/week-plan-board-include";
import type { Result } from "@/lib/result";

export {
  isSelfInviteEmail,
  normalizeInviteEmail,
  partnerDisplayName,
  shareRoleForUser,
  type ShareRole,
} from "@/features/planner/lib/week-share-pure";

export type { WeekPlanForViewer } from "@/features/planner/lib/week-plan-board-include";

/** ±14h around UTC midnight covers legacy Asia/Jakarta local-midnight rows. */
const LEGACY_OFFSET_MS = 14 * 60 * 60 * 1000;

/** Prisma where: user owns the week or is an active partner member. */
export function weekPlanAccessWhere(
  userId: string,
): Prisma.WeekPlanWhereInput {
  return {
    OR: [{ userId }, { members: { some: { userId } } }],
  };
}

export async function canEditWeekPlan(
  userId: string,
  weekPlanId: string,
): Promise<boolean> {
  const plan = await prisma.weekPlan.findFirst({
    where: { id: weekPlanId, ...weekPlanAccessWhere(userId) },
    select: { id: true },
  });
  return Boolean(plan);
}

export async function assertCanEditWeekPlan(
  userId: string,
  weekPlanId: string,
): Promise<void> {
  const ok = await canEditWeekPlan(userId, weekPlanId);
  if (!ok) throw new Error("Unauthorized");
}

export function inviteUrl(rawToken: string): string {
  return buildInviteUrl(appBaseUrl(), rawToken);
}

async function purgeStaleSoftDeletesForAccessible(userId: string) {
  await prisma.contentItem.deleteMany({
    where: {
      deletedAt: { lt: softDeleteStaleBefore() },
      weekPlan: weekPlanAccessWhere(userId),
    },
  });
}

async function findMembershipWeekPlan(
  userId: string,
  weekStart: Date,
): Promise<WeekPlanForViewer | null> {
  const canonical = getWeekStart(weekStart);
  const key = formatWeekStartParam(canonical);

  const membership = await prisma.weekPlanMember.findFirst({
    where: {
      userId,
      weekPlan: {
        weekStart: {
          gte: new Date(canonical.getTime() - LEGACY_OFFSET_MS),
          lte: new Date(canonical.getTime() + LEGACY_OFFSET_MS),
        },
      },
    },
    include: {
      weekPlan: { include: weekPlanBoardInclude() },
    },
  });

  if (!membership) return null;
  if (formatWeekStartParam(membership.weekPlan.weekStart) !== key) {
    return null;
  }
  return membership.weekPlan;
}

/**
 * Load the week plan for display/writes.
 * - view=mine (default): always the user's owned plan for that weekStart
 * - view=shared: membership week when seated as partner; else owned fallback
 * Single soft-delete purge; board include already has share fields (no re-fetch).
 */
export async function getWeekPlanForViewer(
  userId: string,
  date = new Date(),
  opts?: { view?: PlannerView },
): Promise<WeekPlanForViewer> {
  // Soft-deleted rows are already excluded via deletedAt: null. Hard-delete GC
  // must not block soft-nav TTFB (Neon round-trips).
  void purgeStaleSoftDeletesForAccessible(userId);

  const weekStart = getWeekStart(date);
  const view = opts?.view ?? "mine";

  if (view === "shared") {
    const shared = await findMembershipWeekPlan(userId, weekStart);
    if (shared) return shared;
  }

  const { getOrCreateWeekPlan } = await import(
    "@/features/planner/lib/planner"
  );
  return getOrCreateWeekPlan(userId, weekStart, { skipPurge: true });
}

/** True when the user is a partner member on some plan for this calendar week. */
export async function userHasPartnerSeatForWeek(
  userId: string,
  weekStart: Date,
): Promise<boolean> {
  const canonical = getWeekStart(weekStart);
  const key = formatWeekStartParam(canonical);

  const membership = await prisma.weekPlanMember.findFirst({
    where: {
      userId,
      weekPlan: {
        weekStart: {
          gte: new Date(canonical.getTime() - LEGACY_OFFSET_MS),
          lte: new Date(canonical.getTime() + LEGACY_OFFSET_MS),
        },
        // Partner seat only — exclude the owner's own plan membership rows.
        NOT: { userId },
      },
    },
    select: {
      weekPlan: { select: { weekStart: true } },
    },
  });

  if (!membership) return false;
  return formatWeekStartParam(membership.weekPlan.weekStart) === key;
}

/**
 * Read-only week items for reminders: prefer shared membership for weekStart,
 * else the user's owned plan. Does not create empty weeks.
 */
export async function listWeekPlanItemsForReminder(
  userId: string,
  weekStart: Date,
): Promise<{ title: string; dayOfWeek: number; status: string }[]> {
  const canonical = getWeekStart(weekStart);
  const shared = await findMembershipWeekPlan(userId, canonical);
  if (shared) {
    return shared.items.map((i) => ({
      title: i.title,
      dayOfWeek: i.dayOfWeek,
      status: i.status,
    }));
  }

  const owned = await prisma.weekPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart: canonical } },
    select: {
      items: {
        where: { deletedAt: null },
        select: { title: true, dayOfWeek: true, status: true },
      },
    },
  });
  return owned?.items ?? [];
}

export type WeekShareSnapshot = {
  role: ShareRole;
  weekPlanId: string;
  weekStart: Date;
  owner: { id: string; name: string | null; email: string; imageUrl: string | null };
  partner: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
  } | null;
  pendingInvite: {
    id: string;
    invitedEmail: string | null;
    expiresAt: Date;
  } | null;
  /** Only set when rotating/creating for owner copy — never persisted raw. */
  inviteLinkPreview?: string;
};

/** Build share UI from an already-loaded board plan (avoids a second findFirst). */
export function weekShareSnapshotFromPlan(
  plan: WeekPlanForViewer,
  userId: string,
): WeekShareSnapshot {
  const role = shareRoleForUser(plan, userId);
  const partner = plan.members[0]?.user ?? null;
  const pendingInvite = partner ? null : (plan.invites[0] ?? null);
  return {
    role,
    weekPlanId: plan.id,
    weekStart: plan.weekStart,
    owner: plan.user,
    partner,
    pendingInvite,
  };
}

export async function getWeekShareSnapshot(
  userId: string,
  weekPlanId: string,
): Promise<WeekShareSnapshot | null> {
  const plan = await prisma.weekPlan.findFirst({
    where: { id: weekPlanId, ...weekPlanAccessWhere(userId) },
    include: weekPlanBoardInclude(),
  });
  if (!plan) return null;
  return weekShareSnapshotFromPlan(plan, userId);
}

/** Revoke outstanding unused invites for a week, then create a fresh token. */
export type CreateWeekInviteErrorCode = "partner_exists" | "self_invite";

export type CreateWeekInviteResult = Result<
  { rawToken: string; inviteId: string; url: string },
  CreateWeekInviteErrorCode
>;

export async function createOrRotateWeekInvite(params: {
  weekPlanId: string;
  createdByUserId: string;
  invitedEmail?: string | null;
  /**
   * When false, keep existing pending invites until the caller finalizes
   * (e.g. after email send succeeds). Default true for copy-link flows.
   */
  revokePrevious?: boolean;
}): Promise<CreateWeekInviteResult> {
  const existingPartner = await prisma.weekPlanMember.findUnique({
    where: { weekPlanId: params.weekPlanId },
    select: { id: true },
  });
  if (existingPartner) {
    return { ok: false, code: "partner_exists" };
  }

  const invitedEmail = params.invitedEmail
    ? normalizeInviteEmail(params.invitedEmail)
    : null;
  if (invitedEmail) {
    // Always load creator email from DB — do not trust caller-supplied addresses.
    const creator = await prisma.user.findUnique({
      where: { id: params.createdByUserId },
      select: { email: true },
    });
    if (isSelfInviteEmail(creator?.email, invitedEmail)) {
      return { ok: false, code: "self_invite" };
    }
  }

  const revokePrevious = params.revokePrevious !== false;
  const rawToken = createWeekInviteRawToken();
  const tokenHash = hashWeekInviteToken(rawToken);
  const expiresAt = new Date(Date.now() + WEEK_INVITE_TTL_MS);

  const invite = await prisma.$transaction(async (tx) => {
    if (revokePrevious) {
      await tx.weekPlanInvite.updateMany({
        where: {
          weekPlanId: params.weekPlanId,
          acceptedAt: null,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    }
    return tx.weekPlanInvite.create({
      data: {
        weekPlanId: params.weekPlanId,
        createdByUserId: params.createdByUserId,
        tokenHash,
        invitedEmail,
        expiresAt,
      },
    });
  });

  return {
    ok: true,
    rawToken,
    inviteId: invite.id,
    url: inviteUrl(rawToken),
  };
}

/** After a successful send, invalidate every other pending invite for the week. */
export async function revokeOtherPendingInvites(
  weekPlanId: string,
  keepInviteId: string,
): Promise<void> {
  await prisma.weekPlanInvite.updateMany({
    where: {
      weekPlanId,
      id: { not: keepInviteId },
      acceptedAt: null,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

/** Discard an invite that was created but never delivered (e.g. mail failed). */
export async function revokeInviteById(inviteId: string): Promise<void> {
  await prisma.weekPlanInvite.updateMany({
    where: { id: inviteId, acceptedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokePendingInvites(weekPlanId: string): Promise<void> {
  await prisma.weekPlanInvite.updateMany({
    where: {
      weekPlanId,
      acceptedAt: null,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

export async function removePartner(
  weekPlanId: string,
  ownerUserId: string,
): Promise<boolean> {
  const plan = await prisma.weekPlan.findFirst({
    where: { id: weekPlanId, userId: ownerUserId },
    select: { id: true },
  });
  if (!plan) return false;

  await prisma.$transaction([
    prisma.weekPlanMember.deleteMany({ where: { weekPlanId } }),
    prisma.weekPlanInvite.updateMany({
      where: { weekPlanId, revokedAt: null, acceptedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
  return true;
}

export async function leaveSharedPlan(
  weekPlanId: string,
  partnerUserId: string,
): Promise<boolean> {
  const result = await prisma.weekPlanMember.deleteMany({
    where: { weekPlanId, userId: partnerUserId },
  });
  return result.count > 0;
}

export type AcceptInviteErrorCode =
  | "invalid"
  | "expired"
  | "revoked"
  | "self"
  | "partner_exists"
  | "already_member";

export type AcceptInviteResult = Result<
  { weekPlanId: string; weekStart: Date },
  AcceptInviteErrorCode
>;

export async function acceptWeekInvite(
  rawToken: string,
  userId: string,
): Promise<AcceptInviteResult> {
  const tokenHash = hashWeekInviteToken(rawToken);
  const now = new Date();

  try {
    return await prisma.$transaction(async (tx) => {
      const invite = await tx.weekPlanInvite.findUnique({
        where: { tokenHash },
        include: {
          weekPlan: {
            select: {
              id: true,
              userId: true,
              weekStart: true,
            },
          },
        },
      });

      if (!invite || invite.acceptedAt) {
        return { ok: false, code: "invalid" };
      }
      if (invite.revokedAt) {
        return { ok: false, code: "revoked" };
      }
      if (invite.expiresAt <= now) {
        return { ok: false, code: "expired" };
      }
      if (invite.weekPlan.userId === userId) {
        return { ok: false, code: "self" };
      }

      // Serialize concurrent accepts for this week (advisory + unique weekPlanId).
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${invite.weekPlanId}))`;

      const existingSeat = await tx.weekPlanMember.findUnique({
        where: { weekPlanId: invite.weekPlanId },
        select: { userId: true },
      });
      if (existingSeat) {
        if (existingSeat.userId === userId) {
          return { ok: false, code: "already_member" };
        }
        return { ok: false, code: "partner_exists" };
      }

      // Partner may only hold one membership per weekStart — drop prior seats for that calendar week.
      await tx.weekPlanMember.deleteMany({
        where: {
          userId,
          weekPlan: {
            weekStart: invite.weekPlan.weekStart,
            NOT: { id: invite.weekPlanId },
          },
        },
      });

      await tx.weekPlanMember.create({
        data: { weekPlanId: invite.weekPlanId, userId },
      });
      await tx.weekPlanInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: now },
      });
      await tx.weekPlanInvite.updateMany({
        where: {
          weekPlanId: invite.weekPlanId,
          id: { not: invite.id },
          acceptedAt: null,
          revokedAt: null,
        },
        data: { revokedAt: now },
      });

      return {
        ok: true,
        weekPlanId: invite.weekPlanId,
        weekStart: invite.weekPlan.weekStart,
      };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, code: "partner_exists" };
    }
    throw error;
  }
}

export async function rejectWeekInvite(
  rawToken: string,
): Promise<"ok" | "invalid"> {
  const tokenHash = hashWeekInviteToken(rawToken);
  const invite = await prisma.weekPlanInvite.findUnique({
    where: { tokenHash },
  });
  if (!invite || invite.acceptedAt || invite.revokedAt) {
    return "invalid";
  }
  if (invite.expiresAt <= new Date()) {
    return "invalid";
  }
  await prisma.weekPlanInvite.update({
    where: { id: invite.id },
    data: { revokedAt: new Date() },
  });
  return "ok";
}

export async function peekWeekInvite(rawToken: string): Promise<{
  status: "ok" | "invalid" | "expired" | "revoked" | "partner_exists";
  ownerName: string;
  weekStart: Date | null;
  weekPlanId: string | null;
}> {
  const tokenHash = hashWeekInviteToken(rawToken);
  const invite = await prisma.weekPlanInvite.findUnique({
    where: { tokenHash },
    include: {
      weekPlan: {
        select: {
          id: true,
          weekStart: true,
          user: { select: { name: true, email: true } },
          _count: { select: { members: true } },
        },
      },
    },
  });

  if (!invite || invite.acceptedAt) {
    return {
      status: "invalid",
      ownerName: "",
      weekStart: null,
      weekPlanId: null,
    };
  }
  if (invite.revokedAt) {
    return {
      status: "revoked",
      ownerName: "",
      weekStart: null,
      weekPlanId: null,
    };
  }
  if (invite.expiresAt <= new Date()) {
    return {
      status: "expired",
      ownerName: "",
      weekStart: null,
      weekPlanId: null,
    };
  }
  if (invite.weekPlan._count.members > 0) {
    return {
      status: "partner_exists",
      ownerName: partnerDisplayName(invite.weekPlan.user),
      weekStart: invite.weekPlan.weekStart,
      weekPlanId: invite.weekPlan.id,
    };
  }

  return {
    status: "ok",
    ownerName: partnerDisplayName(invite.weekPlan.user),
    weekStart: invite.weekPlan.weekStart,
    weekPlanId: invite.weekPlan.id,
  };
}
