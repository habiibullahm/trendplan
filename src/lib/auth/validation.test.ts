import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  passwordSchema,
  resetPasswordSchema,
  requestPasswordResetSchema,
} from "./validation";

describe("passwordSchema", () => {
  it("accepts length-only passwords of 10–128 chars", () => {
    assert.equal(passwordSchema.safeParse("password12").success, true);
    assert.equal(passwordSchema.safeParse("a".repeat(10)).success, true);
  });

  it("rejects too short / too long", () => {
    assert.equal(passwordSchema.safeParse("short").success, false);
    assert.equal(passwordSchema.safeParse("a".repeat(9)).success, false);
    assert.equal(passwordSchema.safeParse("a".repeat(129)).success, false);
  });
});

describe("requestPasswordResetSchema", () => {
  it("requires a valid email", () => {
    assert.equal(
      requestPasswordResetSchema.safeParse({ email: "a@b.co" }).success,
      true,
    );
    assert.equal(
      requestPasswordResetSchema.safeParse({ email: "nope" }).success,
      false,
    );
  });
});

describe("resetPasswordSchema", () => {
  it("requires matching passwords and a token", () => {
    const ok = resetPasswordSchema.safeParse({
      token: "abc",
      newPassword: "password12",
      confirmPassword: "password12",
    });
    assert.equal(ok.success, true);

    const mismatch = resetPasswordSchema.safeParse({
      token: "abc",
      newPassword: "password12",
      confirmPassword: "password99",
    });
    assert.equal(mismatch.success, false);
  });
});
