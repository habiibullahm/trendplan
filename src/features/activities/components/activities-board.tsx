import Link from "next/link";
import { DAY_SHORT } from "@/lib/week";

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
) {
  const q = new URLSearchParams({ day: String(day) });
  if (weekStartParam) q.set("weekStart", weekStartParam);
  if (returnMonth) q.set("month", returnMonth);
  if (returnWeek != null) q.set("week", String(returnWeek));
  return `/planner/aktivitas/new?${q.toString()}`;
}

function activityHref(
  activityId: string,
  returnMonth?: string,
  returnWeek?: number,
) {
  const q = new URLSearchParams();
  if (returnMonth) q.set("month", returnMonth);
  if (returnWeek != null) q.set("week", String(returnWeek));
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
}: {
  item: ActivitiesBoardItem;
  index: number;
  readOnly: boolean;
  returnMonth?: string;
  returnWeek?: number;
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
        href={activityHref(item.id, returnMonth, returnWeek)}
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
  readOnly = false,
}: {
  items: ActivitiesBoardItem[];
  weekStartParam?: string;
  returnMonth?: string;
  returnWeek?: number;
  readOnly?: boolean;
}) {
  const byDay = groupByDay(items);

  return (
    <ul className="mt-4 flex flex-col gap-2">
      {DAY_SHORT.map((label, day) => {
        const dayItems = byDay.get(day) ?? [];
        return (
          <li
            key={day}
            className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
              <div className="flex min-w-0 items-baseline gap-2">
                <p className="text-xs font-semibold text-ink-muted">{label}</p>
                {dayItems.length > 0 ? (
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
                  )}
                  className="text-xs font-semibold text-coral transition-colors hover:text-coral/80"
                >
                  + Tambah
                </Link>
              ) : null}
            </div>

            {dayItems.length === 0 ? (
              readOnly ? (
                <p className="px-4 py-3 text-sm text-ink-muted">Kosong</p>
              ) : (
                <Link
                  href={newActivityHref(
                    day,
                    weekStartParam,
                    returnMonth,
                    returnWeek,
                  )}
                  className="min-touch block px-4 py-3 text-sm text-ink-muted transition-colors hover:bg-coral/5 hover:text-coral"
                >
                  + Tambah aktivitas
                </Link>
              )
            ) : (
              <ul className="divide-y divide-border" aria-label={`Aktivitas ${label}`}>
                {dayItems.map((item, index) => (
                  <ActivityRow
                    key={item.id}
                    item={item}
                    index={index}
                    readOnly={readOnly}
                    returnMonth={returnMonth}
                    returnWeek={returnWeek}
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
