import Link from "next/link";
import {
  LinkPendingGlyph,
  LinkPendingLabel,
} from "@/features/planner/components/link-pending";
import {
  formatMonthLabel,
  formatMonthParam,
  shiftMonth,
  type PlannerTab,
  type PlannerView,
} from "@/lib/week";
import type { MonthWeekChip } from "@/features/planner/lib/month-week";

export type { MonthWeekChip };

type Props = {
  year: number;
  month: number;
  weekIndex: number;
  weeks: MonthWeekChip[];
  tab?: PlannerTab;
  view?: PlannerView;
  /** `content` = N ide; `activities` = N aktivitas */
  metric?: "content" | "activities";
};

function appendView(
  q: URLSearchParams,
  tab: PlannerTab,
  view: PlannerView,
) {
  if (tab === "aktivitas") q.set("tab", "aktivitas");
  if (view === "shared") q.set("view", "shared");
}

function monthHref(
  y: number,
  m: number,
  tab: PlannerTab,
  view: PlannerView,
) {
  const q = new URLSearchParams({ month: formatMonthParam(y, m) });
  appendView(q, tab, view);
  return `/planner?${q.toString()}`;
}

function weekHref(
  year: number,
  month: number,
  week: number,
  tab: PlannerTab,
  view: PlannerView,
) {
  const q = new URLSearchParams({
    month: formatMonthParam(year, month),
    week: String(week),
  });
  appendView(q, tab, view);
  return `/planner?${q.toString()}`;
}

export function MonthWeekNav({
  year,
  month,
  weekIndex,
  weeks,
  tab = "konten",
  view = "mine",
  metric = "content",
}: Props) {
  const monthLabel = formatMonthLabel(year, month);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  function metricLabel(filled: number) {
    if (metric === "activities") {
      return `${filled} aktivitas`;
    }
    return `${filled} ide`;
  }

  const monthLinkClass =
    "min-touch inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-coral/40 hover:bg-coral/5";

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface/60 p-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href={monthHref(prev.year, prev.month, tab, view)}
          prefetch={false}
          className={monthLinkClass}
          aria-label="Bulan sebelumnya"
        >
          <LinkPendingGlyph idle="‹" />
        </Link>
        <p className="min-w-[9rem] text-center text-sm font-semibold text-ink">
          {monthLabel}
        </p>
        <Link
          href={monthHref(next.year, next.month, tab, view)}
          prefetch={false}
          className={monthLinkClass}
          aria-label="Bulan berikutnya"
        >
          <LinkPendingGlyph idle="›" />
        </Link>
      </div>

      <div className="tp-scroll-x mt-2 -mx-0.5 flex gap-2 px-0.5">
        {weeks.map((w) => {
          const active = w.index === weekIndex;
          return (
            <Link
              key={w.weekStartParam}
              href={weekHref(year, month, w.index, tab, view)}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={`relative min-w-[7.5rem] shrink-0 rounded-xl border px-3 py-2 transition-colors duration-200 ${
                active
                  ? "border-coral bg-coral/10 text-coral"
                  : "border-border bg-surface text-ink"
              }`}
            >
              <p className="text-xs font-semibold">Minggu {w.index}</p>
              <p
                className={`mt-0.5 text-[11px] ${active ? "text-coral/80" : "text-ink-muted"}`}
              >
                {w.rangeLabel}
              </p>
              <p
                className={`mt-1 inline-flex min-h-[1rem] items-center gap-1.5 text-[11px] font-medium ${active ? "text-coral" : "text-ink-muted"}`}
              >
                <LinkPendingLabel idle={metricLabel(w.filled)} />
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
