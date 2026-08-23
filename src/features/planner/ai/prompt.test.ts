import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assistFeedbackForResult } from "@/features/planner/ai/assist-feedback";
import {
  buildCaptionAssistPrompt,
  CAPTION_ASSIST_SYSTEM,
} from "@/features/planner/ai/prompt";
import {
  CAPTION_ASSIST_MAX_CAPTION,
  captionAssistSchema,
  clampAssistText,
} from "@/features/planner/ai/types";
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
    assert.match(prompt, /Bahasa Indonesia/);
    assert.match(prompt, /caption creator TikTok/);
  });

  it("asks for creator feed voice, not chat slang", () => {
    assert.match(CAPTION_ASSIST_SYSTEM, /Suara creator di feed/);
    assert.match(CAPTION_ASSIST_SYSTEM, /Bukan chat WhatsApp/);
    assert.match(CAPTION_ASSIST_SYSTEM, /jangan beri nasihat medis/);
    assert.doesNotMatch(CAPTION_ASSIST_SYSTEM, /pasar orang Indo/);
    assert.doesNotMatch(CAPTION_ASSIST_SYSTEM, /kayak ngobrol/);
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

  it("accepts oversized caption (clamp applied after generate)", () => {
    const parsed = captionAssistSchema.parse({
      caption: "x".repeat(CAPTION_ASSIST_MAX_CAPTION + 50),
      hashtags: "#ok",
    });
    assert.equal(parsed.caption.length, CAPTION_ASSIST_MAX_CAPTION + 50);
    assert.equal(
      clampAssistText(parsed.caption, CAPTION_ASSIST_MAX_CAPTION).length,
      CAPTION_ASSIST_MAX_CAPTION,
    );
  });
});

describe("clampAssistText", () => {
  it("truncates to max", () => {
    assert.equal(clampAssistText("abcdef", 3), "abc");
    assert.equal(clampAssistText("ab", 3), "ab");
  });
});

describe("publicAssistReason", () => {
  it("collapses missing_key only in production", async () => {
    const { publicAssistReason } = await import(
      "@/features/planner/ai/types"
    );
    assert.equal(publicAssistReason("missing_key", "production"), "disabled");
    assert.equal(publicAssistReason("missing_key", "development"), "missing_key");
    assert.equal(publicAssistReason("error", "production"), "error");
  });
});

