import type { ContentFormat, ContentStatus } from "@/generated/prisma/client";
import { formatWeekRange, getWeekStart } from "@/lib/week";

export type DemoPlannerItem = {
  id: string;
  dayOfWeek: number;
  title: string;
  status: ContentStatus;
  performanceNote?: string;
};

export type DemoTrend = {
  id: string;
  title: string;
  hook: string;
  format: ContentFormat;
  score: number;
  reason: string;
};

export const DEMO_WEEKLY_GOAL = 5;
export const DEMO_USER_NAME = "Demo Creator";
export const DEMO_NICHE = "Couple Date Ideas";

/** Hardcoded week for public /demo embed — no DB, no auth. */
export const DEMO_ITEMS: DemoPlannerItem[] = [
  {
    id: "demo-sen",
    dayOfWeek: 0,
    title: "Cheap date under 100k",
    status: "IDE",
  },
  {
    id: "demo-sel",
    dayOfWeek: 1,
    title: "Rainy day date at home",
    status: "IDE",
  },
  {
    id: "demo-rab",
    dayOfWeek: 2,
    title: "Aesthetic cafe date vlog",
    status: "IDE",
  },
  {
    id: "demo-jum",
    dayOfWeek: 4,
    title: "Sunset picnic date",
    status: "POSTED",
    performanceNote: "Hook kuat — coba angle sunset lagi",
  },
  {
    id: "demo-sab",
    dayOfWeek: 5,
    title: "Cook together date night",
    status: "IDE",
  },
];

export const DEMO_TRENDS: DemoTrend[] = [
  {
    id: "demo-trend-1",
    title: "Cheap date under 100k",
    hook: "3 date ideas that feel expensive…",
    format: "LIST",
    score: 94,
    reason: "Tren hemat cocok niche couple — ide actionable untuk minggu ini",
  },
  {
    id: "demo-trend-2",
    title: "Rainy day date at home",
    hook: "When it rains, try this instead…",
    format: "POV",
    score: 91,
    reason: "Format POV sedang naik dan low effort untuk creator solo",
  },
  {
    id: "demo-trend-3",
    title: "Aesthetic cafe date vlog",
    hook: "We found the coziest cafe for…",
    format: "STORYTELLING",
    score: 88,
    reason: "Visual cafe + storytelling pas untuk Couple Date Ideas",
  },
  {
    id: "demo-trend-4",
    title: "First date checklist",
    hook: "Don’t go on a first date without…",
    format: "LIST",
    score: 86,
    reason: "Checklist mudah diikuti dan sering di-save audiens dating",
  },
  {
    id: "demo-trend-5",
    title: "Night drive date ideas",
    hook: "POV: night drive with your person…",
    format: "POV",
    score: 82,
    reason: "POV + musik malam masih sering naik di FYP",
  },
  {
    id: "demo-trend-6",
    title: "Bookstore date aesthetic",
    hook: "Take them to a bookstore and do this…",
    format: "POV",
    score: 78,
    reason: "Aesthetic + soft romance cocok untuk feed couple",
  },
];

export function demoWeekLabel(date = new Date()): string {
  return formatWeekRange(getWeekStart(date));
}

export function demoPostedItems() {
  return DEMO_ITEMS.filter((item) => item.status === "POSTED");
}
