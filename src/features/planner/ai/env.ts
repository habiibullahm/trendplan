import "server-only";

/** Default: Groq model with json_schema structured outputs. */
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

/**
 * Models known to support Groq `response_format: json_schema`
 * (required by generateObject). See https://console.groq.com/docs/structured-outputs
 */
export const GROQ_STRUCTURED_OUTPUT_MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-safeguard-20b",
] as const;

export type GroqStructuredModel =
  (typeof GROQ_STRUCTURED_OUTPUT_MODELS)[number];

export function isGroqStructuredOutputModel(
  model: string,
): model is GroqStructuredModel {
  return (GROQ_STRUCTURED_OUTPUT_MODELS as readonly string[]).includes(
    model,
  );
}

/** Feature gate — off unless explicitly enabled. */
export function isAiAssistEnabled(): boolean {
  return process.env.AI_ASSIST_ENABLED === "true";
}

export function getGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY?.trim();
  return key ? key : null;
}

/** True when we will call Groq (flag on + key present). */
export function canCallCaptionModel(): boolean {
  return isAiAssistEnabled() && Boolean(getGroqApiKey());
}

/**
 * Chat model id for Groq.
 * Unknown / unsupported overrides fall back to the default (json_schema-capable).
 */
export function getGroqModel(): string {
  const model = process.env.GROQ_MODEL?.trim();
  if (!model) return DEFAULT_GROQ_MODEL;
  if (isGroqStructuredOutputModel(model)) return model;
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[ai/caption] GROQ_MODEL="${model}" does not support json_schema; using ${DEFAULT_GROQ_MODEL}`,
    );
  }
  return DEFAULT_GROQ_MODEL;
}

export function getGroqBaseUrl(): string {
  return GROQ_BASE_URL;
}
