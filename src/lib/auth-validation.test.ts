import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { passwordSchema } from "./auth-validation";

describe("passwordSchema", () => {
  it("accepts 8–12 chars with upper, lower, digit, symbol", () => {
    assert.equal(passwordSchema.safeParse("Abcd12!@").success, true);
  });

  it("rejects too short / too long", () => {
    assert.equal(passwordSchema.safeParse("Ab1!xyz").success, false); // 7
    assert.equal(passwordSchema.safeParse("Abcd12!@xyzZZ").success, false); // 13
  });

  it("rejects missing uppercase, digit, or symbol", () => {
    assert.equal(passwordSchema.safeParse("abcd12!@").success, false);
    assert.equal(passwordSchema.safeParse("Abcdef!@").success, false);
    assert.equal(passwordSchema.safeParse("Abcd1234").success, false);
  });
});
