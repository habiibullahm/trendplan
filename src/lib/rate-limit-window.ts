export type FixedWindowBucket = { count: number; resetAt: number };

export type FixedWindowOptions = {
  limit: number;
  windowMs: number;
};

export type FixedWindowDecision =
  | { ok: true; next: FixedWindowBucket }
  | { ok: false; retryAfterSec: number; next: FixedWindowBucket };

/** Pure fixed-window math (unit-tested; used by DB-backed checkRateLimit). */
export function evaluateFixedWindow(
  existing: FixedWindowBucket | null,
  now: number,
  { limit, windowMs }: FixedWindowOptions,
): FixedWindowDecision {
  if (!existing || now >= existing.resetAt) {
    return {
      ok: true,
      next: { count: 1, resetAt: now + windowMs },
    };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      next: existing,
    };
  }

  return {
    ok: true,
    next: { count: existing.count + 1, resetAt: existing.resetAt },
  };
}
