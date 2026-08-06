/**
 * Copy app data from local Postgres → production (Neon).
 *
 * Usage:
 *   TARGET_DATABASE_URL="postgresql://...@....neon.tech/neondb?sslmode=require" npm run db:copy-to-prod
 *
 * Optional:
 *   SOURCE_DATABASE_URL="postgresql://trendplan:trendplan@localhost:5432/trendplan"
 *
 * WARNING: truncates User / Trend / WeekPlan / ContentItem on the TARGET first.
 */
import { config } from "dotenv";
import { Client } from "pg";

config();

const SOURCE =
  process.env.SOURCE_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgresql://trendplan:trendplan@localhost:5432/trendplan";
const TARGET = process.env.TARGET_DATABASE_URL;

if (!TARGET) {
  console.error(
    "Set TARGET_DATABASE_URL to your Neon/Vercel Postgres URL.\n" +
      'Example: TARGET_DATABASE_URL="postgresql://...neon.tech/...?sslmode=require" npm run db:copy-to-prod',
  );
  process.exit(1);
}

if (/localhost|127\.0\.0\.1/i.test(TARGET)) {
  console.error("TARGET_DATABASE_URL looks local — refusing to run.");
  process.exit(1);
}

async function fetchAll(client: Client, table: string) {
  const r = await client.query(`SELECT * FROM "${table}"`);
  return r.rows;
}

async function main() {
  const src = new Client({ connectionString: SOURCE });
  const dst = new Client({ connectionString: TARGET });
  await src.connect();
  await dst.connect();

  const users = await fetchAll(src, "User");
  const trends = await fetchAll(src, "Trend");
  const weekPlans = await fetchAll(src, "WeekPlan");
  const items = await fetchAll(src, "ContentItem");

  console.log("Source counts:", {
    users: users.length,
    trends: trends.length,
    weekPlans: weekPlans.length,
    items: items.length,
  });

  await dst.query("BEGIN");
  try {
    await dst.query(
      `TRUNCATE TABLE "ContentItem", "WeekPlan", "Trend", "User" RESTART IDENTITY CASCADE`,
    );

    for (const u of users) {
      await dst.query(
        `INSERT INTO "User" (id, email, "passwordHash", name, niche, "weeklyGoal", "onboardingComplete", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          u.id,
          u.email,
          u.passwordHash,
          u.name,
          u.niche,
          u.weeklyGoal,
          u.onboardingComplete,
          u.createdAt,
          u.updatedAt,
        ],
      );
    }

    for (const t of trends) {
      await dst.query(
        `INSERT INTO "Trend" (id, title, hook, format, score, reason, niche, "createdAt")
         VALUES ($1,$2,$3,$4::"ContentFormat",$5,$6,$7,$8)`,
        [
          t.id,
          t.title,
          t.hook,
          t.format,
          t.score,
          t.reason,
          t.niche,
          t.createdAt,
        ],
      );
    }

    for (const w of weekPlans) {
      await dst.query(
        `INSERT INTO "WeekPlan" (id, "userId", "weekStart", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5)`,
        [w.id, w.userId, w.weekStart, w.createdAt, w.updatedAt],
      );
    }

    for (const i of items) {
      await dst.query(
        `INSERT INTO "ContentItem" (id, "weekPlanId", "dayOfWeek", title, hook, caption, hashtags, status, "trendId", "performanceNote", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::"ContentStatus",$9,$10,$11,$12)`,
        [
          i.id,
          i.weekPlanId,
          i.dayOfWeek,
          i.title,
          i.hook,
          i.caption,
          i.hashtags,
          i.status,
          i.trendId,
          i.performanceNote,
          i.createdAt,
          i.updatedAt,
        ],
      );
    }

    await dst.query("COMMIT");

    const counts = await dst.query(`
      SELECT
        (SELECT COUNT(*)::int FROM "User") AS users,
        (SELECT COUNT(*)::int FROM "Trend") AS trends,
        (SELECT COUNT(*)::int FROM "WeekPlan") AS plans,
        (SELECT COUNT(*)::int FROM "ContentItem") AS items
    `);
    console.log("Target counts:", counts.rows[0]);
    console.log("Copy OK — no redeploy needed.");
  } catch (e) {
    await dst.query("ROLLBACK");
    throw e;
  } finally {
    await src.end();
    await dst.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
