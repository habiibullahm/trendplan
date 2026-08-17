"use client";

import { useState, useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import {
  formatMonthParam,
  type PlannerTab,
  type PlannerView,
} from "@/lib/week";

type Props = {
  view: PlannerView;
  tab: PlannerTab;
  year: number;
  month: number;
  weekIndex: number;
};

function hrefFor(
  view: PlannerView,
  tab: PlannerTab,
  year: number,
  month: number,
  weekIndex: number,
) {
  const q = new URLSearchParams({
    month: formatMonthParam(year, month),
    week: String(weekIndex),
  });
  if (tab === "aktivitas") q.set("tab", "aktivitas");
  if (view === "shared") q.set("view", "shared");
  return `/planner?${q.toString()}`;
}

function isModifiedClick(e: MouseEvent) {
  return (
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    e.button !== 0
  );
}

const ITEMS: { id: PlannerView; label: string }[] = [
  { id: "mine", label: "Plan saya" },
  { id: "shared", label: "Plan bersama" },
];

export function PlannerViewToggle({
  view,
  tab,
  year,
  month,
  weekIndex,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingView, setPendingView] = useState<PlannerView | null>(null);
  const loadingView = pending ? pendingView : null;

  function goView(next: PlannerView) {
    if (pending || next === view) return;
    setPendingView(next);
    startTransition(() => {
      router.push(hrefFor(next, tab, year, month, weekIndex));
    });
  }

  return (
    <nav
      aria-label="Tampilan plan"
      aria-busy={pending || undefined}
      className="mt-2 inline-flex w-fit max-w-full gap-0.5 rounded-lg border border-border bg-surface p-0.5"
    >
      {ITEMS.map((item) => {
        const active = view === item.id;
        const loading = loadingView === item.id;
        return (
          <Link
            key={item.id}
            href={hrefFor(item.id, tab, year, month, weekIndex)}
            className={`inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              active
                ? "bg-coral/10 text-coral"
                : "text-ink-muted hover:bg-coral/5 hover:text-ink"
            } ${
              pending && !loading
                ? "pointer-events-none opacity-60"
                : loading
                  ? "pointer-events-none"
                  : ""
            }`}
            aria-current={active ? "page" : undefined}
            aria-busy={loading || undefined}
            onClick={(e) => {
              if (isModifiedClick(e)) return;
              e.preventDefault();
              goView(item.id);
            }}
          >
            {loading ? <Spinner className="size-3 shrink-0" /> : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
