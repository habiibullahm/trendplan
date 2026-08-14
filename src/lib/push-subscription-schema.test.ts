import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PUSH_ENDPOINT_MAX,
  pushSubscribeBodySchema,
  pushUnsubscribeBodySchema,
} from "./push-subscription-schema";

describe("pushSubscribeBodySchema", () => {
  it("accepts a valid https subscription", () => {
    const parsed = pushSubscribeBodySchema.safeParse({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      keys: { p256dh: "BNc", auth: "tBH" },
    });
    assert.equal(parsed.success, true);
  });

  it("rejects http endpoints and oversized fields", () => {
    assert.equal(
      pushSubscribeBodySchema.safeParse({
        endpoint: "http://evil.example/push",
        keys: { p256dh: "x", auth: "y" },
      }).success,
      false,
    );
    assert.equal(
      pushSubscribeBodySchema.safeParse({
        endpoint: `https://x.com/${"a".repeat(PUSH_ENDPOINT_MAX)}`,
        keys: { p256dh: "x", auth: "y" },
      }).success,
      false,
    );
  });
});

describe("pushUnsubscribeBodySchema", () => {
  it("allows empty object or a bounded endpoint", () => {
    assert.equal(pushUnsubscribeBodySchema.safeParse({}).success, true);
    assert.equal(
      pushUnsubscribeBodySchema.safeParse({
        endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      }).success,
      true,
    );
    assert.equal(
      pushUnsubscribeBodySchema.safeParse({ endpoint: "not-https" }).success,
      false,
    );
  });
});
