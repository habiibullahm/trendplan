import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  generateRawAuthToken,
  hashAuthToken,
} from "./auth-token-crypto";

describe("hashAuthToken", () => {
  it("is stable and hex-encoded", () => {
    const a = hashAuthToken("sample-token");
    const b = hashAuthToken("sample-token");
    assert.equal(a, b);
    assert.match(a, /^[a-f0-9]{64}$/);
  });

  it("differs for different inputs", () => {
    assert.notEqual(hashAuthToken("a"), hashAuthToken("b"));
  });
});

describe("generateRawAuthToken", () => {
  it("returns unique base64url tokens with enough entropy", () => {
    const a = generateRawAuthToken();
    const b = generateRawAuthToken();
    assert.notEqual(a, b);
    assert.match(a, /^[A-Za-z0-9_-]+$/);
    // 32 bytes → 43 base64url chars (no padding).
    assert.ok(a.length >= 40);
  });
});
