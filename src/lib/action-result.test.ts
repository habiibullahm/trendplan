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
  it("sets errorCode and default ActionErrors message for catalog codes", () => {
    assert.deepEqual(actionFail("generic"), {
      errorCode: "generic",
      error: ActionErrors.generic,
    });
  });

  it("allows custom error and fieldErrors for domain error codes", () => {
    assert.deepEqual(
      actionFail("self_invite", {
        error: "Kamu tidak bisa mengundang email sendiri.",
        fieldErrors: {
          email: ["Kamu tidak bisa mengundang email sendiri."],
        },
      }),
      {
        errorCode: "self_invite",
        error: "Kamu tidak bisa mengundang email sendiri.",
        fieldErrors: {
          email: ["Kamu tidak bisa mengundang email sendiri."],
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
  it("maps ActionErrorCode including generic and sets errorCode", () => {
    assert.deepEqual(actionErrorCode("generic"), {
      errorCode: "generic",
      error: ActionErrors.generic,
    });
    assert.deepEqual(actionErrorCode("invalid"), {
      errorCode: "invalid",
      error: ActionErrors.invalid,
    });
  });
});

describe("actionError / actionSuccess", () => {
  it("keeps free-form error without requiring errorCode", () => {
    assert.deepEqual(actionError("Custom"), { error: "Custom" });
  });

  it("returns success message only", () => {
    assert.deepEqual(actionSuccess("Ok"), { success: "Ok" });
  });
});

describe("actionFieldErrors / fromZodError", () => {
  it("sets validation errorCode without a toast error string", () => {
    assert.deepEqual(actionFieldErrors({ email: ["x"] }), {
      errorCode: "validation",
      fieldErrors: { email: ["x"] },
    });
  });
});
