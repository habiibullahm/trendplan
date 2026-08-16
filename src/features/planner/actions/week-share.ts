"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  actionError,
  actionErrorCode,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";
import { isTransactionalEmailEnabled } from "@/lib/auth/env";
import { requireAppUserAction } from "@/lib/auth/require-app-user";
import { isMailSendError, sendMail, type MailErrorCode } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { formatWeekRange, plannerHref } from "@/lib/week";
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
  isSelfInviteEmail,
  type CreateWeekInviteErrorCode,
} from "@/features/planner/lib/week-share";
import { escapeHtml } from "@/lib/escape-html";
import { prisma } from "@/lib/prisma";

export type ShareWeekActionState = ActionResult & {
  inviteUrl?: string;
};

const emailSchema = z.string().trim().email().max(254);

const CREATE_INVITE_ERRORS: Record<CreateWeekInviteErrorCode, ShareWeekActionState> =
  {
    partner_exists: actionError("Minggu ini sudah punya partner."),
    self_invite: {
      error: "Kamu tidak bisa mengundang email sendiri.",
      fieldErrors: { email: ["Kamu tidak bisa mengundang email sendiri."] },
    },
  };

const MAIL_SEND_ERRORS: Record<MailErrorCode, ShareWeekActionState> = {
  disabled: actionErrorCode("emailDisabled"),
  not_configured: actionErrorCode("emailDisabled"),
  rejected_address: {
    error: "Alamat email ditolak pengirim. Gunakan email yang valid.",
    fieldErrors: {
      email: ["Alamat email ditolak. Gunakan email yang valid."],
    },
  },
  send_failed: actionError("Gagal mengirim email. Coba lagi nanti."),
  generic: actionErrorCode("generic"),
};

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

async function weekHasPartner(weekPlanId: string): Promise<boolean> {
  const seat = await prisma.weekPlanMember.findUnique({
    where: { weekPlanId },
    select: { id: true },
  });
  return Boolean(seat);
}

export async function createOrRotateWeekInviteAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;
  const weekPlanId = String(formData.get("weekPlanId") ?? "");
  if (!weekPlanId) return actionErrorCode("invalid");

  const owned = await requireOwnedWeekPlan(gated.userId, weekPlanId);
  if (!owned) return actionErrorCode("unauthorized");

  // Fail before burning the create rate-limit window.
  if (await weekHasPartner(weekPlanId)) {
    return CREATE_INVITE_ERRORS.partner_exists;
  }

  const rl = await checkRateLimit(`week-invite:create:${gated.userId}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) return actionErrorCode("rateLimited");

  const created = await createOrRotateWeekInvite({
    weekPlanId,
    createdByUserId: gated.userId,
  });
  if (!created.ok) return CREATE_INVITE_ERRORS[created.code];

  revalidateShare(weekPlanId);
  return { ...actionSuccess("Tautan undangan siap"), inviteUrl: created.url };
}

export async function sendWeekInviteEmailAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;
  const weekPlanId = String(formData.get("weekPlanId") ?? "");
  const emailParsed = emailSchema.safeParse(formData.get("email") ?? "");
  if (!weekPlanId) return actionErrorCode("invalid");
  if (!emailParsed.success) {
    return {
      error: "Email tidak valid.",
      fieldErrors: { email: ["Email tidak valid."] },
    };
  }

  const owned = await requireOwnedWeekPlan(gated.userId, weekPlanId);
  if (!owned) return actionErrorCode("unauthorized");

  if (!isTransactionalEmailEnabled()) {
    return actionErrorCode("emailDisabled");
  }

  const owner = await prisma.user.findUnique({
    where: { id: gated.userId },
    select: { name: true, email: true },
  });

  // Reject before burning the email invite rate-limit window.
  if (isSelfInviteEmail(owner?.email, emailParsed.data)) {
    return CREATE_INVITE_ERRORS.self_invite;
  }
  if (await weekHasPartner(weekPlanId)) {
    return CREATE_INVITE_ERRORS.partner_exists;
  }

  const rl = await checkRateLimit(`week-invite:email:${gated.userId}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) return actionErrorCode("rateLimited");

  // Create without revoking older pending links until mail succeeds.
  const created = await createOrRotateWeekInvite({
    weekPlanId,
    createdByUserId: gated.userId,
    invitedEmail: emailParsed.data,
    revokePrevious: false,
  });
  if (!created.ok) return CREATE_INVITE_ERRORS[created.code];

  const weekLabel = formatWeekRange(owned.weekStart);
  const ownerLabel = owner ? partnerDisplayName(owner) : "Seseorang";
  const safeOwner = escapeHtml(ownerLabel);
  const safeWeek = escapeHtml(weekLabel);
  const safeHref = escapeHtml(created.url);

  try {
    await sendMail({
      to: emailParsed.data,
      subject: `${ownerLabel} mengundangmu ke plan TrendPlan`,
      text: `${ownerLabel} mengundangmu ke minggu ${weekLabel} di TrendPlan.\n\nTerima undangan: ${created.url}\n\nTautan berlaku 7 hari.`,
      html: `<p><strong>${safeOwner}</strong> mengundangmu ke minggu <strong>${safeWeek}</strong> di TrendPlan.</p><p><a href="${safeHref}">Terima undangan</a></p><p>Tautan berlaku 7 hari.</p>`,
    });
  } catch (mailError) {
    await revokeInviteById(created.inviteId);
    if (isMailSendError(mailError)) {
      return MAIL_SEND_ERRORS[mailError.code];
    }
    return actionErrorCode("generic");
  }

  await revokeOtherPendingInvites(weekPlanId, created.inviteId);
  revalidateShare(weekPlanId);
  return { ...actionSuccess("Undangan dikirim"), inviteUrl: created.url };
}

