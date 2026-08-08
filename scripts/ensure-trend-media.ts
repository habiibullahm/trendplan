/**
 * Ensure Trend rows have mock media without wiping IDs (safe for prod).
 *
 * - If no trends: create from the same catalog as prisma/seed.ts
 * - If trends exist: backfill null cover/video/audio fields in place
 *
 * Usage:
 *   npx tsx scripts/ensure-trend-media.ts
 *   TARGET_DATABASE_URL=… npx tsx scripts/ensure-trend-media.ts
 */
import { config } from "dotenv";
import { ContentFormat } from "../src/generated/prisma/client";
import { createPrismaClientFromEnv } from "../src/lib/db";
import { NICHES } from "../src/lib/niches";

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

const COVERS = [
  "/mocks/covers/coral.svg",
  "/mocks/covers/sage.svg",
  "/mocks/covers/ink.svg",
  "/mocks/covers/warm.svg",
] as const;

const AUDIO_TITLES = [
  "original sound — date night",
  "soft piano loop",
  "cafe ambience (mock)",
  "lofi beat — mock",
  "trending audio (mock)",
] as const;

const AUDIO_URLS = [
  "/mocks/audio/tone-a.wav",
  "/mocks/audio/tone-b.wav",
] as const;

type TrendSeed = {
  title: string;
  hook: string;
  format: ContentFormat;
  score: number;
  reason: string;
  niche: (typeof NICHES)[number];
  coverUrl?: string | null;
  videoUrl?: string | null;
  audioTitle?: string | null;
  audioUrl?: string | null;
};

function withMockMedia(
  rows: Omit<
    TrendSeed,
    "niche" | "coverUrl" | "videoUrl" | "audioTitle" | "audioUrl"
  >[],
  niche: (typeof NICHES)[number],
): TrendSeed[] {
  return rows.map((t, index) => ({
    ...t,
    niche,
    coverUrl: COVERS[index % COVERS.length],
    videoUrl: "/mocks/video/sample.mp4",
    audioTitle: AUDIO_TITLES[index % AUDIO_TITLES.length],
    audioUrl: index % 2 === 0 ? AUDIO_URLS[index % AUDIO_URLS.length] : null,
  }));
}

/** Minimal catalog — mirrors prisma/seed niches so empty DBs get usable FYP. */
const coupleTrends = withMockMedia(
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
);

const techTrends = withMockMedia(
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
);

const foodTrends = withMockMedia(
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
);

const catalog: TrendSeed[] = [...coupleTrends, ...techTrends, ...foodTrends];

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
        const needsCover = !row.coverUrl;
        const needsVideo = !row.videoUrl;
        const needsAudioTitle = !row.audioTitle;
        if (!needsCover && !needsVideo && !needsAudioTitle) continue;

        const coverUrl = row.coverUrl ?? COVERS[i % COVERS.length]!;
        const videoUrl = row.videoUrl ?? "/mocks/video/sample.mp4";
        const audioTitle =
          row.audioTitle ?? AUDIO_TITLES[i % AUDIO_TITLES.length]!;
        const audioUrl =
          row.audioUrl != null
            ? row.audioUrl
            : i % 2 === 0
              ? AUDIO_URLS[i % AUDIO_URLS.length]!
              : null;

        await prisma.trend.update({
          where: { id: row.id },
          data: { coverUrl, videoUrl, audioTitle, audioUrl },
        });
        updated += 1;
      }
      console.log(`Backfilled media on ${updated}/${rows.length} existing trends.`);
    }

    const withVideo = await prisma.trend.count({
      where: { videoUrl: { not: null } },
    });
    console.log(
      JSON.stringify(
        {
          total: await prisma.trend.count(),
          withVideo,
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
