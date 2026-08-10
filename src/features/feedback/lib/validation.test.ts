import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  sanitizeFeedbackMessage,
  submitFeedbackSchema,
} from "@/features/feedback/lib/validation";

describe("sanitizeFeedbackMessage", () => {
  it("trims and strips C0 control characters", () => {
    assert.equal(
      sanitizeFeedbackMessage("  hello\u0000world\nnext  "),
      "helloworld\nnext",
    );
  });
});

describe("submitFeedbackSchema", () => {
  it("accepts a valid saran payload", () => {
    const parsed = submitFeedbackSchema.safeParse({
      category: "saran",
      message: "Tolong tambah filter niche di planner.",
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.category, "saran");
      assert.match(parsed.data.message, /filter niche/);
    }
  });

  it("rejects unknown category", () => {
    const parsed = submitFeedbackSchema.safeParse({
      category: "spam",
      message: "Pesan yang panjang cukup untuk lolos min.",
    });
    assert.equal(parsed.success, false);
  });

  it("rejects messages shorter than 10 after trim/sanitize", () => {
    const parsed = submitFeedbackSchema.safeParse({
      category: "bug",
      message: "  pendek  ",
    });
    assert.equal(parsed.success, false);
  });

  it("rejects messages longer than 1000", () => {
    const parsed = submitFeedbackSchema.safeParse({
      category: "lainnya",
      message: "x".repeat(1001),
    });
    assert.equal(parsed.success, false);
  });
});
