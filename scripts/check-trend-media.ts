import "dotenv/config";
import { createPrismaClientFromEnv } from "../src/lib/db";

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
    const masak = await prisma.trend.findMany({
      where: { title: { contains: "masak" } },
      select: { title: true, coverUrl: true, videoUrl: true, niche: true },
    });
    const noVideo = await prisma.trend.findMany({
      where: { videoUrl: null },
      select: { title: true, coverUrl: true, niche: true },
    });
    console.log(
      JSON.stringify(
        {
          database: process.env.DATABASE_URL?.replace(/:[^:@/]+@/, ":****@"),
          total,
          withVideo,
          withCover,
          nullBoth,
          samples,
          masak,
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
