import Link from "next/link";
import { LinkPendingSpinner } from "@/features/planner/components/link-pending";
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
  return (
    <nav
      aria-label="Tampilan plan"
      className="mt-2 inline-flex w-fit max-w-full gap-0.5 rounded-lg border border-border bg-surface p-0.5"
    >
      {ITEMS.map((item) => {
        const active = view === item.id;
        return (
          <Link
            key={item.id}
            href={hrefFor(item.id, tab, year, month, weekIndex)}
            prefetch={false}
            className={`inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              active
                ? "bg-coral/10 text-coral"
                : "text-ink-muted hover:bg-coral/5 hover:text-ink"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <LinkPendingSpinner className="size-3 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
