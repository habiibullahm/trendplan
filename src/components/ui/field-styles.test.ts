import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  fieldClassName,
  fieldVariants,
  textareaClassName,
} from "./field-styles";

describe("field-styles (form primitives)", () => {
  it("keeps touch target and coral focus on inputs/selects", () => {
    const input = fieldClassName();
    assert.match(input, /\bmin-touch\b/);
    assert.match(input, /\bbg-surface\b/);
    assert.match(input, /focus-visible:border-coral/);
    assert.match(fieldClassName(undefined, "select"), /\bmin-touch\b/);
  });

  it("textarea skips min-touch floor and adds vertical padding", () => {
    const ta = textareaClassName();
    assert.doesNotMatch(ta, /\bmin-touch\b/);
    assert.match(ta, /\bpy-2\b/);
    assert.equal(ta, fieldVariants({ control: "textarea" }));
  });

  it("merges caller className last", () => {
    assert.match(fieldClassName("custom-x"), /custom-x/);
  });
});
