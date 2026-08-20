import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAdminEmail, parseAdminEmails } from "./admin";

describe("parseAdminEmails", () => {
  it("returns empty for blank or missing", () => {
    assert.deepEqual(parseAdminEmails(undefined), []);
    assert.deepEqual(parseAdminEmails(""), []);
    assert.deepEqual(parseAdminEmails("  ,  , "), []);
  });

  it("trims, lowercases, and dedupes", () => {
    assert.deepEqual(
      parseAdminEmails(" You@Example.com , other@x.id,YOU@example.com "),
      ["you@example.com", "other@x.id"],
    );
  });
});

describe("isAdminEmail", () => {
  it("is false when ADMIN_EMAILS is empty", () => {
    const prev = process.env.ADMIN_EMAILS;
    delete process.env.ADMIN_EMAILS;
    try {
      assert.equal(isAdminEmail("you@example.com"), false);
    } finally {
      if (prev === undefined) delete process.env.ADMIN_EMAILS;
      else process.env.ADMIN_EMAILS = prev;
    }
  });

  it("matches allowlisted emails case-insensitively", () => {
    const prev = process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAILS = "Owner@Trendplan.app";
    try {
      assert.equal(isAdminEmail("owner@trendplan.app"), true);
      assert.equal(isAdminEmail(" other@x.id "), false);
      assert.equal(isAdminEmail(null), false);
    } finally {
      if (prev === undefined) delete process.env.ADMIN_EMAILS;
      else process.env.ADMIN_EMAILS = prev;
    }
  });
});