describe("Groq model allowlist", () => {
  it("defaults and falls back unsupported overrides", async () => {
    const {
      DEFAULT_GROQ_MODEL,
      getGroqModel,
      isGroqStructuredOutputModel,
      canCallCaptionModel,
    } = await import("@/features/planner/ai/env");

    assert.equal(isGroqStructuredOutputModel("openai/gpt-oss-20b"), true);
    assert.equal(isGroqStructuredOutputModel("llama-3.3-70b-versatile"), false);

    const prevModel = process.env.GROQ_MODEL;
    const prevFlag = process.env.AI_ASSIST_ENABLED;
    const prevKey = process.env.GROQ_API_KEY;
    try {
      delete process.env.GROQ_MODEL;
      assert.equal(getGroqModel(), DEFAULT_GROQ_MODEL);

      process.env.GROQ_MODEL = "openai/gpt-oss-120b";
      assert.equal(getGroqModel(), "openai/gpt-oss-120b");

      process.env.GROQ_MODEL = "llama-3.3-70b-versatile";
      assert.equal(getGroqModel(), DEFAULT_GROQ_MODEL);

      process.env.AI_ASSIST_ENABLED = "true";
      process.env.GROQ_API_KEY = "gsk_test";
      assert.equal(canCallCaptionModel(), true);
      delete process.env.GROQ_API_KEY;
      assert.equal(canCallCaptionModel(), false);
    } finally {
      if (prevModel === undefined) delete process.env.GROQ_MODEL;
      else process.env.GROQ_MODEL = prevModel;
      if (prevFlag === undefined) delete process.env.AI_ASSIST_ENABLED;
      else process.env.AI_ASSIST_ENABLED = prevFlag;
      if (prevKey === undefined) delete process.env.GROQ_API_KEY;
      else process.env.GROQ_API_KEY = prevKey;
    }
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

describe("templateCaptionAssist reasons", () => {
  it("attaches disabled/missing_key/error reasons", async () => {
    const { templateCaptionAssist } = await import(
      "@/features/planner/ai/generate-caption"
    );
    const base = { title: "T", hook: "H" };
    assert.equal(templateCaptionAssist(base, "disabled").reason, "disabled");
    assert.equal(
      templateCaptionAssist(base, "missing_key").reason,
      "missing_key",
    );
    assert.equal(templateCaptionAssist(base, "error").source, "template");
  });
});

describe("generateCaptionAssist env branches", () => {
  it("returns disabled when flag off", async () => {
    const prev = process.env.AI_ASSIST_ENABLED;
    process.env.AI_ASSIST_ENABLED = "false";
    try {
      const { generateCaptionAssist } = await import(
        "@/features/planner/ai/generate-caption"
      );
      const r = await generateCaptionAssist({
        title: "T",
        hook: "H",
        niche: "N",
      });
      assert.equal(r.source, "template");
      assert.equal(r.reason, "disabled");
    } finally {
      if (prev === undefined) delete process.env.AI_ASSIST_ENABLED;
      else process.env.AI_ASSIST_ENABLED = prev;
    }
  });

  it("returns missing_key when flag on but key empty", async () => {
    const prevFlag = process.env.AI_ASSIST_ENABLED;
    const prevKey = process.env.GROQ_API_KEY;
    process.env.AI_ASSIST_ENABLED = "true";
    delete process.env.GROQ_API_KEY;
    try {
      const { generateCaptionAssist } = await import(
        "@/features/planner/ai/generate-caption"
      );
      const r = await generateCaptionAssist({
        title: "T",
        hook: "H",
        niche: "N",
      });
      assert.equal(r.source, "template");
      assert.equal(r.reason, "missing_key");
    } finally {
      if (prevFlag === undefined) delete process.env.AI_ASSIST_ENABLED;
      else process.env.AI_ASSIST_ENABLED = prevFlag;
      if (prevKey === undefined) delete process.env.GROQ_API_KEY;
      else process.env.GROQ_API_KEY = prevKey;
    }
  });
});

describe("assistFeedbackForResult", () => {
  it("maps ai / degraded / unknown template tones", () => {
    assert.deepEqual(assistFeedbackForResult({ source: "ai" }), {
      tone: "success",
      message: "Saran AI diisi",
    });
    assert.deepEqual(
      assistFeedbackForResult({ source: "template", reason: "error" }),
      { tone: "warning", message: "Saran template (AI gagal)" },
    );
    assert.deepEqual(
      assistFeedbackForResult({ source: "template", reason: "quota" }),
      { tone: "warning", message: "Saran template (kuota AI habis)" },
    );
    assert.deepEqual(
      assistFeedbackForResult({
        source: "template",
        reason: "unsupported_model",
      }),
      {
        tone: "warning",
        message: "Saran template (model AI tidak didukung)",
      },
    );
    assert.deepEqual(
      assistFeedbackForResult({ source: "template", reason: "disabled" }),
      { tone: "warning", message: "Saran template (AI belum aktif)" },
    );
    assert.deepEqual(
      assistFeedbackForResult({ source: "template", reason: "missing_key" }),
      { tone: "warning", message: "Saran template (AI belum aktif)" },
    );
    assert.deepEqual(assistFeedbackForResult({ source: "template" }), {
      tone: "warning",
      message: "Saran template diisi",
    });
  });
});

describe("assistReasonFromError", () => {
  it("maps 429 to quota", async () => {
    const { APICallError } = await import("ai");
    const { assistReasonFromError } = await import(
      "@/features/planner/ai/generate-caption"
    );
    const err = new APICallError({
      message: "Rate limit reached",
      url: "https://api.groq.com/openai/v1/chat/completions",
      requestBodyValues: {},
      statusCode: 429,
      responseHeaders: {},
      responseBody: '{"error":{"type":"rate_limit_exceeded"}}',
      isRetryable: true,
    });
    assert.equal(assistReasonFromError(err), "quota");
    assert.equal(assistReasonFromError(new Error("boom")), "error");
  });

  it("maps json_schema 400 to unsupported_model", async () => {
    const { APICallError } = await import("ai");
    const { assistReasonFromError } = await import(
      "@/features/planner/ai/generate-caption"
    );
    const err = new APICallError({
      message:
        "This model does not support response format `json_schema`.",
      url: "https://api.groq.com/openai/v1/chat/completions",
      requestBodyValues: {},
      statusCode: 400,
      responseHeaders: {},
      responseBody:
        '{"error":{"message":"This model does not support response format `json_schema`.","type":"invalid_request_error"}}',
      isRetryable: false,
    });
    assert.equal(assistReasonFromError(err), "unsupported_model");
  });
});
