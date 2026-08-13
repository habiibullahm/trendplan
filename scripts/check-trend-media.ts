import "dotenv/config";
import { createPrismaClientFromEnv } from "../src/lib/db";
import { isMockMediaUrl } from "../src/features/planner/lib/curated-trend-media";

async function main() {
  const { prisma, pool } = createPrismaClientFromEnv();
  try {
    const total = await prisma.trend.count();
    const withVideo = await prisma.trend.count({
      where: { videoUrl: { not: null } },
    });
    const withCover = await prisma.trend.count({
      where: { coverUrl: { not: null } },
    });
    const withCuratedCover = await prisma.trend.count({
      where: { coverUrl: { startsWith: "/media/trends/" } },
    });
    const samples = await prisma.trend.findMany({
      take: 5,
      orderBy: { score: "desc" },
      select: {
        title: true,
        niche: true,
        coverUrl: true,
        videoUrl: true,
        audioTitle: true,
        audioUrl: true,
      },
    });
    const nullBoth = await prisma.trend.count({
      where: { coverUrl: null, videoUrl: null },
    });
    const coverOnly = await prisma.trend.findMany({
      where: { coverUrl: { not: null }, videoUrl: null },
      select: { title: true, coverUrl: true, niche: true },
    });
    const noVideo = await prisma.trend.findMany({
      where: { videoUrl: null },
      select: { title: true, coverUrl: true, niche: true },
    });
    const all = await prisma.trend.findMany({
      select: { coverUrl: true, videoUrl: true, audioUrl: true },
    });
    const stillMock = all.filter(
      (r) =>
        isMockMediaUrl(r.coverUrl) ||
        isMockMediaUrl(r.videoUrl) ||
        isMockMediaUrl(r.audioUrl),
    ).length;

    console.log(
      JSON.stringify(
        {
          database: process.env.DATABASE_URL?.replace(/:[^:@/]+@/, ":****@"),
          total,
          withVideo,
          withCover,
          withCuratedCover,
          nullBoth,
          stillMock,
          samples,
          coverOnly,
          noVideo,
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
