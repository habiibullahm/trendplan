import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCaptionAssistPrompt } from "@/features/planner/ai/prompt";
import { captionAssistSchema } from "@/features/planner/ai/types";
import {
  suggestCaption,
  suggestHashtags,
} from "@/features/planner/lib/export-text";

describe("caption assist prompt", () => {
  it("includes niche, title, and optional tren fields", () => {
    const prompt = buildCaptionAssistPrompt({
      title: "POV hujan di rumah",
      hook: "When it rains…",
      niche: "Couple Date Ideas",
      trendTitle: "POV: hujan, date di rumah aja",
      trendFormat: "POV",
      trendReason: "Low effort",
    });
    assert.match(prompt, /Couple Date Ideas/);
    assert.match(prompt, /POV hujan di rumah/);
    assert.match(prompt, /When it rains/);
    assert.match(prompt, /Sumber tren/);
  });
});

describe("captionAssistSchema", () => {
  it("accepts caption + hashtags", () => {
    const parsed = captionAssistSchema.parse({
      caption: "Halo pasangan",
      hashtags: "#coupledate #tiktok",
    });
    assert.equal(parsed.caption, "Halo pasangan");
  });
});

describe("template saran (AI fallback)", () => {
  it("matches export-text helpers", () => {
    const caption = suggestCaption({
      title: "Judul",
      hook: "Hook",
    });
    assert.equal(caption, "Judul\n\nHook");
    assert.ok(suggestHashtags().includes("#"));
  });
});
