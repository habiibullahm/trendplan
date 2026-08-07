import type { ContentStatus } from "@/generated/prisma/client";
import { formatWeekRange, getWeekStart } from "@/lib/week";

export type DemoPlannerItem = {
  id: string;
  dayOfWeek: number;
  title: string;
  status: ContentStatus;
};

/** Hardcoded week for public /demo embed — no DB, no auth. */
export const DEMO_ITEMS: DemoPlannerItem[] = [
  {
    id: "demo-sen",
    dayOfWeek: 0,
    title: "Cheap date under 100k",
    status: "READY",
  },
  {
    id: "demo-sel",
    dayOfWeek: 1,
    title: "Rainy day date at home",
    status: "DRAFT",
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
  },
  {
    id: "demo-sab",
    dayOfWeek: 5,
    title: "Cook together date night",
    status: "READY",
  },
];

export function demoWeekLabel(date = new Date()): string {
  return formatWeekRange(getWeekStart(date));
}
