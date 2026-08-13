import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Mirrors the typewriter loop in content-edit-form (kept local there for
 * client bundling). Smoke-tests chunking + stale-gen abort.
 */
async function typeText(
  full: string,
  onChunk: (partial: string) => void,
  opts: {
    isCurrent: () => boolean;
    charsPerChunk: number;
    msPerChunk: number;
  },
) {
  onChunk("");
  if (!full) return;
  for (let i = 0; i < full.length; i += opts.charsPerChunk) {
    if (!opts.isCurrent()) return;
    onChunk(full.slice(0, Math.min(i + opts.charsPerChunk, full.length)));
    await new Promise<void>((r) => setTimeout(r, opts.msPerChunk));
  }
}

describe("AI saran typewriter", () => {
  it("types full string in chunks", async () => {
    const chunks: string[] = [];
    await typeText("abcdef", (p) => chunks.push(p), {
      isCurrent: () => true,
      charsPerChunk: 2,
      msPerChunk: 0,
    });
    assert.deepEqual(chunks, ["", "ab", "abcd", "abcdef"]);
  });

  it("stops when generation becomes stale", async () => {
    let current = true;
    const chunks: string[] = [];
    const done = typeText("abcdefghij", (p) => {
      chunks.push(p);
      if (p.length >= 4) current = false;
    }, {
      isCurrent: () => current,
      charsPerChunk: 2,
      msPerChunk: 0,
    });
    await done;
    assert.ok(chunks[chunks.length - 1]!.length < 10);
  });
});
