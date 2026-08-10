import type { ContentItem } from "@/generated/prisma/client";
import {
  getJakartaWeekdayMon0,
  getJakartaYmd,
  getWeekStart,
  ymdToDate,
} from "@/lib/week";

export type TomorrowContext = {
  /** Jakarta Y-M-D of besok (ReminderDispatch.targetDate). */
  targetDate: string;
  tomorrow: Date;
  weekStart: Date;
  dayOfWeek: number;
};

/** Resolve "besok" in Asia/Jakarta from an instant. */
export function getTomorrowContext(now = new Date()): TomorrowContext {
  const today = getJakartaYmd(now);
  const todayUtc = ymdToDate(today.year, today.month, today.day);
  const tomorrow = new Date(todayUtc);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const y = tomorrow.getUTCFullYear();
  const m = tomorrow.getUTCMonth() + 1;
  const d = tomorrow.getUTCDate();
  const targetDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return {
    targetDate,
    tomorrow,
    weekStart: getWeekStart(tomorrow),
    dayOfWeek: getJakartaWeekdayMon0(tomorrow),
  };
}

export type ReminderCopy = {
  title: string;
  body: string;
  url: string;
};

/**
 * Primary: unfinished item(s) for tomorrow.
 * Fallback: week under weeklyGoal when no tomorrow item.
 */
export function buildPlanReminderCopy(opts: {
  tomorrowItems: Pick<ContentItem, "title">[];
  weekItemCount: number;
  weeklyGoal: number;
}): ReminderCopy | null {
  const { tomorrowItems, weekItemCount, weeklyGoal } = opts;

  if (tomorrowItems.length === 1) {
    return {
      title: "Pengingat TrendPlan",
      body: `Besok: ${tomorrowItems[0].title}`,
      url: "/planner",
    };
  }
  if (tomorrowItems.length > 1) {
    return {
      title: "Pengingat TrendPlan",
      body: `Besok ada ${tomorrowItems.length} ide siap disiapkan`,
      url: "/planner",
    };
  }

  if (weekItemCount < weeklyGoal) {
    return {
      title: "Pengingat TrendPlan",
      body: `Minggu ini ${weekItemCount}/${weeklyGoal} ide — ayo lanjut di planner`,
      url: "/planner",
    };
  }

  return null;
}
