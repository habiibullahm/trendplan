import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACCEPT_INVITE_ACTION_ERRORS,
  CREATE_INVITE_ACTION_ERRORS,
  INVALID_INVITE_EMAIL,
  MAIL_SEND_ACTION_ERRORS,
} from "@/features/planner/lib/week-share-action-errors";

describe("week-share action error maps", () => {
  it("locks create-invite copy and errorCode", () => {
    assert.deepEqual(CREATE_INVITE_ACTION_ERRORS.partner_exists, {
      errorCode: "partner_exists",
      error: "Minggu ini sudah punya partner.",
    });
    assert.deepEqual(CREATE_INVITE_ACTION_ERRORS.self_invite, {
      errorCode: "self_invite",
      error: "Kamu tidak bisa mengundang email sendiri.",
      fieldErrors: { email: ["Kamu tidak bisa mengundang email sendiri."] },
    });
  });

  it("locks mail-send copy and errorCode (not_configured → emailDisabled)", () => {
    assert.deepEqual(MAIL_SEND_ACTION_ERRORS.disabled, {
      errorCode: "emailDisabled",
      error:
        "Email transaksi belum aktif. Aktifkan setelah domain Resend diverifikasi. Setelah masuk, ubah password dari menu Akun.",
    });
    assert.deepEqual(
      MAIL_SEND_ACTION_ERRORS.not_configured,
      MAIL_SEND_ACTION_ERRORS.disabled,
    );
    assert.deepEqual(MAIL_SEND_ACTION_ERRORS.rejected_address, {
      errorCode: "rejected_address",
      error: "Alamat email ditolak pengirim. Gunakan email yang valid.",
      fieldErrors: {
        email: ["Alamat email ditolak. Gunakan email yang valid."],
      },
    });
    assert.deepEqual(MAIL_SEND_ACTION_ERRORS.send_failed, {
      errorCode: "send_failed",
      error: "Gagal mengirim email. Coba lagi nanti.",
    });
    assert.deepEqual(MAIL_SEND_ACTION_ERRORS.generic, {
      errorCode: "generic",
      error: "Terjadi kesalahan. Coba lagi.",
    });
  });

  it("locks accept-invite copy and errorCode (domain ids, not catalog)", () => {
    assert.equal(
      ACCEPT_INVITE_ACTION_ERRORS.invalid.error,
      "Tautan undangan tidak valid.",
    );
    assert.equal(
      ACCEPT_INVITE_ACTION_ERRORS.invalid.errorCode,
      "invite_invalid",
    );
    assert.equal(
      ACCEPT_INVITE_ACTION_ERRORS.expired.error,
      "Tautan undangan sudah kedaluwarsa.",
    );
    assert.equal(ACCEPT_INVITE_ACTION_ERRORS.expired.errorCode, "invite_expired");
    assert.equal(
      ACCEPT_INVITE_ACTION_ERRORS.partner_exists.error,
      "Minggu ini sudah punya partner lain.",
    );
  });

  it("locks invalid invite email form copy", () => {
    assert.deepEqual(INVALID_INVITE_EMAIL, {
      errorCode: "invalid_email",
      error: "Email tidak valid.",
      fieldErrors: { email: ["Email tidak valid."] },
    });
  });
});
