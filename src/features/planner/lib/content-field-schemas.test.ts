import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  captionSchema,
  hashtagsSchema,
  hookSchema,
} from "./content-field-schemas";

describe("content field schemas", () => {
  it("accepts empty and bounded strings", () => {
    assert.equal(hookSchema.safeParse("").success, true);
    assert.equal(hookSchema.safeParse("a".repeat(280)).success, true);
    assert.equal(captionSchema.safeParse("a".repeat(2000)).success, true);
    assert.equal(hashtagsSchema.safeParse("#a #b").success, true);
  });

  it("rejects oversized hook / caption / hashtags", () => {
    assert.equal(hookSchema.safeParse("a".repeat(281)).success, false);
    assert.equal(captionSchema.safeParse("a".repeat(2001)).success, false);
    assert.equal(hashtagsSchema.safeParse("a".repeat(501)).success, false);
  });
});
