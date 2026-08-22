import type { ContentFormat, ContentStatus } from "@/generated/prisma/client";
import { formatWeekRange, getWeekStart } from "@/lib/week";
import { CURATED_COVERS } from "@/features/planner/lib/curated-trend-media";

export type DemoPlannerItem = {
  id: string;
  dayOfWeek: number;
  title: string;
  status: ContentStatus;
};

export type DemoTrend = {
  id: string;
  title: string;
  hook: string;
  format: ContentFormat;
  reason: string;
  niche?: string;
  coverUrl?: string | null;
};

export const DEMO_WEEKLY_GOAL = 5;
export const DEMO_USER_NAME = "Demo Creator";
export const DEMO_NICHE = "Couple Date Ideas";

const COVERS = CURATED_COVERS;

/**
 * Planner mock = konten milik creator (judul kerja di plan).
 * Sengaja beda dari DEMO_TRENDS agar tidak bentrok dengan rekomendasi tren.
 */
export const DEMO_ITEMS: DemoPlannerItem[] = [
  {
    id: "demo-sen",
    dayOfWeek: 0,
    title: "Caption picnic taman — revisi 2",
    status: "IDE",
  },
  {
    id: "demo-sel",
    dayOfWeek: 1,
    title: "POV hujan: board game night",
    status: "IDE",
  },
  {
    id: "demo-rab",
    dayOfWeek: 2,
    title: "Draft: toko buku Blok M",
    status: "IDE",
  },
  {
    id: "demo-jum",
    dayOfWeek: 4,
    title: "Masak bareng malam minggu",
    status: "POSTED",
  },
  {
    id: "demo-sab",
    dayOfWeek: 5,
    title: "Anniversary hemat di rumah",
    status: "IDE",
  },
];

export type DemoActivityItem = {
  id: string;
  dayOfWeek: number;
  title: string;
};

/** Daily activities mock — independent from content slots. */
export const DEMO_ACTIVITIES: DemoActivityItem[] = [
  { id: "demo-act-1", dayOfWeek: 0, title: "Picnic di taman" },
  { id: "demo-act-2", dayOfWeek: 0, title: "Nonton malam" },
  { id: "demo-act-3", dayOfWeek: 5, title: "Date TMII" },
  { id: "demo-act-4", dayOfWeek: 5, title: "Bianglala" },
  { id: "demo-act-5", dayOfWeek: 6, title: "Brunch cafe" },
];

/**
 * Rekomendasi mock = katalog tren (format/hook viral).
 * Bukan item planner; user masih perlu “Pakai” untuk masuk plan.
 */
export const DEMO_TRENDS: DemoTrend[] = [
  {
    id: "demo-trend-1",
    title: "Format: 3 date di bawah 100rb",
    hook: "3 date ideas that feel expensive…",
    format: "LIST",
    reason: "Tren hemat — cocok diisi ke slot kosong minggu ini",
    niche: "Couple Date Ideas",
    coverUrl: COVERS[0],
  },
  {
    id: "demo-trend-2",
    title: "POV: hujan, date di rumah aja",
    hook: "When it rains, try this instead…",
    format: "POV",
    reason: "POV low effort, mudah diambil creator solo",
    niche: "Couple Date Ideas",
    coverUrl: COVERS[1],
  },
  {
    id: "demo-trend-3",
    title: "Story: cafe aesthetic first date",
    hook: "We found the coziest cafe for…",
    format: "STORYTELLING",
    reason: "Visual cafe + storytelling pas niche couple",
    niche: "Couple Date Ideas",
    coverUrl: COVERS[2],
  },
  {
    id: "demo-trend-4",
    title: "List: checklist kencan pertama",
    hook: "Don’t go on a first date without…",
    format: "LIST",
    reason: "Checklist sering di-save audiens dating",
    niche: "Couple Date Ideas",
    coverUrl: COVERS[3],
  },
  {
    id: "demo-trend-5",
    title: "POV: night drive bareng doi",
    hook: "POV: night drive with your person…",
    format: "POV",
    reason: "POV + musik malam masih sering naik di niche couple",
    niche: "Couple Date Ideas",
    coverUrl: COVERS[0],
  },
  {
    id: "demo-trend-6",
    title: "POV: bookstore date soft launch",
    hook: "Take them to a bookstore and do this…",
    format: "POV",
    reason: "Aesthetic soft — beda dari konten cafe biasa",
    niche: "Couple Date Ideas",
  },
];

export function demoWeekLabel(date = new Date()): string {
  return formatWeekRange(getWeekStart(date));
}

export function demoPostedItems() {
  return DEMO_ITEMS.filter((item) => item.status === "POSTED");
}
