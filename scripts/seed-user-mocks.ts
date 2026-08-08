/**
 * Seed complete local/prod mocks for one user: week plans with draft + Posted
 * items (caption/hashtag/hook/trend) for Planner + Riwayat.
 *
 * Usage:
 *   npx tsx scripts/seed-user-mocks.ts [email]
 *   npx tsx scripts/seed-user-mocks.ts --prod [--create] [email]
 *   TARGET_DATABASE_URL="postgresql://…" npx tsx scripts/seed-user-mocks.ts [--create] [email]
 *
 * --prod loads `.env.prod.local` (from `vercel env pull --environment=production`).
 * --create registers the user if missing (password: MOCK_USER_PASSWORD or generated).
 * --yes required with --create on non-localhost (ack destructive planner rebuild).
 * Default email: mr.habiibullahm@gmail.com
 */
import { randomBytes } from "node:crypto";
import { config } from "dotenv";
import { hash } from "bcryptjs";
import { z } from "zod";
import { ContentStatus } from "../src/generated/prisma/client";
import { createPrismaClientFromEnv } from "../src/lib/db";
import {
  suggestCaption,
  suggestHashtags,
} from "../src/features/planner/lib/export-text";
import { getWeekStart } from "../src/lib/week";

config({ path: ".env" });

const flags = new Set(
  process.argv.slice(2).filter((a) => a.startsWith("--")),
);
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const wantProd = flags.has("--prod");
const wantCreate = flags.has("--create");
const wantYes = flags.has("--yes");

if (wantProd) {
  config({ path: ".env.prod.local", override: true });
}

if (process.env.TARGET_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TARGET_DATABASE_URL;
} else if (
  wantProd &&
  process.env.DATABASE_URL_UNPOOLED &&
  /^postgres/i.test(process.env.DATABASE_URL_UNPOOLED)
) {
  // `vercel env pull` often redacts Sensitive DATABASE_URL as "[SENSITIVE]".
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
}

const DEFAULT_EMAIL = "mr.habiibullahm@gmail.com";
const DEFAULT_NAME = "Muhammad Habiibullah";
const DEFAULT_NICHE = "Couple Date Ideas";

type Slot = {
  dayOfWeek: number;
  status: "IDE" | "POSTED";
  trendOffset: number;
};

const CURRENT_WEEK: Slot[] = [
  { dayOfWeek: 0, status: "IDE", trendOffset: 0 },
  { dayOfWeek: 1, status: "IDE", trendOffset: 1 },
  { dayOfWeek: 2, status: "POSTED", trendOffset: 2 },
  { dayOfWeek: 3, status: "POSTED", trendOffset: 3 },
  { dayOfWeek: 4, status: "IDE", trendOffset: 4 },
  { dayOfWeek: 5, status: "POSTED", trendOffset: 5 },
];

const PREV_WEEK: Slot[] = [
  { dayOfWeek: 0, status: "POSTED", trendOffset: 0 },
  { dayOfWeek: 1, status: "POSTED", trendOffset: 1 },
  { dayOfWeek: 2, status: "POSTED", trendOffset: 2 },
  { dayOfWeek: 4, status: "POSTED", trendOffset: 3 },
  { dayOfWeek: 6, status: "POSTED", trendOffset: 4 },
];

function assertSafeTarget(url: string) {
  const isLocal = /localhost|127\.0\.0\.1/i.test(url);
  if ((wantProd || process.env.TARGET_DATABASE_URL) && isLocal) {
    throw new Error(
      "Refusing prod/target run against a localhost DATABASE_URL.",
    );
  }
  if (!isLocal && !wantProd && !process.env.TARGET_DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not localhost. Pass --prod or set TARGET_DATABASE_URL.",
    );
  }
}

function resolveMockPassword(): { password: string; generated: boolean } {
  const fromEnv = process.env.MOCK_USER_PASSWORD?.trim();
  if (fromEnv && fromEnv.length >= 10) {
    return { password: fromEnv, generated: false };
  }
  return {
    password: `Tp${randomBytes(9).toString("base64url")}`,
    generated: true,
  };
}

