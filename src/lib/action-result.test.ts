import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ActionErrors,
  actionError,
  actionErrorCode,
  actionFail,
  actionFieldErrors,
  actionSuccess,
} from "@/lib/action-result";

describe("actionFail", () => {
  it("sets status error, message, and data.errorCode for catalog codes", () => {
    assert.deepEqual(actionFail("generic"), {
      status: "error",
      message: ActionErrors.generic,
      data: { errorCode: "generic" },
    });
  });

  it("allows custom message and fieldErrors for domain error codes", () => {
    assert.deepEqual(
      actionFail("self_invite", {
        error: "Kamu tidak bisa mengundang email sendiri.",
        fieldErrors: {
          email: ["Kamu tidak bisa mengundang email sendiri."],
        },
      }),
      {
        status: "error",
        message: "Kamu tidak bisa mengundang email sendiri.",
        data: {
          errorCode: "self_invite",
          fieldErrors: {
            email: ["Kamu tidak bisa mengundang email sendiri."],
          },
        },
      },
    );
  });

  it("throws when a domain error code has no extras.error", () => {
    const failDomain = actionFail as (
      errorCode: string,
      extras?: { error?: string },
    ) => ReturnType<typeof actionFail>;
    assert.throws(
      () => failDomain("partner_exists"),
      /domain error codes require extras\.error/,
    );
  });
});

describe("actionErrorCode", () => {
  it("maps ActionErrorCode including generic", () => {
    assert.deepEqual(actionErrorCode("generic"), {
      status: "error",
      message: ActionErrors.generic,
      data: { errorCode: "generic" },
    });
    assert.deepEqual(actionErrorCode("invalid"), {
      status: "error",
      message: ActionErrors.invalid,
      data: { errorCode: "invalid" },
    });
  });
});

describe("actionError / actionSuccess", () => {
  it("keeps free-form error without requiring errorCode", () => {
    assert.deepEqual(actionError("Custom"), {
      status: "error",
      message: "Custom",
    });
  });

  it("returns success message; optional data", () => {
    assert.deepEqual(actionSuccess("Ok"), {
      status: "success",
      message: "Ok",
    });
    assert.deepEqual(actionSuccess("Sent", { inviteUrl: "/x" }), {
      status: "success",
      message: "Sent",
      data: { inviteUrl: "/x" },
    });
  });
});

describe("actionFieldErrors / fromZodError", () => {
  it("sets validation errorCode without a toast message", () => {
    assert.deepEqual(actionFieldErrors({ email: ["x"] }), {
      status: "error",
      data: {
        errorCode: "validation",
        fieldErrors: { email: ["x"] },
      },
    });
  });
});
