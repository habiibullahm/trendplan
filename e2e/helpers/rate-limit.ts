import { Pool } from "pg";

/** Clear invite create buckets so e2e isn't blocked after local re-runs. */
export async function clearWeekInviteRateLimits(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return;

  const pool = new Pool({ connectionString });
  try {
    await pool.query(
      `DELETE FROM "RateLimitBucket" WHERE key LIKE 'week-invite:%'`,
    );
  } finally {
    await pool.end().catch(() => undefined);
  }
}
