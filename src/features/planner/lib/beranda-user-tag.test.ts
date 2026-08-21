import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { berandaUserTag } from "@/features/planner/lib/beranda-cache-tag";

describe("berandaUserTag", () => {
  it("scopes cache invalidation per user", () => {
    assert.equal(berandaUserTag("user_a"), "beranda-user-user_a");
    assert.notEqual(berandaUserTag("a"), berandaUserTag("b"));
  });
});
