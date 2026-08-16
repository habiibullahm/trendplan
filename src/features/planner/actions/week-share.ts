"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ActionErrors,
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";
import { isTransactionalEmailEnabled } from "@/lib/auth/env";
import { sendMail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { formatWeekRange, plannerHref } from "@/lib/week";
import { requireUserId } from "@/features/planner/lib/planner";
import {
  acceptWeekInvite,
  createOrRotateWeekInvite,
  getWeekShareSnapshot,
  leaveSharedPlan,
  partnerDisplayName,
  peekWeekInvite,
  rejectWeekInvite,
  removePartner,
  revokeInviteById,
  revokeOtherPendingInvites,
  revokePendingInvites,
} from "@/features/planner/lib/week-share";
import { escapeHtml } from "@/lib/escape-html";
import { prisma } from "@/lib/prisma";

export type ShareWeekActionState = ActionResult & {
  inviteUrl?: string;
};

const emailSchema = z.string().trim().email().max(254);

function revalidateShare(weekPlanId?: string) {
  revalidatePath("/planner");
  if (weekPlanId) {
    revalidatePath("/invite/week");
  }
}

async function requireOwnedWeekPlan(userId: string, weekPlanId: string) {
  return prisma.weekPlan.findFirst({
    where: { id: weekPlanId, userId },
    select: { id: true, weekStart: true },
  });
}

export async function createOrRotateWeekInviteAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const userId = await requireUserId();
  const weekPlanId = String(formData.get("weekPlanId") ?? "");
  if (!weekPlanId) return actionError(ActionErrors.invalid);

  const owned = await requireOwnedWeekPlan(userId, weekPlanId);
  if (!owned) return actionError(ActionErrors.unauthorized);

  const rl = await checkRateLimit(`week-invite:create:${userId}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) return actionError(ActionErrors.rateLimited);

  try {
    const { url } = await createOrRotateWeekInvite({
      weekPlanId,
      createdByUserId: userId,
    });
    revalidateShare(weekPlanId);
    return { ...actionSuccess("Tautan undangan siap"), inviteUrl: url };
  } catch (e) {
    if (e instanceof Error && e.message === "PARTNER_EXISTS") {
      return actionError("Minggu ini sudah punya partner.");
    }
    return actionError(ActionErrors.generic);
  }
}

export async function sendWeekInviteEmailAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const userId = await requireUserId();
  const weekPlanId = String(formData.get("weekPlanId") ?? "");
  const emailParsed = emailSchema.safeParse(formData.get("email") ?? "");
  if (!weekPlanId) return actionError(ActionErrors.invalid);
  if (!emailParsed.success) {
    return { error: "Email tidak valid.", fieldErrors: { email: ["Email tidak valid."] } };
  }

  const owned = await requireOwnedWeekPlan(userId, weekPlanId);
  if (!owned) return actionError(ActionErrors.unauthorized);

  if (!isTransactionalEmailEnabled()) {
    return actionError(ActionErrors.emailDisabled);
  }

  const rl = await checkRateLimit(`week-invite:email:${userId}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) return actionError(ActionErrors.rateLimited);

  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  try {
    // Create without revoking older pending links until mail succeeds.
    const { url, inviteId } = await createOrRotateWeekInvite({
      weekPlanId,
      createdByUserId: userId,
      invitedEmail: emailParsed.data,
      revokePrevious: false,
    });
    const weekLabel = formatWeekRange(owned.weekStart);
    const ownerLabel = owner ? partnerDisplayName(owner) : "Seseorang";
    const safeOwner = escapeHtml(ownerLabel);
    const safeWeek = escapeHtml(weekLabel);
    const safeHref = escapeHtml(url);
    try {
      await sendMail({
        to: emailParsed.data,
        subject: `${ownerLabel} mengundangmu ke plan TrendPlan`,
        text: `${ownerLabel} mengundangmu ke minggu ${weekLabel} di TrendPlan.\n\nTerima undangan: ${url}\n\nTautan berlaku 7 hari.`,
        html: `<p><strong>${safeOwner}</strong> mengundangmu ke minggu <strong>${safeWeek}</strong> di TrendPlan.</p><p><a href="${safeHref}">Terima undangan</a></p><p>Tautan berlaku 7 hari.</p>`,
      });
    } catch (mailError) {
      await revokeInviteById(inviteId);
      throw mailError;
    }
    await revokeOtherPendingInvites(weekPlanId, inviteId);
    revalidateShare(weekPlanId);
    return { ...actionSuccess("Undangan dikirim"), inviteUrl: url };
  } catch (e) {
    if (e instanceof Error && e.message === "PARTNER_EXISTS") {
      return actionError("Minggu ini sudah punya partner.");
    }
    if (e instanceof Error && e.message.includes("Email")) {
      return actionError(ActionErrors.emailDisabled);
    }
    return actionError(ActionErrors.generic);
  }
}

