/**
 * Happy-path smoke test (data layer).
 * Run: npx tsx scripts/smoke-happy-path.ts
 */
import "dotenv/config";
import { hash } from "bcryptjs";
import { ContentStatus } from "../src/generated/prisma/client";
import { createPrismaClientFromEnv } from "../src/lib/db";

const { prisma, pool } = createPrismaClientFromEnv();

function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

async function main() {
  const email = `smoke-${Date.now()}@trendplan.test`;
  console.log("1) Register user…");
  const user = await prisma.user.create({
    data: {
      email,
      name: "Smoke Tester",
      passwordHash: await hash("password123", 10),
      niche: "Couple Date Ideas",
      weeklyGoal: 3,
      onboardingComplete: true,
    },
  });

  console.log("2) Ensure trends seeded…");
  const trends = await prisma.trend.findMany({
    where: { niche: "Couple Date Ideas" },
    orderBy: { score: "desc" },
    take: 3,
  });
  assert(trends.length >= 1, "No trends — run npm run db:seed");

  console.log("3) Create week plan + content…");
  const weekStart = getWeekStart();
  const weekPlan = await prisma.weekPlan.create({
    data: { userId: user.id, weekStart },
  });

  const item = await prisma.contentItem.create({
    data: {
      weekPlanId: weekPlan.id,
      dayOfWeek: 2,
      title: trends[0].title,
      hook: trends[0].hook,
      trendId: trends[0].id,
      status: ContentStatus.IDE,
      caption: "Caption smoke test",
      hashtags: "#coupledate",
    },
  });

  console.log("4) Progress IDE → Draft → Ready → Posted…");
  await prisma.contentItem.update({
    where: { id: item.id },
    data: { status: ContentStatus.DRAFT },
  });
  await prisma.contentItem.update({
    where: { id: item.id },
    data: { status: ContentStatus.READY },
  });
  await prisma.contentItem.update({
    where: { id: item.id },
    data: {
      status: ContentStatus.POSTED,
      performanceNote: "8k views smoke",
    },
  });

  console.log("5) Riwayat query…");
  const posted = await prisma.contentItem.findMany({
    where: { status: ContentStatus.POSTED, weekPlan: { userId: user.id } },
  });
  assert(posted.length === 1, "Expected 1 posted item");

  console.log("6) Cleanup…");
  await prisma.user.delete({ where: { id: user.id } });

  console.log("\nSMOKE OK — happy path data layer passed");
  console.log("Manual UI breakpoints still check: 375 / 768 / 1280");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
