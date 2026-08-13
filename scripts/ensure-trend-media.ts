/**
 * Ensure Trend rows have curated media without wiping IDs (safe for prod).
 *
 * Prod deploy: after shipping curated `/media/trends/` assets (and retiring
 * `/mocks/`), run `npm run db:ensure-trend-media` (or `init-prod-user-mocks`)
 * against prod DBs that still store `/mocks/` URLs — otherwise media 404s.
 *
 * - If no trends: create from a minimal curated catalog
 * - If trends exist: rewrite `/mocks/` URLs + backfill nulls; preserve
 *   intentional empty / curated cover-only rows
 *
 * Usage:
 *   npx tsx scripts/ensure-trend-media.ts
 *   TARGET_DATABASE_URL=… npx tsx scripts/ensure-trend-media.ts
 */
import { config } from "dotenv";
import { ContentFormat } from "../src/generated/prisma/client";
import { createPrismaClientFromEnv } from "../src/lib/db";
import {
  applyCoverOnly,
  applyEmptyMedia,
  attachCuratedMedia,
  isMockMediaUrl,
  resolveCuratedMediaFields,
} from "../src/features/planner/lib/curated-trend-media";

config({ path: ".env" });

if (process.env.TARGET_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TARGET_DATABASE_URL;
} else if (
  process.env.DATABASE_URL_UNPOOLED &&
  /^postgres/i.test(process.env.DATABASE_URL_UNPOOLED) &&
  (!process.env.DATABASE_URL || !/^postgres/i.test(process.env.DATABASE_URL))
) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
}

/** Minimal catalog — mirrors prisma/seed niches so empty DBs get usable FYP. */
const catalogBase = [
  ...attachCuratedMedia(
    [
      {
        title: "Format: 3 date di bawah 100rb",
        hook: "3 date ideas that feel expensive…",
        format: ContentFormat.LIST,
        score: 94,
        reason: "Tren hemat — cocok diisi ke slot kosong minggu ini",
      },
      {
        title: "POV: hujan, date di rumah aja",
        hook: "When it rains, try this instead…",
        format: ContentFormat.POV,
        score: 91,
        reason: "POV low effort, mudah diambil creator solo",
      },
      {
        title: "Story: cafe aesthetic first date",
        hook: "We found the coziest cafe for…",
        format: ContentFormat.STORYTELLING,
        score: 88,
        reason: "Visual cafe + storytelling pas niche couple",
      },
      {
        title: "List: checklist kencan pertama",
        hook: "Don’t go on a first date without…",
        format: ContentFormat.LIST,
        score: 86,
        reason: "Checklist sering di-save audiens dating",
      },
      {
        title: "Story: surprise date 24 jam",
        hook: "Surprise them with this simple plan…",
        format: ContentFormat.STORYTELLING,
        score: 85,
        reason: "Tema surprise kuat secara emosional di niche couple",
      },
      {
        title: "List: bekal picnic sunset",
        hook: "Pack this for the perfect sunset…",
        format: ContentFormat.LIST,
        score: 83,
        reason: "List praktis + visual picnic",
      },
    ],
    "Couple Date Ideas",
  ),
  ...attachCuratedMedia(
    [
      {
        title: "List: 3 fitur tersembunyi HP kamu",
        hook: "Your phone can do this and you never knew…",
        format: ContentFormat.LIST,
        score: 92,
        reason: "List praktis, cocok creator produktivitas + tech",
      },
      {
        title: "POV: desk setup under 2jt",
        hook: "Building a clean desk on a budget…",
        format: ContentFormat.POV,
        score: 88,
        reason: "Budget setup sering naik di FYP gadget",
      },
    ],
    "Tech & Gadget",
  ),
  ...attachCuratedMedia(
    [
      {
        title: "List: meal prep 3 menu hemat",
        hook: "3 meals for the week under 50k…",
        format: ContentFormat.LIST,
        score: 90,
        reason: "Meal prep hemat sangat searchable",
      },
      {
        title: "POV: masak telur 60 detik",
        hook: "The only egg recipe you need…",
        format: ContentFormat.POV,
        score: 84,
        reason: "Quick cook POV mudah ditiru",
      },
    ],
    "Food & Cooking",
  ),
];

// Cover-only + empty (parity with prisma/seed) for UI path coverage on empty DBs.
const catalog = catalogBase.map((row, i, arr) => {
  if (i === arr.length - 2) return applyCoverOnly(row);
  if (i === arr.length - 1) return applyEmptyMedia(row);
  return row;
});

async function main() {
  const { prisma, pool } = createPrismaClientFromEnv();
  try {
    const total = await prisma.trend.count();

    if (total === 0) {
      await prisma.trend.createMany({ data: catalog });
      console.log(`Created ${catalog.length} trends (empty DB).`);
    } else {
      const rows = await prisma.trend.findMany({
        orderBy: [{ niche: "asc" }, { score: "desc" }],
        select: {
          id: true,
          coverUrl: true,
          videoUrl: true,
          audioTitle: true,
          audioUrl: true,
        },
      });

      let updated = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]!;
        const next = resolveCuratedMediaFields(row, i);
        if (!next.changed) continue;

        await prisma.trend.update({
          where: { id: row.id },
          data: {
            coverUrl: next.coverUrl,
            videoUrl: next.videoUrl,
            audioTitle: next.audioTitle,
            audioUrl: next.audioUrl,
          },
        });
        updated += 1;
      }
      console.log(
        `Backfilled/rewrote media on ${updated}/${rows.length} existing trends.`,
      );
    }

    const withVideo = await prisma.trend.count({
      where: { videoUrl: { not: null } },
    });
    const stillMock = await prisma.trend.findMany({
      select: { coverUrl: true, videoUrl: true, audioUrl: true },
    });
    const mockCount = stillMock.filter(
      (r) =>
        isMockMediaUrl(r.coverUrl) ||
        isMockMediaUrl(r.videoUrl) ||
        isMockMediaUrl(r.audioUrl),
    ).length;

    console.log(
      JSON.stringify(
        {
          total: await prisma.trend.count(),
          withVideo,
          stillMock: mockCount,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