export async function revokeWeekInviteAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const userId = await requireUserId();
  const weekPlanId = String(formData.get("weekPlanId") ?? "");
  if (!weekPlanId) return actionError(ActionErrors.invalid);

  const owned = await requireOwnedWeekPlan(userId, weekPlanId);
  if (!owned) return actionError(ActionErrors.unauthorized);

  await revokePendingInvites(weekPlanId);
  revalidateShare(weekPlanId);
  return actionSuccess("Undangan dibatalkan");
}

export async function removePartnerAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const userId = await requireUserId();
  const weekPlanId = String(formData.get("weekPlanId") ?? "");
  if (!weekPlanId) return actionError(ActionErrors.invalid);

  const ok = await removePartner(weekPlanId, userId);
  if (!ok) return actionError(ActionErrors.unauthorized);

  revalidateShare(weekPlanId);
  return actionSuccess("Akses partner dicabut");
}

export async function leaveSharedPlanAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const userId = await requireUserId();
  const weekPlanId = String(formData.get("weekPlanId") ?? "");
  if (!weekPlanId) return actionError(ActionErrors.invalid);

  const snap = await getWeekShareSnapshot(userId, weekPlanId);
  if (!snap || snap.role !== "partner") {
    return actionError(ActionErrors.unauthorized);
  }

  await leaveSharedPlan(weekPlanId, userId);
  revalidateShare(weekPlanId);
  return actionSuccess("Kamu keluar dari plan");
}

export async function acceptWeekInviteAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const userId = await requireUserId();
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return actionError("Tautan undangan tidak valid.");

  const result = await acceptWeekInvite(token, userId);
  if (!result.ok) {
    const messages: Record<typeof result.code, string> = {
      invalid: "Tautan undangan tidak valid.",
      expired: "Tautan undangan sudah kedaluwarsa.",
      revoked: "Undangan sudah dicabut.",
      self: "Kamu tidak bisa menerima undangan sendiri.",
      partner_exists: "Minggu ini sudah punya partner lain.",
      already_member: "Kamu sudah bergabung di plan ini.",
    };
    return actionError(messages[result.code]);
  }

  revalidateShare(result.weekPlanId);
  redirect(
    plannerHref({
      weekStart: result.weekStart,
      toast: "joined_share",
    }),
  );
}

export async function rejectWeekInviteAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  await requireUserId();
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return actionError("Tautan undangan tidak valid.");

  const status = await rejectWeekInvite(token);
  if (status === "invalid") {
    return actionError("Tautan undangan tidak valid.");
  }
  revalidateShare();
  redirect("/planner");
}

/** Server helper for invite page — re-export peek for RSC. */
export async function loadWeekInvitePreview(token: string) {
  return peekWeekInvite(token);
}

export async function ensureInviteLinkAction(
  weekPlanId: string,
): Promise<ShareWeekActionState> {
  const userId = await requireUserId();
  const owned = await requireOwnedWeekPlan(userId, weekPlanId);
  if (!owned) return actionError(ActionErrors.unauthorized);

  const rl = await checkRateLimit(`week-invite:create:${userId}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) return actionError(ActionErrors.rateLimited);

  try {
    const { url } = await createOrRotateWeekInvite({
      weekPlanId,
      createdByUserId: userId,
    });
    revalidateShare(weekPlanId);
    return { inviteUrl: url, success: "Tautan undangan disalin" };
  } catch (e) {
    if (e instanceof Error && e.message === "PARTNER_EXISTS") {
      return actionError("Minggu ini sudah punya partner.");
    }
    return actionError(ActionErrors.generic);
  }
}
