import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACCEPT_INVITE_ACTION_ERRORS,
  CREATE_INVITE_ACTION_ERRORS,
  INVALID_INVITE_EMAIL,
  MAIL_SEND_ACTION_ERRORS,
} from "@/features/planner/lib/week-share-action-errors";
import { ActionErrors } from "@/lib/action-result";

describe("week-share action error maps", () => {
  it("locks create-invite copy and errorCode", () => {
    assert.deepEqual(CREATE_INVITE_ACTION_ERRORS.partner_exists, {
      status: "error",
      message: "Minggu ini sudah punya partner.",
      data: { errorCode: "partner_exists" },
    });
    assert.deepEqual(CREATE_INVITE_ACTION_ERRORS.self_invite, {
      status: "error",
      message: "Kamu tidak bisa mengundang email sendiri.",
      data: {
        errorCode: "self_invite",
        fieldErrors: { email: ["Kamu tidak bisa mengundang email sendiri."] },
      },
    });
  });

  it("locks mail-send copy and errorCode (not_configured → emailDisabled)", () => {
    assert.deepEqual(MAIL_SEND_ACTION_ERRORS.disabled, {
      status: "error",
      message: ActionErrors.emailDisabled,
      data: { errorCode: "emailDisabled" },
    });
    assert.deepEqual(
      MAIL_SEND_ACTION_ERRORS.not_configured,
      MAIL_SEND_ACTION_ERRORS.disabled,
    );
    assert.deepEqual(MAIL_SEND_ACTION_ERRORS.rejected_address, {
      status: "error",
      message: "Alamat email ditolak pengirim. Gunakan email yang valid.",
      data: {
        errorCode: "rejected_address",
        fieldErrors: {
          email: ["Alamat email ditolak. Gunakan email yang valid."],
        },
      },
    });
    assert.deepEqual(MAIL_SEND_ACTION_ERRORS.send_failed, {
      status: "error",
      message: "Gagal mengirim email. Coba lagi nanti.",
      data: { errorCode: "send_failed" },
    });
    assert.deepEqual(MAIL_SEND_ACTION_ERRORS.generic, {
      status: "error",
      message: ActionErrors.generic,
      data: { errorCode: "generic" },
    });
  });

  it("locks accept-invite copy and errorCode (domain ids, not catalog)", () => {
    assert.equal(
      ACCEPT_INVITE_ACTION_ERRORS.invalid.message,
      "Tautan undangan tidak valid.",
    );
    assert.equal(
      ACCEPT_INVITE_ACTION_ERRORS.invalid.data?.errorCode,
      "invite_invalid",
    );
    assert.equal(
      ACCEPT_INVITE_ACTION_ERRORS.expired.message,
      "Tautan undangan sudah kedaluwarsa.",
    );
    assert.equal(
      ACCEPT_INVITE_ACTION_ERRORS.expired.data?.errorCode,
      "invite_expired",
    );
    assert.equal(
      ACCEPT_INVITE_ACTION_ERRORS.partner_exists.message,
      "Minggu ini sudah punya partner lain.",
    );
  });

  it("locks invalid invite email form copy", () => {
    assert.deepEqual(INVALID_INVITE_EMAIL, {
      status: "error",
      message: "Email tidak valid.",
      data: {
        errorCode: "invalid_email",
        fieldErrors: { email: ["Email tidak valid."] },
      },
    });
  });
});
