import { NextResponse } from "next/server";
import { ActionErrors } from "@/lib/action-result";

/** Generic JSON error for proxy / HTTP boundary (no internal details). */
export function genericJsonError(
  status: number,
  message: string = ActionErrors.generic,
  extraHeaders?: HeadersInit,
) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...extraHeaders,
      },
    },
  );
}

export function rateLimitedResponse(retryAfterSec: number) {
  return genericJsonError(429, ActionErrors.rateLimited, {
    "Retry-After": String(retryAfterSec),
  });
}
