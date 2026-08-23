import "dotenv/config";
import { createPrismaClientFromEnv } from "../src/lib/db";
import { isMockMediaUrl } from "../src/features/planner/lib/curated-trend-media";

async function main() {
  const { prisma, pool } = createPrismaClientFromEnv();
  try {
    const total = await prisma.trend.count();
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
      },
    });
    const emptyCover = await prisma.trend.count({
      where: { coverUrl: null },
    });
    const all = await prisma.trend.findMany({
      select: { coverUrl: true },
    });
    const stillMock = all.filter((r) => isMockMediaUrl(r.coverUrl)).length;

    console.log(
      JSON.stringify(
        {
          database: process.env.DATABASE_URL?.replace(/:[^:@/]+@/, ":****@"),
          total,
          withCover,
          withCuratedCover,
          emptyCover,
          stillMock,
          samples,
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
