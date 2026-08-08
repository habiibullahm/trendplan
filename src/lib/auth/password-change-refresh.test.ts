import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  signPasswordChangeRefresh,
  verifyPasswordChangeRefresh,
} from "./password-change-refresh";

const SECRET = "test-auth-secret-for-pw-refresh";
const USER = "user_abc";
const NOW = Date.parse("2026-08-08T12:00:00.000Z");

describe("signPasswordChangeRefresh / verifyPasswordChangeRefresh", () => {
  it("accepts a freshly signed cookie for matching user and version", () => {
    const value = signPasswordChangeRefresh(USER, 3, {
      secret: SECRET,
      nowMs: NOW,
    });
    assert.equal(
      verifyPasswordChangeRefresh(value, USER, 3, {
        secret: SECRET,
        nowMs: NOW,
      }),
      true,
    );
  });

  it("rejects forged bare version integers", () => {
    assert.equal(
      verifyPasswordChangeRefresh("3", USER, 3, { secret: SECRET, nowMs: NOW }),
      false,
    );
    assert.equal(
      verifyPasswordChangeRefresh("user_abc.3.9999999999.deadbeef", USER, 3, {
        secret: SECRET,
        nowMs: NOW,
      }),
      false,
    );
  });

  it("rejects wrong userId even with valid signature shape for another user", () => {
    const value = signPasswordChangeRefresh(USER, 2, {
      secret: SECRET,
      nowMs: NOW,
    });
    assert.equal(
      verifyPasswordChangeRefresh(value, "other_user", 2, {
        secret: SECRET,
        nowMs: NOW,
      }),
      false,
    );
  });

  it("rejects wrong passwordVersion", () => {
    const value = signPasswordChangeRefresh(USER, 2, {
      secret: SECRET,
      nowMs: NOW,
    });
    assert.equal(
      verifyPasswordChangeRefresh(value, USER, 3, {
        secret: SECRET,
        nowMs: NOW,
      }),
      false,
    );
  });

  it("rejects expired cookies", () => {
    const value = signPasswordChangeRefresh(USER, 1, {
      secret: SECRET,
      nowMs: NOW,
      ttlSec: 60,
    });
    assert.equal(
      verifyPasswordChangeRefresh(value, USER, 1, {
        secret: SECRET,
        nowMs: NOW + 61_000,
      }),
      false,
    );
  });

  it("rejects tampered payload with original signature", () => {
    const value = signPasswordChangeRefresh(USER, 1, {
      secret: SECRET,
      nowMs: NOW,
    });
    const parts = value.split(".");
    parts[1] = "2";
    const tampered = parts.join(".");
    assert.equal(
      verifyPasswordChangeRefresh(tampered, USER, 2, {
        secret: SECRET,
        nowMs: NOW,
      }),
      false,
    );
  });
});
