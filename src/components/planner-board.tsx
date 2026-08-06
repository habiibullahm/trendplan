import Link from "next/link";
import type { ContentStatus } from "@/generated/prisma/client";
import { STATUS_CLASS, STATUS_LABEL } from "@/lib/labels";
import { DAY_SHORT } from "@/lib/week";

type Item = {
  id: string;
  dayOfWeek: number;
  title: string;
  status: ContentStatus;
};

export function PlannerBoard({ items }: { items: Item[] }) {
  const byDay = new Map(items.map((item) => [item.dayOfWeek, item]));

  return (
    <>
      {/* Mobile: vertical list */}
      <ul className="mt-6 space-y-2 md:hidden">
        {DAY_SHORT.map((label, day) => {
          const item = byDay.get(day);
          return (
            <li key={label}>
              {item ? (
                <Link
                  href={`/planner/${item.id}`}
                  className="min-touch flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink-muted">{label}</p>
                    <p className="truncate text-sm font-semibold text-ink">
                      {item.title}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_CLASS[item.status]}`}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/rekomendasi"
                  className="min-touch flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-3"
                >
                  <p className="text-xs font-semibold text-ink-muted">{label}</p>
                  <p className="text-sm text-ink-muted">+ Tambah ide</p>
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {/* Desktop: 7-column grid */}
      <div className="mt-6 hidden grid-cols-7 gap-2 md:grid">
        {DAY_SHORT.map((label, day) => {
          const item = byDay.get(day);
          return (
            <div
              key={label}
              className={`min-h-36 rounded-2xl border p-3 ${
                item
                  ? "border-border bg-surface"
                  : "border-dashed border-border bg-transparent"
              }`}
            >
              <p className="text-xs font-semibold text-ink-muted">{label}</p>
              {item ? (
                <Link href={`/planner/${item.id}`} className="mt-2 block">
                  <p className="text-sm font-semibold leading-snug text-ink">
                    {item.title}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[item.status]}`}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/rekomendasi"
                  className="mt-3 block text-sm text-ink-muted hover:text-coral"
                >
                  + Ide
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-ink-muted">
        Slot kosong? Ambil ide dari{" "}
        <Link href="/rekomendasi" className="font-semibold text-coral">
          Rekomendasi
        </Link>{" "}
        atau{" "}
        <Link href="/tren" className="font-semibold text-coral">
          Tren
        </Link>
        .
      </p>
    </>
  );
}
