import "server-only";

import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import {
  ActionErrors,
  actionError,
  fromZodError,
  type ActionResult,
} from "@/lib/action-result";
import {
  checkRateLimit,
  type RateLimitOptions,
} from "@/lib/rate-limit";

/**
 * Best-effort client IP for rate limits.
 *
 * Prefer platform-set headers. Only trust generic X-Forwarded-For when the
 * deployment is known to overwrite it (Vercel) or TRUST_PROXY_IP / AUTH_TRUST_HOST
 * is explicitly enabled for a reverse proxy that strips client-supplied values.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();

  const vercelFwd = h.get("x-vercel-forwarded-for");
  if (vercelFwd) {
    const first = vercelFwd.split(",")[0]?.trim();
    if (first) return first;
  }

  const trustForwarded =
    process.env.VERCEL === "1" ||
    process.env.TRUST_PROXY_IP === "true" ||
    process.env.AUTH_TRUST_HOST === "true";

  if (trustForwarded) {
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
  }

  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  // Avoid a single shared "unknown" bucket: isolate by coarse UA fingerprint.
  const ua = h.get("user-agent")?.slice(0, 80) ?? "ua";
  return `unknown:${ua}`;
}

export async function assertRateLimits(
  ...checks: { key: string; options: RateLimitOptions }[]
): Promise<ActionResult | null> {
  for (const { key, options } of checks) {
    const result = await checkRateLimit(key, options);
    if (!result.ok) return actionError(ActionErrors.rateLimited);
  }
  return null;
}

type FormPicker = (formData: FormData) => unknown;

/**
 * Action middleware: validate FormData, then run the handler.
 * Unexpected throws become a generic error (no stack leak to the client).
 * Next.js redirect / notFound control-flow errors are rethrown.
 */
export async function withValidation<TSchema extends z.ZodType>(
  schema: TSchema,
  formData: FormData,
  pick: FormPicker,
  handler: (data: z.infer<TSchema>) => Promise<ActionResult>,
): Promise<ActionResult> {
  const parsed = schema.safeParse(pick(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  try {
    return await handler(parsed.data);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[action]", error);
    return actionError(ActionErrors.generic);
  }
}
