import "dotenv/config";
import { ContentFormat } from "../src/generated/prisma/client";
import { createPrismaClientFromEnv } from "../src/lib/db";

const { prisma, pool } = createPrismaClientFromEnv();

const trends: Array<{
  title: string;
  hook: string;
  format: ContentFormat;
  score: number;
  reason: string;
}> = [
  {
    title: "Cheap date under 100k",
    hook: "3 date ideas that feel expensive…",
    format: ContentFormat.LIST,
    score: 94,
    reason: "Tren hemat cocok niche couple — ide actionable untuk minggu ini",
  },
  {
    title: "Rainy day date at home",
    hook: "When it rains, try this instead…",
    format: ContentFormat.POV,
    score: 91,
    reason: "Format POV sedang naik dan low effort untuk creator solo",
  },
  {
    title: "Aesthetic cafe date vlog",
    hook: "We found the coziest cafe for…",
    format: ContentFormat.STORYTELLING,
    score: 88,
    reason: "Visual cafe + storytelling pas untuk Couple Date Ideas",
  },
  {
    title: "First date checklist",
    hook: "Don’t go on a first date without…",
    format: ContentFormat.LIST,
    score: 86,
    reason: "Checklist mudah diikuti dan sering di-save audiens dating",
  },
  {
    title: "Surprise date for boyfriend/girlfriend",
    hook: "Surprise them with this simple plan…",
    format: ContentFormat.STORYTELLING,
    score: 85,
    reason: "Tema surprise kuat secara emosional di niche couple",
  },
  {
    title: "Sunset picnic date",
    hook: "Pack this for the perfect sunset…",
    format: ContentFormat.LIST,
    score: 83,
    reason: "Visual golden hour perform bagus di TikTok",
  },
  {
    title: "Night drive date ideas",
    hook: "POV: night drive with your person…",
    format: ContentFormat.POV,
    score: 82,
    reason: "POV + musik malam masih sering naik di FYP",
  },
  {
    title: "Budget anniversary date",
    hook: "Anniversary on a budget hits different…",
    format: ContentFormat.STORYTELLING,
    score: 80,
    reason: "Relatable untuk pasangan muda dengan budget terbatas",
  },
  {
    title: "Cook together date night",
    hook: "Date night recipe you can cook in 20 min…",
    format: ContentFormat.LIST,
    score: 79,
    reason: "At-home date mudah diulang dan engagemen tinggi",
  },
  {
    title: "Bookstore date aesthetic",
    hook: "Take them to a bookstore and do this…",
    format: ContentFormat.POV,
    score: 77,
    reason: "Aesthetic soft + niche couple yang beda dari cafe biasa",
  },
  {
    title: "Free date ideas in the city",
    hook: "0 rupiah dates that still feel special…",
    format: ContentFormat.LIST,
    score: 76,
    reason: "Keyword “gratis/hemat” sering dicari creator dating content",
  },
  {
    title: "Morning coffee date routine",
    hook: "Our slow morning date looks like this…",
    format: ContentFormat.STORYTELLING,
    score: 74,
    reason: "Routine vlog ringan untuk konsistensi posting mingguan",
  },
];

async function main() {
  await prisma.trend.deleteMany({
    where: { niche: "Couple Date Ideas" },
  });

  await prisma.trend.createMany({
    data: trends.map((t) => ({
      ...t,
      niche: "Couple Date Ideas",
    })),
  });

  const count = await prisma.trend.count({
    where: { niche: "Couple Date Ideas" },
  });

  console.log(`Seed selesai: ${count} tren Couple Date Ideas`);
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
