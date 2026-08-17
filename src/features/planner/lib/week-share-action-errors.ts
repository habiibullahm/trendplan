import {
  actionFail,
  type ActionResult,
} from "@/lib/action-result";
import type { MailErrorCode } from "@/lib/mail";
import type { CreateWeekInviteErrorCode } from "@/features/planner/lib/week-share";
import type { AcceptInviteErrorCode } from "@/features/planner/lib/week-share";

/** Week-share ActionResult maps (testable without server actions). */
export type ShareWeekActionState = ActionResult & {
  inviteUrl?: string;
};

export const CREATE_INVITE_ACTION_ERRORS: Record<
  CreateWeekInviteErrorCode,
  ShareWeekActionState
> = {
  partner_exists: actionFail("partner_exists", {
    error: "Minggu ini sudah punya partner.",
  }),
  self_invite: actionFail("self_invite", {
    error: "Kamu tidak bisa mengundang email sendiri.",
    fieldErrors: { email: ["Kamu tidak bisa mengundang email sendiri."] },
  }),
};

export const MAIL_SEND_ACTION_ERRORS: Record<MailErrorCode, ShareWeekActionState> =
  {
    disabled: actionFail("emailDisabled"),
    not_configured: actionFail("emailDisabled"),
    rejected_address: actionFail("rejected_address", {
      error: "Alamat email ditolak pengirim. Gunakan email yang valid.",
      fieldErrors: {
        email: ["Alamat email ditolak. Gunakan email yang valid."],
      },
    }),
    send_failed: actionFail("send_failed", {
      error: "Gagal mengirim email. Coba lagi nanti.",
    }),
    generic: actionFail("generic"),
  };

export const ACCEPT_INVITE_ACTION_ERRORS: Record<
  AcceptInviteErrorCode,
  ShareWeekActionState
> = {
  invalid: actionFail("invite_invalid", {
    error: "Tautan undangan tidak valid.",
  }),
  expired: actionFail("invite_expired", {
    error: "Tautan undangan sudah kedaluwarsa.",
  }),
  revoked: actionFail("invite_revoked", {
    error: "Undangan sudah dicabut.",
  }),
  self: actionFail("invite_self", {
    error: "Kamu tidak bisa menerima undangan sendiri.",
  }),
  partner_exists: actionFail("partner_exists", {
    error: "Minggu ini sudah punya partner lain.",
  }),
  already_member: actionFail("already_member", {
    error: "Kamu sudah bergabung di plan ini.",
  }),
};

export const INVALID_INVITE_EMAIL: ShareWeekActionState = actionFail(
  "invalid_email",
  {
    error: "Email tidak valid.",
    fieldErrors: { email: ["Email tidak valid."] },
  },
);
