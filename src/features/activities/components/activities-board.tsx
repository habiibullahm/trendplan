import Link from "next/link";
import { DAY_SHORT, dayBoardLabelFromParam, type PlannerView } from "@/lib/week";

export type ActivitiesBoardItem = {
  id: string;
  dayOfWeek: number;
  title: string;
};

function newActivityHref(
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
  return `/planner/aktivitas/new?${q.toString()}`;
}

function activityHref(
  activityId: string,
  returnMonth?: string,
  returnWeek?: number,
  view?: PlannerView,
) {
  const q = new URLSearchParams();
  if (returnMonth) q.set("month", returnMonth);
  if (returnWeek != null) q.set("week", String(returnWeek));
  if (view === "shared") q.set("view", "shared");
  const qs = q.toString();
  return qs
    ? `/planner/aktivitas/${activityId}?${qs}`
    : `/planner/aktivitas/${activityId}`;
}

function groupByDay(items: ActivitiesBoardItem[]) {
  const map = new Map<number, ActivitiesBoardItem[]>();
  for (let d = 0; d < 7; d++) map.set(d, []);
  for (const item of items) {
    const list = map.get(item.dayOfWeek);
    if (list) list.push(item);
  }
  return map;
}

function ActivityRow({
  item,
  index,
  readOnly,
  returnMonth,
  returnWeek,
  view,
}: {
  item: ActivitiesBoardItem;
  index: number;
  readOnly: boolean;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
}) {
  const content = (
    <>
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coral/10 text-[11px] font-semibold tabular-nums text-coral"
        aria-hidden
      >
        {index + 1}
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
        {item.title}
      </span>
    </>
  );

  if (readOnly) {
    return (
      <li className="flex items-start gap-3 px-4 py-3">{content}</li>
    );
  }

  return (
    <li>
      <Link
        href={activityHref(item.id, returnMonth, returnWeek, view)}
        prefetch={false}
        className="min-touch flex items-start gap-3 px-4 py-3 transition-colors hover:bg-coral/5"
      >
        {content}
      </Link>
    </li>
  );
}

export function ActivitiesBoard({
  items,
  weekStartParam,
  returnMonth,
  returnWeek,
  view,
  readOnly = false,
}: {
  items: ActivitiesBoardItem[];
  weekStartParam?: string;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
  readOnly?: boolean;
}) {
  const byDay = groupByDay(items);

  return (
    <ul className="mt-4 flex flex-col gap-2">
      {DAY_SHORT.map((_, day) => {
        const label = dayBoardLabelFromParam(weekStartParam, day);
        const dayItems = byDay.get(day) ?? [];
        const empty = dayItems.length === 0;
        return (
          <li
            key={day}
            className={`min-w-0 overflow-hidden rounded-2xl border ${
              empty
                ? "border-dashed border-border/70 bg-transparent"
                : "border-border bg-surface"
            }`}
          >
            <div
              className={`flex items-center justify-between gap-3 px-4 py-2 ${
                empty ? "" : "border-b border-border"
              }`}
            >
              <div className="flex min-w-0 items-baseline gap-2">
                <p
                  className={`text-xs font-semibold leading-tight ${
                    empty ? "text-ink-muted/70" : "text-ink-muted"
                  }`}
                >
                  {label}
                </p>
                {!empty ? (
                  <p className="text-[11px] text-ink-muted">
                    {dayItems.length} item
                  </p>
                ) : null}
              </div>
              {!readOnly ? (
                <Link
                  href={newActivityHref(
                    day,
                    weekStartParam,
                    returnMonth,
                    returnWeek,
                    view,
                  )}
                  className={`min-touch inline-flex items-center text-xs font-semibold transition-colors hover:text-coral/80 ${
                    empty ? "text-coral/80" : "text-coral"
                  }`}
                >
                  + Tambah
                </Link>
              ) : null}
            </div>

            {empty ? (
              <p className="px-4 pb-3 text-sm text-ink-muted/60">
                {readOnly ? "Kosong" : "Belum ada"}
              </p>
            ) : (
              <ul
                className="divide-y divide-border"
                aria-label={`Aktivitas ${label}`}
              >
                {dayItems.map((item, index) => (
                  <ActivityRow
                    key={item.id}
                    item={item}
                    index={index}
                    readOnly={readOnly}
                    returnMonth={returnMonth}
                    returnWeek={returnWeek}
                    view={view}
                  />
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ReadOnlyActivitiesBoard({
  items,
}: {
  items: ActivitiesBoardItem[];
}) {
  return <ActivitiesBoard items={items} readOnly />;
}
