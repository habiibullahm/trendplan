import "server-only";

import { prisma } from "@/lib/prisma";
import {
  evaluateFixedWindow,
  type FixedWindowBucket,
} from "@/lib/rate-limit-window";

export type RateLimitOptions = {
  /** Max attempts inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

/**
 * Fixed-window rate limit backed by Postgres (shared across Vercel instances).
 */
export async function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = Date.now();

  return prisma.$transaction(async (tx) => {
    const row = await tx.rateLimitBucket.findUnique({ where: { key } });
    const existing: FixedWindowBucket | null = row
      ? { count: row.count, resetAt: row.resetAt.getTime() }
      : null;

    const decision = evaluateFixedWindow(existing, now, { limit, windowMs });

    if (decision.ok) {
      await tx.rateLimitBucket.upsert({
        where: { key },
        create: {
          key,
          count: decision.next.count,
          resetAt: new Date(decision.next.resetAt),
        },
        update: {
          count: decision.next.count,
          resetAt: new Date(decision.next.resetAt),
        },
      });
      return { ok: true };
    }

    return {
      ok: false,
      retryAfterSec: decision.retryAfterSec,
    };
  });
}

/** Test helper — clears all buckets. */
export async function resetRateLimitsForTests() {
  await prisma.rateLimitBucket.deleteMany();
}
