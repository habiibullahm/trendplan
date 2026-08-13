import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ActionErrors } from "@/lib/action-result";
import { gateFailureResponse } from "@/lib/gate-http";
import {
  AVATAR_UPLOAD_IP_LIMIT,
  AVATAR_UPLOAD_USER_LIMIT,
  PUSH_SUBSCRIBE_USER_LIMIT,
  PUSH_UNSUBSCRIBE_USER_LIMIT,
} from "@/lib/rate-limit-policies";

describe("rate-limit-policies", () => {
  it("keeps avatar and push windows within expected bounds", () => {
    assert.equal(AVATAR_UPLOAD_USER_LIMIT.limit, 10);
    assert.equal(AVATAR_UPLOAD_IP_LIMIT.limit, 20);
    assert.equal(PUSH_SUBSCRIBE_USER_LIMIT.limit, 30);
    assert.equal(PUSH_UNSUBSCRIBE_USER_LIMIT.limit, 30);
    assert.equal(AVATAR_UPLOAD_USER_LIMIT.windowMs, 60 * 60 * 1000);
  });
});

describe("gateFailureResponse", () => {
  it("maps gate kinds to status and ActionErrors", async () => {
    const unauthorized = gateFailureResponse({ ok: false, kind: "unauthorized" });
    assert.equal(unauthorized.status, 401);
    assert.deepEqual(await unauthorized.json(), {
      error: ActionErrors.unauthorized,
    });

    const unverified = gateFailureResponse({ ok: false, kind: "unverified" });
    assert.equal(unverified.status, 403);
    assert.deepEqual(await unverified.json(), {
      error: ActionErrors.emailUnverified,
    });

    const stale = gateFailureResponse({ ok: false, kind: "stale" });
    assert.equal(stale.status, 401);
    assert.deepEqual(await stale.json(), {
      error: ActionErrors.sessionStale,
    });
  });
});
