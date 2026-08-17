import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ActionErrors,
  actionErrorCode,
  type ActionErrorCode,
} from "@/lib/action-result";
import {
  CodedError,
  isCodedError,
  isCodedErrorWithCode,
} from "@/lib/errors/coded-error";
import {
  classifyResendFailure,
  isMailSendError,
  MailSendError,
} from "@/lib/mail/errors";

describe("actionErrorCode", () => {
  it("maps ActionErrorCode including generic and sets errorCode", () => {
    const code: ActionErrorCode = "generic";
    assert.deepEqual(actionErrorCode(code), {
      errorCode: "generic",
      error: ActionErrors.generic,
    });
    assert.deepEqual(actionErrorCode("invalid"), {
      errorCode: "invalid",
      error: ActionErrors.invalid,
    });
  });
});

describe("CodedError", () => {
  it("carries a stable code", () => {
    const err = new CodedError("generic");
    assert.equal(err.code, "generic");
    assert.equal(isCodedError(err), true);
    assert.equal(isCodedErrorWithCode(err, "generic"), true);
    assert.equal(isCodedErrorWithCode(err, "invalid"), false);
  });
});

describe("MailSendError", () => {
  it("extends CodedError with mail-specific codes", () => {
    const err = new MailSendError("rejected_address");
    assert.equal(err.code, "rejected_address");
    assert.equal(err.name, "MailSendError");
    assert.equal(isMailSendError(err), true);
    assert.equal(isCodedError(err), true);
    assert.equal(isMailSendError(new CodedError("generic")), false);
  });
});

describe("classifyResendFailure", () => {
  it("maps 422 / validation errors to rejected_address", () => {
    assert.equal(classifyResendFailure(422, "{}"), "rejected_address");
    assert.equal(
      classifyResendFailure(
        400,
        '{"name":"validation_error","message":"Invalid `to` field"}',
      ),
      "rejected_address",
    );
    assert.equal(
      classifyResendFailure(400, "Invalid `to` field. Use a real inbox."),
      "rejected_address",
    );
  });

  it("maps other failures to send_failed without relying on example.com", () => {
    assert.equal(classifyResendFailure(500, "internal"), "send_failed");
    assert.equal(
      classifyResendFailure(429, "rate limited example.com"),
      "send_failed",
    );
  });
});
