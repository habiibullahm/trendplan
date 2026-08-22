import Link from "next/link";
import { LinkPendingSpinner } from "@/features/planner/components/link-pending";
import {
  formatMonthParam,
  type PlannerTab,
  type PlannerView,
} from "@/lib/week";

type Props = {
  tab: PlannerTab;
  year: number;
  month: number;
  weekIndex: number;
  view?: PlannerView;
  /** Prefix for demo routes, e.g. `/demo`. */
  basePath?: string;
};

function hrefFor(
  tab: PlannerTab,
  year: number,
  month: number,
  weekIndex: number,
  view: PlannerView = "mine",
  basePath = "",
) {
  const q = new URLSearchParams({
    month: formatMonthParam(year, month),
    week: String(weekIndex),
  });
  if (tab === "aktivitas") q.set("tab", "aktivitas");
  if (view === "shared") q.set("view", "shared");
  return `${basePath}/planner?${q.toString()}`;
}

export function PlannerTabs({
  tab,
  year,
  month,
  weekIndex,
  view = "mine",
  basePath = "",
}: Props) {
  const items: { id: PlannerTab; label: string }[] = [
    { id: "konten", label: "Konten" },
    { id: "aktivitas", label: "Aktivitas" },
  ];

  return (
    <nav aria-label="Tab planner" className="mt-4 flex gap-1 rounded-xl border border-border bg-surface p-1">
      {items.map((item) => {
        const active = tab === item.id;
        return (
          <Link
            key={item.id}
            href={hrefFor(item.id, year, month, weekIndex, view, basePath)}
            prefetch={false}
            className={`min-touch inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors ${
              active
                ? "bg-coral/10 text-coral hover:bg-coral/15"
                : "text-ink-muted hover:bg-coral/5 hover:text-ink"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <LinkPendingSpinner className="size-3.5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
