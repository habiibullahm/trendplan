/**
 * Ensure Trend rows have curated covers without wiping IDs (safe for prod).
 *
 * Prod deploy: after retiring `/mocks/` and FYP video/audio columns, run
 * `npm run db:ensure-trend-media` against DBs that still store `/mocks/`
 * cover URLs — otherwise posters 404.
 *
 * - If no trends: create from a minimal cover+copy catalog
 * - If trends exist: rewrite `/mocks/` covers; preserve intentional empty
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

/** Minimal catalog — mirrors prisma/seed niches so empty DBs get usable ideas. */
const catalogBase = [
  ...attachCuratedMedia(
    [
      {
        title: "List: date menu isi sendiri",
        hook: "Malam ini kamu yang pilih dari menunya…",
        format: ContentFormat.LIST,
        score: 94,
        reason: "Satu kertas, banyak opsi — mudah diisi weekday",
      },
      {
        title: "POV: color hunt 30 menit",
        hook: "Kita pilih warna, terus buru di jalan…",
        format: ContentFormat.POV,
        score: 91,
        reason: "Jalan kaki + misi, tanpa budget besar",
      },
      {
        title: "Story: GRWM sebelum kencan",
        hook: "Get ready bareng, bukan cuma hasil akhir…",
        format: ContentFormat.STORYTELLING,
        score: 88,
        reason: "Ritual sebelum date, visual jelas",
      },
      {
        title: "List: 3 date di bawah 100rb",
        hook: "3 ide kencan yang keliatan mahal…",
        format: ContentFormat.LIST,
        score: 86,
        reason: "Hemat, tetap spesifik buat slot minggu",
      },
      {
        title: "POV: hujan, date di rumah",
        hook: "Hujan? Jangan cancel, ganti ini…",
        format: ContentFormat.POV,
        score: 85,
        reason: "Low effort, creator solo tetap bisa",
      },
      {
        title: "Story: started vs messy middle",
        hook: "3 panel: awal, berantakan, sekarang…",
        format: ContentFormat.STORYTELLING,
        score: 83,
        reason: "Cerita pasangan, bukan flex cafe",
      },
    ],
    "Couple Date Ideas",
  ),
  ...attachCuratedMedia(
    [
      {
        title: "POV: demo 1 kali pencet",
        hook: "Gadget ini cuma 1 pencet…",
        format: ContentFormat.POV,
        score: 95,
        reason: "Demo pendek, masalah ke solusi",
      },
      {
        title: "List: 3 fitur HP yang kelewat",
        hook: "Yakin udah pakai semua ini?",
        format: ContentFormat.LIST,
        score: 92,
        reason: "Bisa diulang tiap tipe HP",
      },
    ],
    "Tech & Gadget",
  ),
  ...attachCuratedMedia(
    [
      {
        title: "List: sheet-pan meal prep 4 hari",
        hook: "Satu loyang, bekal 4 hari…",
        format: ContentFormat.LIST,
        score: 93,
        reason: "Batch cook, saus dipisah biar tidak letoy",
      },
      {
        title: "POV: protein rice bowl",
        hook: "Bowl protein yang nggak ngebosenin…",
        format: ContentFormat.POV,
        score: 90,
        reason: "Komponen plus telur jammy, slot bekal",
      },
    ],
    "Food & Cooking",
  ),
  ...attachCuratedMedia(
    [
      {
        title: "List: 5 menit mobility yang PT izinin",
        hook: "Bukan rehab liar, cuma yang udah boleh…",
        format: ContentFormat.LIST,
        score: 94,
        reason: "Slot harian pendek, konkret",
      },
      {
        title: "POV: brace on vs brace off",
        hook: "Keluar rumah, dua versi lutut…",
        format: ContentFormat.POV,
        score: 91,
        reason: "Visual sebelum/sesudah, mudah diambil",
      },
    ],
    "ACL Recovery",
  ),
];

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
        },
      });

      let updated = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]!;
        const next = resolveCuratedMediaFields(row, i);
        if (!next.changed) continue;

        await prisma.trend.update({
          where: { id: row.id },
          data: { coverUrl: next.coverUrl },
        });
        updated += 1;
      }
      console.log(
        `Backfilled/rewrote covers on ${updated}/${rows.length} existing trends.`,
      );
    }

    const stillMock = await prisma.trend.findMany({
      select: { coverUrl: true },
    });
    const mockCount = stillMock.filter((r) => isMockMediaUrl(r.coverUrl)).length;

    console.log(
      JSON.stringify(
        {
          total: await prisma.trend.count(),
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
