import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { escapeHtml } from "./escape-html";

describe("escapeHtml", () => {
  it("escapes markup-sensitive characters", () => {
    assert.equal(
      escapeHtml(`<img src=x onerror="alert(1)">&'`),
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;",
    );
  });

  it("leaves plain text unchanged", () => {
    assert.equal(escapeHtml("Habib"), "Habib");
  });
});
