import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptySlotSaranTrigger } from "@/features/planner/components/empty-slot-saran";
import { STATUS_CLASS, STATUS_LABEL } from "@/lib/labels";
import { DAY_SHORT, dayBoardLabelFromParam, type PlannerView } from "@/lib/week";
import type { ContentStatus } from "@/generated/prisma/client";

export type PlannerBoardItem = {
  id: string;
  dayOfWeek: number;
  title: string;
  status: ContentStatus;
};

export type LayoutKind = "list" | "grid";

export function newPlanHref(
  day: number,
  weekStartParam?: string,
  returnMonth?: string,
  returnWeek?: number,
  view?: PlannerView,
) {
  const q = new URLSearchParams({ day: String(day) });
  if (weekStartParam) q.set("weekStart", weekStartParam);
  if (returnMonth) q.set("month", returnMonth);
  if (returnWeek != null) q.set("week", String(returnWeek));
  if (view === "shared") q.set("view", "shared");
  return `/planner/new?${q.toString()}`;
}

export function itemHref(
  itemId: string,
  returnMonth?: string,
  returnWeek?: number,
  view?: PlannerView,
) {
  const q = new URLSearchParams();
  if (returnMonth) q.set("month", returnMonth);
  if (returnWeek != null) q.set("week", String(returnWeek));
  if (view === "shared") q.set("view", "shared");
  const qs = q.toString();
  return qs ? `/planner/${itemId}?${qs}` : `/planner/${itemId}`;
}

export function buildByDay(items: PlannerBoardItem[]) {
  return new Map(items.map((item) => [item.dayOfWeek, item]));
}

/** Static SSR/first-paint board without DnD (avoids wrong layout flash). */
export function StaticBoard({
  items,
  readOnly = false,
  weekStartParam,
  returnMonth,
  returnWeek,
  view,
}: {
  items: PlannerBoardItem[];
  readOnly?: boolean;
  weekStartParam?: string;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
}) {
  const byDay = buildByDay(items);
  return (
    <ul className="mt-6 space-y-2">
      {DAY_SHORT.map((_, day) => {
        const label = dayBoardLabelFromParam(weekStartParam, day);
        const item = byDay.get(day);
        return (
          <li key={day} className="min-w-0">
            {item ? (
              readOnly ? (
                <div className="min-touch flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight text-ink-muted">
                      {label}
                    </p>
                    <p className="line-clamp-2 break-words text-sm font-semibold leading-snug text-ink">
                      {item.title}
                    </p>
                  </div>
                  <Badge className={`shrink-0 ${STATUS_CLASS[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                  </Badge>
                </div>
              ) : (
                <Link
                  href={itemHref(item.id, returnMonth, returnWeek, view)}
                  prefetch={false}
                  className="min-touch flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight text-ink-muted">
                      {label}
                    </p>
                    <p className="line-clamp-2 break-words text-sm font-semibold leading-snug text-ink">
                      {item.title}
                    </p>
                  </div>
                  <Badge className={`shrink-0 ${STATUS_CLASS[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                  </Badge>
                </Link>
              )
            ) : readOnly ? (
              <div className="min-touch flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-3">
                <p className="text-xs font-semibold leading-tight text-ink-muted">
                  {label}
                </p>
                <p className="text-sm text-ink-muted">Kosong</p>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-2xl border border-dashed border-border transition-colors hover:border-coral/50 hover:bg-coral/5">
                <Link
                  href={newPlanHref(
                    day,
                    weekStartParam,
                    returnMonth,
                    returnWeek,
                    view,
                  )}
                  className="min-touch flex min-w-0 flex-1 items-center gap-3 px-4 py-3"
                >
                  <p className="text-xs font-semibold leading-tight text-ink-muted">
                    {label}
                  </p>
                  <p className="text-sm text-ink-muted">+ Buat ide</p>
                </Link>
                <EmptySlotSaranTrigger day={day} className="shrink-0 pr-3" />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function PlannerHint({ showSaran = false }: { showSaran?: boolean }) {
  return (
    <p className="mt-4 text-sm text-ink-muted">
      Seret lewat ikon di kiri kartu untuk memindahkan atau menukar. Ketuk judul
      untuk membuka detail. Slot kosong?{" "}
      {showSaran ? (
        <>
          Pakai <span className="font-semibold text-ink">Saran ide</span>, atau
          ambil dari{" "}
        </>
      ) : (
        <>Ambil ide dari </>
      )}
      <Link
        href="/rekomendasi"
        className="font-semibold text-coral transition-colors hover:underline"
      >
        Rekomendasi
      </Link>{" "}
      atau{" "}
      <Link
        href="/tren"
        className="font-semibold text-coral transition-colors hover:underline"
      >
        Tren
      </Link>
      .
    </p>
  );
}
