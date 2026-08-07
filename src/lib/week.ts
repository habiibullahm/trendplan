/** Monday-based week helpers (0 = Senin … 6 = Minggu), Asia/Jakarta calendar. */

export const TIME_ZONE = "Asia/Jakarta";

const WEEKDAY_MON0: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/** Calendar Y-M-D in Asia/Jakarta. */
export function getJakartaYmd(date = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day };
}

/** 0 = Senin … 6 = Minggu in Asia/Jakarta. */
export function getJakartaWeekdayMon0(date = new Date()): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
  }).format(date);
  return WEEKDAY_MON0[wd] ?? 0;
}

/** Stable Date for a calendar day (UTC midnight of that Y-M-D). */
export function ymdToDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatWeekStartParam(weekStart: Date): string {
  // Jakarta calendar day so legacy local-midnight rows still key to the same Senin.
  const { year, month, day } = getJakartaYmd(weekStart);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseWeekStartParam(
  raw: string | undefined | null,
): Date | null {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [y, m, d] = raw.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const candidate = ymdToDate(y, m, d);
  // Reject spilled dates (e.g. 2026-02-31 → March).
  if (
    candidate.getUTCFullYear() !== y ||
    candidate.getUTCMonth() + 1 !== m ||
    candidate.getUTCDate() !== d
  ) {
    return null;
  }
  return getWeekStart(candidate);
}

export function getWeekStart(date = new Date()): Date {
  const { year, month, day } = getJakartaYmd(date);
  const mon0 = getJakartaWeekdayMon0(date);
  const cursor = ymdToDate(year, month, day);
  cursor.setUTCDate(cursor.getUTCDate() - mon0);
  return cursor;
}

export function formatWeekRange(weekStart: Date): string {
  const start = getWeekStart(weekStart);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function formatMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(ymdToDate(year, month, 1));
}

export function formatMonthParam(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseMonthParam(
  raw: string | undefined | null,
  now = new Date(),
): { year: number; month: number } {
  const fallback = getJakartaYmd(now);
  if (!raw || !/^\d{4}-\d{2}$/.test(raw)) {
    return { year: fallback.year, month: fallback.month };
  }
  const [y, m] = raw.split("-").map(Number);
  if (m < 1 || m > 12) {
    return { year: fallback.year, month: fallback.month };
  }
  return { year: y, month: m };
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const d = ymdToDate(year, month, 1);
  d.setUTCMonth(d.getUTCMonth() + delta);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

/**
 * Monday weekStarts whose [Mon, Sun] range overlaps the calendar month
 * (Asia/Jakarta month boundaries).
 */
export function weeksIntersectingMonth(
  year: number,
  month: number,
): Date[] {
  const monthStart = ymdToDate(year, month, 1);
  const monthEnd = ymdToDate(year, month + 1, 0);
  let cursor = getWeekStart(monthStart);
  const weeks: Date[] = [];

  while (cursor.getTime() <= monthEnd.getTime()) {
    const weekEnd = new Date(cursor);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    if (weekEnd.getTime() >= monthStart.getTime()) {
      weeks.push(new Date(cursor));
    }
    cursor = new Date(cursor);
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }

  return weeks;
}

export function resolvePlannerSelection(opts: {
  monthParam?: string | null;
  weekParam?: string | null;
  now?: Date;
}): {
  year: number;
  month: number;
  weekIndex: number;
  weekStarts: Date[];
  weekStart: Date;
  monthParam: string;
} {
  const now = opts.now ?? new Date();
  const { year, month } = parseMonthParam(opts.monthParam, now);
  const weekStarts = weeksIntersectingMonth(year, month);
  const todayWeek = getWeekStart(now);

  let weekIndex = Number(opts.weekParam);
  if (
    !Number.isInteger(weekIndex) ||
    weekIndex < 1 ||
    weekIndex > weekStarts.length
  ) {
    const idx = weekStarts.findIndex((w) => w.getTime() === todayWeek.getTime());
    weekIndex = idx >= 0 ? idx + 1 : 1;
  }

  return {
    year,
    month,
    weekIndex,
    weekStarts,
    weekStart: weekStarts[weekIndex - 1] ?? todayWeek,
    monthParam: formatMonthParam(year, month),
  };
}

/**
 * Default month for a week: month of that week's Thursday (stable for
 * Mon–Sun spans that cross a month boundary).
 */
export function monthForWeekStart(weekStart: Date): {
  year: number;
  month: number;
  weekIndex: number;
  monthParam: string;
} {
  const canonical = getWeekStart(weekStart);
  const thursday = new Date(canonical);
  thursday.setUTCDate(thursday.getUTCDate() + 3);
  const { year, month } = {
    year: thursday.getUTCFullYear(),
    month: thursday.getUTCMonth() + 1,
  };
  const weeks = weeksIntersectingMonth(year, month);
  const idx = weeks.findIndex((w) => w.getTime() === canonical.getTime());
  return {
    year,
    month,
    weekIndex: idx >= 0 ? idx + 1 : 1,
    monthParam: formatMonthParam(year, month),
  };
}

/** Build /planner?month=&week= with optional toast/undo. Prefer viewed month when valid. */
export function plannerHref(opts: {
  weekStart: Date;
  monthParam?: string | null;
  weekParam?: string | null;
  toast?: string;
  undo?: string;
}): string {
  const canonical = getWeekStart(opts.weekStart);
  let year: number;
  let month: number;
  let weekIndex: number;

  const viewed = parseMonthParam(opts.monthParam ?? null);
  const viewedWeeks = weeksIntersectingMonth(viewed.year, viewed.month);
  const viewedIdx = viewedWeeks.findIndex(
    (w) => w.getTime() === canonical.getTime(),
  );

  if (opts.monthParam && /^\d{4}-\d{2}$/.test(opts.monthParam) && viewedIdx >= 0) {
    year = viewed.year;
    month = viewed.month;
    weekIndex = viewedIdx + 1;
  } else {
    const fallback = monthForWeekStart(canonical);
    year = fallback.year;
    month = fallback.month;
    weekIndex = fallback.weekIndex;
  }

  const q = new URLSearchParams({
    month: formatMonthParam(year, month),
    week: String(weekIndex),
  });
  if (opts.toast) q.set("toast", opts.toast);
  if (opts.undo) q.set("undo", opts.undo);
  return `/planner?${q.toString()}`;
}

export const DAY_LABELS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
] as const;

export const DAY_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;
