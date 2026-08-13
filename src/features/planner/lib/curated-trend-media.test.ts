import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CURATED_COVERS,
  CURATED_VIDEOS,
  resolveCuratedMediaFields,
  rewriteMockMediaUrl,
} from "./curated-trend-media";

describe("rewriteMockMediaUrl", () => {
  it("returns null for empty input", () => {
    assert.equal(rewriteMockMediaUrl(null), null);
    assert.equal(rewriteMockMediaUrl(undefined), null);
  });

  it("rewrites /mocks/ covers, video, and audio", () => {
    assert.equal(
      rewriteMockMediaUrl("/mocks/covers/coral.svg"),
      CURATED_COVERS[0],
    );
    assert.equal(
      rewriteMockMediaUrl("/mocks/video/sample.mp4"),
      CURATED_VIDEOS[0],
    );
    assert.equal(
      rewriteMockMediaUrl("/mocks/audio/tone-b.wav"),
      "/media/trends/audio/loop-warm.wav",
    );
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
    const next = resolveCuratedMediaFields(
      {
        coverUrl: null,
        videoUrl: null,
        audioTitle: null,
        audioUrl: null,
      },
      0,
    );
    assert.equal(next.coverUrl, null);
    assert.equal(next.videoUrl, null);
    assert.equal(next.audioUrl, null);
    assert.equal(next.changed, false);
  });

  it("rewrites mock video to curated", () => {
    const next = resolveCuratedMediaFields(
      {
        coverUrl: "/mocks/covers/sage.svg",
        videoUrl: "/mocks/video/sample.mp4",
        audioTitle: "soft piano loop (mock)",
        audioUrl: "/mocks/audio/tone-a.wav",
      },
      1,
    );
    assert.equal(next.coverUrl, CURATED_COVERS[1]);
    assert.equal(next.videoUrl, CURATED_VIDEOS[0]);
    assert.ok(next.changed);
  });

  it("preserves curated cover-only (null video)", () => {
    const cover = CURATED_COVERS[0]!;
    const next = resolveCuratedMediaFields(
      {
        coverUrl: cover,
        videoUrl: null,
        audioTitle: "original sound — date night",
        audioUrl: null,
      },
      0,
    );
    assert.equal(next.coverUrl, cover);
    assert.equal(next.videoUrl, null);
    assert.equal(next.audioUrl, null);
    assert.equal(next.changed, false);
  });

  it("fills incomplete null cover+video that is not intentional empty", () => {
    const next = resolveCuratedMediaFields(
      {
        coverUrl: null,
        videoUrl: null,
        audioTitle: "cafe ambience",
        audioUrl: "/media/trends/audio/loop-soft.wav",
      },
      2,
    );
    assert.equal(next.coverUrl, CURATED_COVERS[2]);
    assert.equal(next.videoUrl, CURATED_VIDEOS[0]);
    assert.ok(next.changed);
  });

  it("backfills video when cover is set but not curated", () => {
    const next = resolveCuratedMediaFields(
      {
        coverUrl: "/legacy/cover.png",
        videoUrl: null,
        audioTitle: null,
        audioUrl: null,
      },
      0,
    );
    assert.equal(next.coverUrl, "/legacy/cover.png");
    assert.equal(next.videoUrl, CURATED_VIDEOS[0]);
    assert.ok(next.changed);
  });
});