async function main() {
  const emailParsed = z
    .email()
    .safeParse((args[0] ?? DEFAULT_EMAIL).trim().toLowerCase());
  if (!emailParsed.success) {
    console.error("Invalid email.");
    process.exit(1);
  }
  const email = emailParsed.data;
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  assertSafeTarget(url);

  const isRemote = !/localhost|127\.0\.0\.1/i.test(url);
  if (isRemote && !wantYes) {
    console.error(
      "Remote DB requires --yes (rebuilds this user's planner / may create user).",
    );
    process.exit(1);
  }

  const { prisma, pool } = createPrismaClientFromEnv();

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    let createdPassword: string | null = null;

    if (!user) {
      if (!wantCreate) {
        console.error(
          `User not found on target DB: ${email}\n` +
            "Register/login first, or re-run with --create --yes.",
        );
        process.exit(1);
      }

      const { password, generated } = resolveMockPassword();
      const passwordHash = await hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          name: DEFAULT_NAME,
          passwordHash,
          niche: DEFAULT_NICHE,
          weeklyGoal: 5,
          onboardingComplete: true,
          emailVerified: new Date(),
          passwordNeedsUpgrade: false,
        },
      });
      createdPassword = password;
      console.log(
        generated
          ? `Created user ${email} with generated password (save it):`
          : `Created user ${email} with MOCK_USER_PASSWORD.`,
      );
      if (generated) {
        console.log(`  password: ${password}`);
      }
    }

    let trends = await prisma.trend.findMany({
      where: { niche: user.niche },
      orderBy: { score: "desc" },
    });
    if (trends.length === 0) {
      trends = await prisma.trend.findMany({ orderBy: { score: "desc" } });
    }
    if (trends.length === 0) {
      console.error(
        "No trends in DB — run trend seed against the same target first.",
      );
      process.exit(1);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingComplete: true,
        weeklyGoal: Math.max(user.weeklyGoal, 5),
        emailVerified: user.emailVerified ?? new Date(),
      },
    });

    const thisWeek = getWeekStart();
    const prevWeek = new Date(thisWeek);
    prevWeek.setUTCDate(prevWeek.getUTCDate() - 7);

    await prisma.contentItem.deleteMany({
      where: { weekPlan: { userId: user.id } },
    });
    await prisma.weekPlan.deleteMany({
      where: { userId: user.id },
    });

    async function fillWeek(weekStart: Date, slots: Slot[]) {
      const plan = await prisma.weekPlan.create({
        data: { userId: user!.id, weekStart },
      });

      for (const slot of slots) {
        const trend = trends[slot.trendOffset % trends.length]!;
        const title = trend.title;
        const hook = trend.hook;
        const caption = suggestCaption({ title, hook });
        const hashtags = suggestHashtags();

        await prisma.contentItem.create({
          data: {
            weekPlanId: plan.id,
            dayOfWeek: slot.dayOfWeek,
            title,
            hook,
            caption,
            hashtags,
            status:
              slot.status === "POSTED"
                ? ContentStatus.POSTED
                : ContentStatus.IDE,
            trendId: trend.id,
          },
        });
      }

      return plan.id;
    }

    const currentId = await fillWeek(thisWeek, CURRENT_WEEK);
    const prevId = await fillWeek(prevWeek, PREV_WEEK);

    const posted = await prisma.contentItem.count({
      where: {
        status: "POSTED",
        deletedAt: null,
        weekPlan: { userId: user.id },
      },
    });
    const drafts = await prisma.contentItem.count({
      where: {
        status: { not: "POSTED" },
        deletedAt: null,
        weekPlan: { userId: user.id },
      },
    });

    const host = url.replace(/^[^\@]+@/, "").replace(/\/.*$/, "");
    console.log(
      JSON.stringify(
        {
          targetHost: host,
          email,
          userId: user.id,
          niche: user.niche,
          createdPassword: createdPassword ? "(printed above)" : null,
          thisWeek: thisWeek.toISOString(),
          prevWeek: prevWeek.toISOString(),
          weekPlanIds: { current: currentId, previous: prevId },
          drafts,
          posted,
          trendsAvailable: trends.length,
        },
        null,
        2,
      ),
    );
    console.log("User mocks ready — check /planner, /riwayat, /dashboard.");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
