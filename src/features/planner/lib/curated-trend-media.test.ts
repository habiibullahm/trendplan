import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CURATED_COVERS,
  resolveCuratedMediaFields,
  rewriteMockMediaUrl,
} from "./curated-trend-media";

describe("rewriteMockMediaUrl", () => {
  it("returns null for empty input", () => {
    assert.equal(rewriteMockMediaUrl(null), null);
    assert.equal(rewriteMockMediaUrl(undefined), null);
  });

  it("rewrites /mocks/ covers and drops retired video/audio mocks", () => {
    assert.equal(
      rewriteMockMediaUrl("/mocks/covers/coral.svg"),
      CURATED_COVERS[0],
    );
    assert.equal(rewriteMockMediaUrl("/mocks/video/sample.mp4"), null);
    assert.equal(rewriteMockMediaUrl("/mocks/audio/tone-b.wav"), null);
  });

  it("passes through non-mock URLs", () => {
    assert.equal(
      rewriteMockMediaUrl("/media/trends/covers/ink-night.svg"),
      "/media/trends/covers/ink-night.svg",
    );
  });
});

describe("resolveCuratedMediaFields", () => {
  it("keeps intentional empty rows empty", () => {
    const next = resolveCuratedMediaFields({ coverUrl: null }, 0);
    assert.equal(next.coverUrl, null);
    assert.equal(next.changed, false);
  });

  it("rewrites mock covers", () => {
    const next = resolveCuratedMediaFields(
      { coverUrl: "/mocks/covers/sage.svg" },
      1,
    );
    assert.equal(next.coverUrl, CURATED_COVERS[1]);
    assert.ok(next.changed);
  });

  it("preserves curated covers", () => {
    const cover = CURATED_COVERS[0]!;
    const next = resolveCuratedMediaFields({ coverUrl: cover }, 0);
    assert.equal(next.coverUrl, cover);
    assert.equal(next.changed, false);
  });
});
