import "server-only";

import { APICallError, generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  getGroqApiKey,
  getGroqBaseUrl,
  getGroqModel,
  isAiAssistEnabled,
} from "@/features/planner/ai/env";
import {
  buildCaptionAssistPrompt,
  CAPTION_ASSIST_SYSTEM,
} from "@/features/planner/ai/prompt";
import {
  CAPTION_ASSIST_MAX_CAPTION,
  CAPTION_ASSIST_MAX_HASHTAGS,
  captionAssistSchema,
  clampAssistText,
  type CaptionAssistContext,
  type CaptionAssistReason,
  type CaptionAssistResult,
} from "@/features/planner/ai/types";
import {
  suggestCaption,
  suggestHashtags,
} from "@/features/planner/lib/export-text";

export function templateCaptionAssist(
  ctx: Pick<CaptionAssistContext, "title" | "hook">,
  reason: CaptionAssistReason,
): CaptionAssistResult {
  return {
    caption: clampAssistText(
      suggestCaption({ title: ctx.title, hook: ctx.hook }),
      CAPTION_ASSIST_MAX_CAPTION,
    ),
    hashtags: clampAssistText(
      suggestHashtags(),
      CAPTION_ASSIST_MAX_HASHTAGS,
    ),
    source: "template",
    reason,
  };
}

/** Map provider failures to a stable client-facing reason (no secrets). */
export function assistReasonFromError(err: unknown): CaptionAssistReason {
  if (APICallError.isInstance(err)) {
    if (err.statusCode === 429) {
      return "quota";
    }
    const blob = `${err.responseBody ?? ""}\n${err.message ?? ""}`;
    if (
      err.statusCode === 400 &&
      /json_schema|structured.?output|does not support response format/i.test(
        blob,
      )
    ) {
      return "unsupported_model";
    }
  }
  return "error";
}

/**
 * AI caption/hashtag saran grounded in niche + item/tren context.
 * Uses Groq (OpenAI-compatible chat API). Falls back to template helpers
 * when AI is off, key missing, or the call fails.
 */
export async function generateCaptionAssist(
  ctx: CaptionAssistContext,
): Promise<CaptionAssistResult> {
  if (!isAiAssistEnabled()) {
    return templateCaptionAssist(ctx, "disabled");
  }

  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return templateCaptionAssist(ctx, "missing_key");
  }

  try {
    // Groq speaks OpenAI chat completions — use .chat(), not Responses API.
    const groq = createOpenAI({
      apiKey,
      baseURL: getGroqBaseUrl(),
      name: "groq",
    });
    const { object } = await generateObject({
      model: groq.chat(getGroqModel()),
      schema: captionAssistSchema,
      system: CAPTION_ASSIST_SYSTEM,
      prompt: buildCaptionAssistPrompt(ctx),
      maxOutputTokens: 400,
      // Fail fast — rate-limit 429s should not hold the UI for multi-retry backoff.
      maxRetries: 0,
    });

    const caption = clampAssistText(
      object.caption.trim(),
      CAPTION_ASSIST_MAX_CAPTION,
    );
    const hashtags = clampAssistText(
      object.hashtags.trim(),
      CAPTION_ASSIST_MAX_HASHTAGS,
    );
    if (!caption && !hashtags) {
      return templateCaptionAssist(ctx, "error");
    }

    return {
      caption:
        caption ||
        clampAssistText(
          suggestCaption({ title: ctx.title, hook: ctx.hook }),
          CAPTION_ASSIST_MAX_CAPTION,
        ),
      hashtags:
        hashtags ||
        clampAssistText(suggestHashtags(), CAPTION_ASSIST_MAX_HASHTAGS),
      source: "ai",
    };
  } catch (err) {
    const reason = assistReasonFromError(err);
    if (process.env.NODE_ENV !== "production") {
      console.warn("[ai/caption] generate failed:", reason, err);
    }
    return templateCaptionAssist(ctx, reason);
  }
}
