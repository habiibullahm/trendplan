import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateFixedWindow } from "./rate-limit-window";

describe("evaluateFixedWindow", () => {
  it("allows requests under the limit", () => {
    const opts = { limit: 3, windowMs: 60_000 };
    const t0 = 1_000_000;
    const a = evaluateFixedWindow(null, t0, opts);
    assert.equal(a.ok, true);
    if (!a.ok) return;
    const b = evaluateFixedWindow(a.next, t0 + 1, opts);
    assert.equal(b.ok, true);
    if (!b.ok) return;
    const c = evaluateFixedWindow(b.next, t0 + 2, opts);
    assert.equal(c.ok, true);
  });

  it("blocks when limit is exceeded", () => {
    const opts = { limit: 2, windowMs: 60_000 };
    const t0 = 1_000_000;
    const a = evaluateFixedWindow(null, t0, opts);
    assert.equal(a.ok, true);
    if (!a.ok) return;
    const b = evaluateFixedWindow(a.next, t0 + 1, opts);
    assert.equal(b.ok, true);
    if (!b.ok) return;
    const blocked = evaluateFixedWindow(b.next, t0 + 2, opts);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.ok(blocked.retryAfterSec >= 1);
    }
  });

  it("resets after the window", () => {
    const opts = { limit: 1, windowMs: 1_000 };
    const t0 = 1_000_000;
    const a = evaluateFixedWindow(null, t0, opts);
    assert.equal(a.ok, true);
    if (!a.ok) return;
    const blocked = evaluateFixedWindow(a.next, t0 + 1, opts);
    assert.equal(blocked.ok, false);
    const after = evaluateFixedWindow(a.next, t0 + 1_001, opts);
    assert.equal(after.ok, true);
  });
});
