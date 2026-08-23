import "dotenv/config";
import { ContentFormat } from "../src/generated/prisma/client";
import { createPrismaClientFromEnv } from "../src/lib/db";
import { NICHES } from "../src/lib/niches";
import {
  applyCoverOnly,
  applyEmptyMedia,
  attachCuratedMedia,
  type CuratedTrendSeedRow,
} from "../src/features/planner/lib/curated-trend-media";

const { prisma, pool } = createPrismaClientFromEnv();

type TrendSeedInput = {
  title: string;
  hook: string;
  format: ContentFormat;
  score: number;
  reason: string;
};

const coupleTrends: TrendSeedInput[] = [
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
  {
    title: "List: masak bareng 20 menit",
    hook: "Resep date night 20 menit…",
    format: ContentFormat.LIST,
    score: 82,
    reason: "Masak bareng — format yang mudah diulang",
  },
  {
    title: "POV: bookstore date",
    hook: "Bawa ke toko buku, lakuin ini…",
    format: ContentFormat.POV,
    score: 80,
    reason: "Beda dari cafe, aesthetic tenang",
  },
  {
    title: "Story: anniversary di rumah",
    hook: "Anniversary hemat yang tetap terasa…",
    format: ContentFormat.STORYTELLING,
    score: 79,
    reason: "Relatable budget pasangan muda",
  },
  {
    title: "List: picnic sunset 5 bekal",
    hook: "Pack ini buat sunset…",
    format: ContentFormat.LIST,
    score: 77,
    reason: "Slot weekend, visual golden hour",
  },
  {
    title: "POV: one song rule",
    hook: "Satu lagu yang belum pernah kamu denger…",
    format: ContentFormat.POV,
    score: 76,
    reason: "Date tanpa scrolling, mudah diambil",
  },
  {
    title: "Story: morning coffee date",
    hook: "Pagi pelan kita kelihatan gini…",
    format: ContentFormat.STORYTELLING,
    score: 74,
    reason: "Rutin minggu, konsisten posting",
  },
];

const techTrends: TrendSeedInput[] = [
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
  {
    title: "Story: 7 hari pakai TWS",
    hook: "Setelah seminggu, jujur aja…",
    format: ContentFormat.STORYTELLING,
    score: 89,
    reason: "Review pendek, bukan unboxing doang",
  },
  {
    title: "POV: before/after meja berantakan",
    hook: "Meja gue vs 5 menit cable…",
    format: ContentFormat.POV,
    score: 86,
    reason: "Before/after mudah ditiru",
  },
  {
    title: "List: beli karena liat demo",
    hook: "3 barang yang worth it setelah dicoba…",
    format: ContentFormat.LIST,
    score: 84,
    reason: "Jujur, bukan haul flex",
  },
  {
    title: "POV: desk setup di bawah 2jt",
    hook: "Setup rapi tanpa mahal…",
    format: ContentFormat.POV,
    score: 81,
    reason: "Visual plus budget, slot gadget",
  },
  {
    title: "Story: SSD di laptop lama",
    hook: "Satu upgrade, laptop terasa baru…",
    format: ContentFormat.STORYTELLING,
    score: 78,
    reason: "Before/after PC, konkret",
  },
  {
    title: "POV: charging station malam",
    hook: "Station cas malam gue…",
    format: ContentFormat.POV,
    score: 75,
    reason: "Aesthetic plus fungsi, slot harian",
  },
];

const foodTrends: TrendSeedInput[] = [
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
  {
    title: "Story: resep nenek, porsi modern",
    hook: "Resep emak, takaran sekarang…",
    format: ContentFormat.STORYTELLING,
    score: 87,
    reason: "Emosi plus resep, bukan klaim views",
  },
  {
    title: "List: belanja dapur 50rb",
    hook: "Kulkas penuh modal 50rb…",
    format: ContentFormat.LIST,
    score: 85,
    reason: "Challenge hemat, konkret",
  },
  {
    title: "POV: telur 60 detik",
    hook: "Telur secepat ini, serius…",
    format: ContentFormat.POV,
    score: 82,
    reason: "Slot harian super pendek",
  },
  {
    title: "List: midnight snack 3 bahan",
    hook: "3 bahan, lapar malam…",
    format: ContentFormat.LIST,
    score: 80,
    reason: "Barrier rendah, mudah diulang",
  },
  {
    title: "Story: gagal masak, tetap dimakan",
    hook: "Gosong, tapi tetap disajiin…",
    format: ContentFormat.STORYTELLING,
    score: 77,
    reason: "Humor, bukan klaim viral",
  },
  {
    title: "POV: kopi susu 2 menit",
    hook: "Kopi cafe, 2 menit di rumah…",
    format: ContentFormat.POV,
    score: 74,
    reason: "Ritual, konsisten minggu",
  },
];

const trendsBase: CuratedTrendSeedRow[] = [
  ...attachCuratedMedia(coupleTrends, "Couple Date Ideas"),
  ...attachCuratedMedia(techTrends, "Tech & Gadget"),
  ...attachCuratedMedia(foodTrends, "Food & Cooking"),
];

// Cover-only (second-to-last food) + empty media (last food) for UI path coverage.
const trends: CuratedTrendSeedRow[] = trendsBase.map((row, i, arr) => {
  if (i === arr.length - 2) return applyCoverOnly(row);
  if (i === arr.length - 1) return applyEmptyMedia(row);
  return row;
});

async function main() {
  await prisma.trend.deleteMany({
    where: { niche: { in: [...NICHES] } },
  });

  await prisma.trend.createMany({ data: trends });

  const withCover = trends.filter((t) => Boolean(t.coverUrl)).length;

  for (const niche of NICHES) {
    const count = await prisma.trend.count({ where: { niche } });
    console.log(`  ${niche}: ${count} tren`);
  }

  console.log(
    `Seed selesai: ${trends.length} tren total (${withCover} with coverUrl)`,
  );
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
