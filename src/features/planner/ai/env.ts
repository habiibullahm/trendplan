import "server-only";

/** Feature gate — off unless explicitly enabled. */
export function isAiAssistEnabled(): boolean {
  return process.env.AI_ASSIST_ENABLED === "true";
}

export function getOpenAiApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key ? key : null;
}

/** True when we should call the model (flag on + key present). */
export function canUseAiCaption(): boolean {
  return isAiAssistEnabled() && Boolean(getOpenAiApiKey());
}
