import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dbSecurityClaims,
  isPasswordVersionCurrent,
  shouldInvalidateForPasswordVersion,
} from "./jwt-claims";

describe("dbSecurityClaims", () => {
  it("maps DB row to JWT claims (source of truth for session update)", () => {
    const verifiedAt = new Date("2026-08-08T12:00:00.000Z");
    const claims = dbSecurityClaims({
      onboardingComplete: true,
      passwordNeedsUpgrade: false,
      passwordVersion: 3,
      emailVerified: verifiedAt,
    });

    assert.deepEqual(claims, {
      onboardingComplete: true,
      passwordNeedsUpgrade: false,
      passwordVersion: 3,
      emailVerified: "2026-08-08T12:00:00.000Z",
    });
  });

  it("null emailVerified stays null (client cannot forge via this helper)", () => {
    const fromDb = dbSecurityClaims({
      onboardingComplete: false,
      passwordNeedsUpgrade: true,
      passwordVersion: 1,
      emailVerified: null,
    });
    const forgedClient = {
      emailVerified: "2026-01-01T00:00:00.000Z",
      passwordVersion: 99,
    };

    // Update path must use DB claims, not merge forged client fields.
    assert.equal(fromDb.emailVerified, null);
    assert.equal(fromDb.passwordVersion, 1);
    assert.notEqual(fromDb.emailVerified, forgedClient.emailVerified);
    assert.notEqual(fromDb.passwordVersion, forgedClient.passwordVersion);
  });
});

describe("isPasswordVersionCurrent", () => {
  it("treats missing token version as 0", () => {
    assert.equal(isPasswordVersionCurrent(undefined, 0), true);
    assert.equal(isPasswordVersionCurrent(undefined, 1), false);
  });

  it("rejects stale versions after reset", () => {
    assert.equal(isPasswordVersionCurrent(1, 2), false);
    assert.equal(isPasswordVersionCurrent(2, 2), true);
  });
});

describe("shouldInvalidateForPasswordVersion", () => {
  it("invalidates on version diverge even for Auth.js update trigger", () => {
    // Refresh after bump must use signed grace cookie — not trigger alone.
    assert.equal(shouldInvalidateForPasswordVersion("update", 0, 1), true);
  });

  it("invalidates other sessions when version diverges", () => {
    assert.equal(shouldInvalidateForPasswordVersion(undefined, 0, 1), true);
    assert.equal(shouldInvalidateForPasswordVersion("signIn", 1, 1), false);
  });
});
