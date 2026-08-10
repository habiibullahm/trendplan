import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseActivityTitles } from "@/features/activities/lib/parse-titles";

describe("parseActivityTitles", () => {
  it("splits newlines into separate titles", () => {
    assert.deepEqual(
      parseActivityTitles("Picnic di taman\nNonton malam"),
      { titles: ["Picnic di taman", "Nonton malam"] },
    );
  });

  it("keeps commas inside a single line", () => {
    assert.deepEqual(parseActivityTitles("Cafe, Blok M"), {
      titles: ["Cafe, Blok M"],
    });
  });

  it("trims, collapses spaces, and skips blank lines", () => {
    assert.deepEqual(parseActivityTitles("  a  \n\n  b  "), {
      titles: ["a", "b"],
    });
  });

  it("dedupes case-insensitively", () => {
    assert.deepEqual(parseActivityTitles("Picnic\npicnic\nNonton"), {
      titles: ["Picnic", "Nonton"],
    });
  });

  it("errors on empty input", () => {
    assert.deepEqual(parseActivityTitles("   "), {
      titles: [],
      error: "Isi minimal satu aktivitas.",
    });
  });

  it("errors when a line exceeds 120 characters", () => {
    const long = "x".repeat(121);
    const result = parseActivityTitles(long);
    assert.equal(result.titles.length, 0);
    assert.match(result.error ?? "", /120 karakter/);
  });

  it("errors when more than 20 titles", () => {
    const raw = Array.from({ length: 21 }, (_, i) => `Item ${i}`).join("\n");
    const result = parseActivityTitles(raw);
    assert.equal(result.titles.length, 0);
    assert.match(result.error ?? "", /20 aktivitas/);
  });
});
