import Link from "next/link";
import {
  formatMonthParam,
  type PlannerTab,
} from "@/lib/week";

type Props = {
  tab: PlannerTab;
  year: number;
  month: number;
  weekIndex: number;
  /** Prefix for demo routes, e.g. `/demo`. */
  basePath?: string;
};

function hrefFor(
  tab: PlannerTab,
  year: number,
  month: number,
  weekIndex: number,
  basePath = "",
) {
  const q = new URLSearchParams({
    month: formatMonthParam(year, month),
    week: String(weekIndex),
  });
  if (tab === "aktivitas") q.set("tab", "aktivitas");
  return `${basePath}/planner?${q.toString()}`;
}

export function PlannerTabs({
  tab,
  year,
  month,
  weekIndex,
  basePath = "",
}: Props) {
  const items: { id: PlannerTab; label: string }[] = [
    { id: "konten", label: "Konten" },
    { id: "aktivitas", label: "Aktivitas" },
  ];

  return (
    <nav
      aria-label="Tab planner"
      className="mt-4 flex gap-1 rounded-xl border border-border bg-surface p-1"
    >
      {items.map((item) => {
        const active = tab === item.id;
        return (
          <Link
            key={item.id}
            href={hrefFor(item.id, year, month, weekIndex, basePath)}
            className={`min-touch flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors ${
              active
                ? "bg-coral/10 text-coral hover:bg-coral/15"
                : "text-ink-muted hover:bg-coral/5 hover:text-ink"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
