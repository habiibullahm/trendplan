"use client";

import { useState, useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import {
  formatMonthLabel,
  formatMonthParam,
  shiftMonth,
  type PlannerTab,
} from "@/lib/week";
import type { MonthWeekChip } from "@/features/planner/lib/month-week";

export type { MonthWeekChip };

type Props = {
  year: number;
  month: number;
  weekIndex: number;
  weeks: MonthWeekChip[];
  tab?: PlannerTab;
  /** `content` = N ide; `activities` = N aktivitas */
  metric?: "content" | "activities";
};

function isModifiedClick(e: MouseEvent) {
  return (
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    e.button !== 0
  );
}

export function MonthWeekNav({
  year,
  month,
  weekIndex,
  weeks,
  tab = "konten",
  metric = "content",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingWeek, setPendingWeek] = useState<number | null>(null);
  const [monthPending, setMonthPending] = useState<"prev" | "next" | null>(
    null,
  );
  const monthLabel = formatMonthLabel(year, month);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const loadingWeek = pending ? pendingWeek : null;
  const loadingMonth = pending ? monthPending : null;

  function monthHref(y: number, m: number) {
    const q = new URLSearchParams({ month: formatMonthParam(y, m) });
    if (tab === "aktivitas") q.set("tab", "aktivitas");
    return `/planner?${q.toString()}`;
  }

  function goMonth(dir: "prev" | "next", y: number, m: number) {
    if (pending) return;
    setMonthPending(dir);
    setPendingWeek(null);
    startTransition(() => {
      router.push(monthHref(y, m));
    });
  }

  function weekHref(week: number) {
    const q = new URLSearchParams({
      month: formatMonthParam(year, month),
      week: String(week),
    });
    if (tab === "aktivitas") q.set("tab", "aktivitas");
    return `/planner?${q.toString()}`;
  }

  function goWeek(week: number) {
    if (pending || week === weekIndex) return;
    setPendingWeek(week);
    setMonthPending(null);
    startTransition(() => {
      router.push(weekHref(week));
    });
  }

  function metricLabel(filled: number) {
    if (metric === "activities") {
      return `${filled} aktivitas`;
    }
    return `${filled} ide`;
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => goMonth("prev", prev.year, prev.month)}
          disabled={pending}
          className="min-touch inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-coral/40 hover:bg-coral/5 disabled:pointer-events-none disabled:opacity-60"
          aria-label="Bulan sebelumnya"
          aria-busy={loadingMonth === "prev" || undefined}
        >
          {loadingMonth === "prev" ? <Spinner className="size-3.5" /> : "‹"}
        </button>
        <p className="min-w-[9rem] text-center text-sm font-semibold text-ink">
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => goMonth("next", next.year, next.month)}
          disabled={pending}
          className="min-touch inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-coral/40 hover:bg-coral/5 disabled:pointer-events-none disabled:opacity-60"
          aria-label="Bulan berikutnya"
          aria-busy={loadingMonth === "next" || undefined}
        >
          {loadingMonth === "next" ? <Spinner className="size-3.5" /> : "›"}
        </button>
      </div>

      <div className="tp-scroll-x -mx-1 flex gap-2 px-1">
        {weeks.map((w) => {
          const active = w.index === weekIndex;
          const loading = loadingWeek === w.index;
          return (
            <Link
              key={w.weekStartParam}
              href={weekHref(w.index)}
              aria-current={active ? "page" : undefined}
              aria-busy={loading || undefined}
              onClick={(e) => {
                // Keep cmd/ctrl/shift/middle-click as real link navigation.
                if (isModifiedClick(e)) return;
                e.preventDefault();
                goWeek(w.index);
              }}
              className={`relative min-w-[7.5rem] shrink-0 rounded-xl border px-3 py-2 transition-colors duration-200 ${
                active
                  ? "border-coral bg-coral/10 text-coral"
                  : "border-border bg-surface text-ink"
              } ${
                pending && !loading
                  ? "pointer-events-none opacity-60"
                  : loading
                    ? "pointer-events-none"
                    : ""
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
                {loading ? (
                  <>
                    <Spinner className="size-3" />
                    <span>Memuat…</span>
                  </>
                ) : (
                  metricLabel(w.filled)
                )}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
