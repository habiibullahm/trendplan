import "server-only";

import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { canUseAiCaption, getOpenAiApiKey } from "@/features/planner/ai/env";
import {
  buildCaptionAssistPrompt,
  CAPTION_ASSIST_SYSTEM,
} from "@/features/planner/ai/prompt";
import {
  captionAssistSchema,
  type CaptionAssistContext,
  type CaptionAssistResult,
} from "@/features/planner/ai/types";
import {
  suggestCaption,
  suggestHashtags,
} from "@/features/planner/lib/export-text";

export function templateCaptionAssist(
  ctx: Pick<CaptionAssistContext, "title" | "hook">,
): CaptionAssistResult {
  return {
    caption: suggestCaption({ title: ctx.title, hook: ctx.hook }),
    hashtags: suggestHashtags(),
    source: "template",
  };
}

/**
 * AI caption/hashtag saran grounded in niche + item/tren context.
 * Falls back to template helpers when AI is off, key missing, or the call fails.
 */
export async function generateCaptionAssist(
  ctx: CaptionAssistContext,
): Promise<CaptionAssistResult> {
  const fallback = templateCaptionAssist(ctx);

  if (!canUseAiCaption()) {
    return fallback;
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) return fallback;

  try {
    const openai = createOpenAI({ apiKey });
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: captionAssistSchema,
      system: CAPTION_ASSIST_SYSTEM,
      prompt: buildCaptionAssistPrompt(ctx),
      maxOutputTokens: 400,
    });

    const caption = object.caption.trim();
    const hashtags = object.hashtags.trim();
    if (!caption && !hashtags) return fallback;

    return {
      caption: caption || fallback.caption,
      hashtags: hashtags || fallback.hashtags,
      source: "ai",
    };
  } catch {
    return fallback;
  }
}