export async function revokeWeekInviteAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;
  const weekPlanId = String(formData.get("weekPlanId") ?? "");
  if (!weekPlanId) return actionErrorCode("invalid");

  const owned = await requireOwnedWeekPlan(gated.userId, weekPlanId);
  if (!owned) return actionErrorCode("unauthorized");

  await revokePendingInvites(weekPlanId);
  revalidateShare(weekPlanId);
  return actionSuccess("Undangan dibatalkan");
}

export async function removePartnerAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;
  const weekPlanId = String(formData.get("weekPlanId") ?? "");
  if (!weekPlanId) return actionErrorCode("invalid");

  const ok = await removePartner(weekPlanId, gated.userId);
  if (!ok) return actionErrorCode("unauthorized");

  revalidateShare(weekPlanId);
  return actionSuccess("Akses partner dicabut");
}

export async function leaveSharedPlanAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;
  const weekPlanId = String(formData.get("weekPlanId") ?? "");
  if (!weekPlanId) return actionErrorCode("invalid");

  const snap = await getWeekShareSnapshot(gated.userId, weekPlanId);
  if (!snap || snap.role !== "partner") {
    return actionErrorCode("unauthorized");
  }

  await leaveSharedPlan(weekPlanId, gated.userId);
  revalidateShare(weekPlanId);
  return actionSuccess("Kamu keluar dari plan");
}

export async function acceptWeekInviteAction(
  _prev: ShareWeekActionState,
  formData: FormData,
): Promise<ShareWeekActionState> {
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return actionError("Tautan undangan tidak valid.");

  const result = await acceptWeekInvite(token, gated.userId);
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
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;
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
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;
  const owned = await requireOwnedWeekPlan(gated.userId, weekPlanId);
  if (!owned) return actionErrorCode("unauthorized");

  if (await weekHasPartner(weekPlanId)) {
    return CREATE_INVITE_ERRORS.partner_exists;
  }

  const rl = await checkRateLimit(`week-invite:create:${gated.userId}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) return actionErrorCode("rateLimited");

  const created = await createOrRotateWeekInvite({
    weekPlanId,
    createdByUserId: gated.userId,
  });
  if (!created.ok) return CREATE_INVITE_ERRORS[created.code];

  revalidateShare(weekPlanId);
  return { inviteUrl: created.url, success: "Tautan undangan disalin" };
}
