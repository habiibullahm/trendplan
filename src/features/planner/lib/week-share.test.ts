import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildInviteUrl,
  isSelfInviteEmail,
  normalizeInviteEmail,
  partnerDisplayName,
  shareRoleForUser,
} from "./week-share-pure";
import {
  createWeekInviteRawToken,
  hashWeekInviteToken,
} from "./week-share-tokens";

describe("week-share-pure", () => {
  it("partnerDisplayName prefers first name then email local-part", () => {
    assert.equal(
      partnerDisplayName({ name: "Rina Putri", email: "rina@example.com" }),
      "Rina",
    );
    assert.equal(
      partnerDisplayName({ name: null, email: "partner@example.com" }),
      "partner",
    );
  });

  it("shareRoleForUser distinguishes owner, partner, and stranger", () => {
    const plan = {
      userId: "owner-1",
      members: [{ userId: "partner-1" }],
    };
    assert.equal(shareRoleForUser(plan, "owner-1"), "owner");
    assert.equal(shareRoleForUser(plan, "partner-1"), "partner");
    assert.equal(shareRoleForUser(plan, "other"), null);
  });

  it("buildInviteUrl encodes token", () => {
    assert.equal(
      buildInviteUrl("https://trendplan.vercel.app", "abc+/=xyz"),
      "https://trendplan.vercel.app/invite/week?token=abc%2B%2F%3Dxyz",
    );
  });

  it("isSelfInviteEmail compares case-insensitively after trim", () => {
    assert.equal(normalizeInviteEmail("  Me@Example.COM "), "me@example.com");
    assert.equal(isSelfInviteEmail("me@example.com", "Me@Example.COM"), true);
    assert.equal(isSelfInviteEmail("me@example.com", "partner@example.com"), false);
    assert.equal(isSelfInviteEmail(null, "me@example.com"), false);
    assert.equal(isSelfInviteEmail(undefined, "me@example.com"), false);
  });
});

describe("week-share-tokens", () => {
  it("hashes tokens deterministically and generates unique raws", () => {
    const a = createWeekInviteRawToken();
    const b = createWeekInviteRawToken();
    assert.notEqual(a, b);
    assert.equal(hashWeekInviteToken(a), hashWeekInviteToken(a));
    assert.notEqual(hashWeekInviteToken(a), hashWeekInviteToken(b));
    assert.match(hashWeekInviteToken(a), /^[a-f0-9]{64}$/);
  });
});
