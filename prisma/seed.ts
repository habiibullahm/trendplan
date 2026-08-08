import "dotenv/config";
import { ContentFormat } from "../src/generated/prisma/client";
import { createPrismaClientFromEnv } from "../src/lib/db";
import { NICHES } from "../src/lib/niches";

const { prisma, pool } = createPrismaClientFromEnv();

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
  trends: Omit<TrendSeed, "niche" | "coverUrl" | "videoUrl" | "audioTitle" | "audioUrl">[],
  niche: (typeof NICHES)[number],
): TrendSeed[] {
  return trends.map((t, index) => {
    const coverUrl = COVERS[index % COVERS.length];
    const audioTitle = AUDIO_TITLES[index % AUDIO_TITLES.length];
    // Every other card gets playable audio.
    const audioUrl = index % 2 === 0 ? AUDIO_URLS[index % AUDIO_URLS.length] : null;
    // Every trend gets sample video + cover (cover-only demo is applied once globally below).
    return {
      ...t,
      niche,
      coverUrl,
      videoUrl: "/mocks/video/sample.mp4",
      audioTitle,
      audioUrl,
    };
  });
}

const coupleTrends: Omit<TrendSeed, "niche">[] = [
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
    reason: "Visual golden hour perform bagus di TikTok",
  },
  {
    title: "POV: night drive bareng doi",
    hook: "POV: night drive with your person…",
    format: ContentFormat.POV,
    score: 82,
    reason: "POV + musik malam masih sering naik di FYP",
  },
  {
    title: "Story: anniversary hemat di rumah",
    hook: "Anniversary on a budget hits different…",
    format: ContentFormat.STORYTELLING,
    score: 80,
    reason: "Relatable untuk pasangan muda dengan budget terbatas",
  },
  {
    title: "List: masak bareng 20 menit",
    hook: "Date night recipe you can cook in 20 min…",
    format: ContentFormat.LIST,
    score: 79,
    reason: "At-home date mudah diulang dan engagement tinggi",
  },
  {
    title: "POV: bookstore date soft launch",
    hook: "Take them to a bookstore and do this…",
    format: ContentFormat.POV,
    score: 77,
    reason: "Aesthetic soft — beda dari konten cafe biasa",
  },
  {
    title: "List: date 0 rupiah di kota",
    hook: "0 rupiah dates that still feel special…",
    format: ContentFormat.LIST,
    score: 76,
    reason: "Keyword hemat/gratis sering dicari creator dating",
  },
  {
    title: "Story: morning coffee date routine",
    hook: "Our slow morning date looks like this…",
    format: ContentFormat.STORYTELLING,
    score: 74,
    reason: "Routine vlog ringan untuk konsistensi posting mingguan",
  },
];

const techTrends: Omit<TrendSeed, "niche">[] = [
  {
    title: "List: 3 fitur tersembunyi HP kamu",
    hook: "Yakin udah tau semua fitur HP kamu?",
    format: ContentFormat.LIST,
    score: 95,
    reason: "Hook rasa FOMO + mudah diulang tiap model HP",
  },
  {
    title: "POV: desk setup under 2jt",
    hook: "Budget desk setup that looks expensive…",
    format: ContentFormat.POV,
    score: 92,
    reason: "Visual setup + budget = save-heavy di niche gadget",
  },
  {
    title: "Story: unboxing TWS Anker seminggu",
    hook: "After 7 days with this TWS…",
    format: ContentFormat.STORYTELLING,
    score: 89,
    reason: "Review jangka pendek terasa jujur untuk audiens tech",
  },
  {
    title: "List: cable management 5 menit",
    hook: "Clean cable setup in 5 minutes…",
    format: ContentFormat.LIST,
    score: 86,
    reason: "Low effort, hasil visual jelas di FYP",
  },
  {
    title: "POV: noise cancelling pertama kali",
    hook: "POV: first time turning on ANC…",
    format: ContentFormat.POV,
    score: 84,
    reason: "Transisi audio/visual kuat untuk gadget short-form",
  },
  {
    title: "List: aksesoris WFH wajib",
    hook: "WFH essentials you actually need…",
    format: ContentFormat.LIST,
    score: 81,
    reason: "Checklist praktis, cocok creator produktivitas + tech",
  },
  {
    title: "Story: upgrade SSD laptop lama",
    hook: "This one upgrade made my laptop new…",
    format: ContentFormat.STORYTELLING,
    score: 78,
    reason: "Before/after perform bagus di audiens PC/laptop",
  },
  {
    title: "POV: charging station aesthetic",
    hook: "My night charging station looks like this…",
    format: ContentFormat.POV,
    score: 75,
    reason: "Aesthetic + utility — mudah ditiru",
  },
];

const foodTrends: Omit<TrendSeed, "niche">[] = [
  {
    title: "List: meal prep 3 menu hemat",
    hook: "3 meal prep recipes under 20k…",
    format: ContentFormat.LIST,
    score: 93,
    reason: "Budget + batch cook = save rate tinggi",
  },
  {
    title: "POV: masak telur 60 detik",
    hook: "Eggs in 60 seconds, trust me…",
    format: ContentFormat.POV,
    score: 90,
    reason: "Super pendek, mudah di-loop FYP",
  },
  {
    title: "Story: resep nenek jadi viral",
    hook: "Grandma’s recipe that broke the internet…",
    format: ContentFormat.STORYTELLING,
    score: 87,
    reason: "Emosi + resep klasik kuat di niche food",
  },
  {
    title: "List: belanja dapur 50rb",
    hook: "Full fridge under 50k…",
    format: ContentFormat.LIST,
    score: 85,
    reason: "Challenge hemat sering diikuti creator food",
  },
  {
    title: "POV: plating cafe di rumah",
    hook: "Cafe plating at home, no fancy tools…",
    format: ContentFormat.POV,
    score: 82,
    reason: "Visual plating = shareable tanpa studio",
  },
  {
    title: "List: snack midnight 3 bahan",
    hook: "3-ingredient midnight snacks…",
    format: ContentFormat.LIST,
    score: 80,
    reason: "Low barrier, cocok konten harian",
  },
  {
    title: "Story: gagal masak jadi ASMR",
    hook: "I burned it… and it still went viral",
    format: ContentFormat.STORYTELLING,
    score: 77,
    reason: "Fail content relatable + humor",
  },
  {
    title: "POV: kopi susu 2 menit",
    hook: "Cafe-level iced coffee in 2 minutes…",
    format: ContentFormat.POV,
    score: 74,
    reason: "Ritual kopi sering naik di FYP Indonesia",
  },
];

const trends: TrendSeed[] = [
  ...withMockMedia(coupleTrends, "Couple Date Ideas"),
  ...withMockMedia(techTrends, "Tech & Gadget"),
  ...withMockMedia(foodTrends, "Food & Cooking"),
];

// One intentional cover/video-less row (lowest-score food card) for empty-state UI demos.
const last = trends[trends.length - 1];
if (last) {
  last.coverUrl = null;
  last.videoUrl = null;
  last.audioUrl = null;
}

async function main() {
  await prisma.trend.deleteMany({
    where: { niche: { in: [...NICHES] } },
  });

  await prisma.trend.createMany({ data: trends });

  const withVideo = trends.filter((t) => Boolean(t.videoUrl)).length;
  const withoutVideo = trends.length - withVideo;

  for (const niche of NICHES) {
    const count = await prisma.trend.count({ where: { niche } });
    console.log(`  ${niche}: ${count} tren`);
  }

  console.log(
    `Seed selesai: ${trends.length} tren total (${withVideo} with videoUrl, ${withoutVideo} without)`,
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
