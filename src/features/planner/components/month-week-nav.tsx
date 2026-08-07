"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  formatMonthLabel,
  formatMonthParam,
  shiftMonth,
} from "@/lib/week";
import type { MonthWeekChip } from "@/features/planner/lib/month-week";

export type { MonthWeekChip };

type Props = {
  year: number;
  month: number;
  weekIndex: number;
  weeks: MonthWeekChip[];
};

export function MonthWeekNav({ year, month, weekIndex, weeks }: Props) {
  const router = useRouter();
  const monthLabel = formatMonthLabel(year, month);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  function goMonth(y: number, m: number) {
    router.push(`/planner?month=${formatMonthParam(y, m)}`);
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => goMonth(prev.year, prev.month)}
          className="min-touch inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
          aria-label="Bulan sebelumnya"
        >
          ‹
        </button>
        <p className="min-w-[9rem] text-center text-sm font-semibold text-ink">
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => goMonth(next.year, next.month)}
          className="min-touch inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
          aria-label="Bulan berikutnya"
        >
          ›
        </button>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {weeks.map((w) => {
          const active = w.index === weekIndex;
          const href = `/planner?month=${formatMonthParam(year, month)}&week=${w.index}`;
          return (
            <Link
              key={w.weekStartParam}
              href={href}
              className={`min-w-[7.5rem] shrink-0 rounded-xl border px-3 py-2 transition-colors ${
                active
                  ? "border-coral bg-coral/10 text-coral"
                  : "border-border bg-surface text-ink hover:border-coral/40"
              }`}
            >
              <p className="text-xs font-semibold">Minggu {w.index}</p>
              <p
                className={`mt-0.5 text-[11px] ${active ? "text-coral/80" : "text-ink-muted"}`}
              >
                {w.rangeLabel}
              </p>
              <p
                className={`mt-1 text-[11px] font-medium ${active ? "text-coral" : "text-ink-muted"}`}
              >
                isi {w.filled}/7
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
