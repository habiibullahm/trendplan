"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type MouseEvent,
  type RefObject,
} from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { moveContentItemAction } from "@/app/actions/planner";
import { usePlannerLayout } from "@/components/motion";
import { dragId, dropId, parseDropDay } from "@/lib/planner-dnd";
import { STATUS_CLASS, STATUS_LABEL } from "@/lib/labels";
import { DAY_SHORT } from "@/lib/week";
import type { ContentStatus } from "@/generated/prisma/client";

export type PlannerBoardItem = {
  id: string;
  dayOfWeek: number;
  title: string;
  status: ContentStatus;
};

type LayoutKind = "list" | "grid";

const TOAST_ID = "planner-dnd";

const SkipClickContext = createContext<RefObject<boolean> | null>(null);

function buildByDay(items: PlannerBoardItem[]) {
  return new Map(items.map((item) => [item.dayOfWeek, item]));
}

function DaySlot({
  day,
  label,
  item,
  layout,
  pending,
}: {
  day: number;
  label: string;
  item?: PlannerBoardItem;
  layout: LayoutKind;
  pending: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: dropId(layout, day),
    data: { day, layout },
    disabled: pending,
  });

  const overRing = isOver
    ? "ring-2 ring-coral/40 ring-offset-1 ring-offset-paper"
    : "";

  if (layout === "list") {
    return (
      <li ref={setNodeRef} className={`min-w-0 rounded-2xl ${overRing}`}>
        {item ? (
          <DraggableCard
            item={item}
            label={label}
            layout="list"
            pending={pending}
          />
        ) : (
          <Link
            href={`/planner/new?day=${day}`}
            className="min-touch flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-3 transition-colors hover:border-coral/50 hover:bg-coral/5"
          >
            <p className="text-xs font-semibold text-ink-muted">{label}</p>
            <p className="text-sm text-ink-muted">+ Buat ide</p>
          </Link>
        )}
      </li>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`min-h-36 min-w-0 overflow-hidden rounded-2xl border p-3 transition-colors ${
        item
          ? "border-border bg-surface"
          : "border-dashed border-border bg-transparent hover:border-coral/50 hover:bg-coral/5"
      } ${overRing}`}
    >
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
      {item ? (
        <DraggableCard
          item={item}
          label={label}
          layout="grid"
          pending={pending}
        />
      ) : (
        <Link
          href={`/planner/new?day=${day}`}
          className="mt-3 block text-sm text-ink-muted transition-colors hover:text-coral"
        >
          + Buat ide
        </Link>
      )}
    </div>
  );
}

function DraggableCard({
  item,
  label,
  layout,
  pending,
}: {
  item: PlannerBoardItem;
  label: string;
  layout: LayoutKind;
  pending: boolean;
}) {
  const skipClickRef = useContext(SkipClickContext);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: dragId(layout, item.id),
      data: {
        itemId: item.id,
        dayOfWeek: item.dayOfWeek,
        layout,
      },
      disabled: pending,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const onDetailClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (skipClickRef?.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (layout === "list") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="min-touch min-w-0 cursor-grab touch-none overflow-hidden rounded-2xl border border-border bg-surface active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <Link
          href={`/planner/${item.id}`}
          className="flex items-center justify-between gap-3 px-4 py-3"
          onClick={onDetailClick}
          draggable={false}
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-muted">{label}</p>
            <p className="truncate text-sm font-semibold text-ink">
              {item.title}
            </p>
          </div>
          <span
            className={`max-w-full shrink-0 rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_CLASS[item.status]}`}
          >
            {STATUS_LABEL[item.status]}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mt-2 min-w-0 cursor-grab touch-none overflow-hidden active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      <Link
        href={`/planner/${item.id}`}
        className="block min-w-0"
        onClick={onDetailClick}
        draggable={false}
      >
        <p className="line-clamp-3 break-words text-sm font-semibold leading-snug text-ink">
          {item.title}
        </p>
        <span
          className={`mt-2 inline-flex max-w-full rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[item.status]}`}
        >
          {STATUS_LABEL[item.status]}
        </span>
      </Link>
    </div>
  );
}

function OverlayCard({ item }: { item: PlannerBoardItem }) {
  return (
    <div className="max-w-[200px] min-w-0 scale-[1.02] cursor-grabbing overflow-hidden rounded-2xl border border-coral/40 bg-surface p-3 ring-2 ring-coral/30">
      <p className="line-clamp-3 break-words text-sm font-semibold leading-snug text-ink">
        {item.title}
      </p>
      <span
        className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[item.status]}`}
      >
        {STATUS_LABEL[item.status]}
      </span>
    </div>
  );
}

function BoardLayout({
  layout,
  byDay,
  pending,
}: {
  layout: LayoutKind;
  byDay: Map<number, PlannerBoardItem>;
  pending: boolean;
}) {
  if (layout === "list") {
    return (
      <ul className="mt-6 space-y-2">
        {DAY_SHORT.map((label, day) => (
          <DaySlot
            key={`list-${label}`}
            day={day}
            label={label}
            item={byDay.get(day)}
            layout="list"
            pending={pending}
          />
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-7 gap-2">
      {DAY_SHORT.map((label, day) => (
        <DaySlot
          key={`grid-${label}`}
          day={day}
          label={label}
          item={byDay.get(day)}
          layout="grid"
          pending={pending}
        />
      ))}
    </div>
  );
}

/** Static SSR/first-paint board without DnD (avoids wrong layout flash). */
function StaticBoard({
  items,
  readOnly = false,
}: {
  items: PlannerBoardItem[];
  readOnly?: boolean;
}) {
  const byDay = buildByDay(items);
  return (
    <>
      <ul className="mt-6 space-y-2 md:hidden">
        {DAY_SHORT.map((label, day) => {
          const item = byDay.get(day);
          return (
            <li key={label} className="min-w-0">
              {item ? (
                readOnly ? (
                  <div className="min-touch flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink-muted">
                        {label}
                      </p>
                      <p className="truncate text-sm font-semibold text-ink">
                        {item.title}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_CLASS[item.status]}`}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                ) : (
                  <Link
                    href={`/planner/${item.id}`}
                    className="min-touch flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink-muted">
                        {label}
                      </p>
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
                )
              ) : readOnly ? (
                <div className="min-touch flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-3">
                  <p className="text-xs font-semibold text-ink-muted">{label}</p>
                  <p className="text-sm text-ink-muted">Kosong</p>
                </div>
              ) : (
                <Link
                  href={`/planner/new?day=${day}`}
                  className="min-touch flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-3"
                >
                  <p className="text-xs font-semibold text-ink-muted">{label}</p>
                  <p className="text-sm text-ink-muted">+ Buat ide</p>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-6 hidden grid-cols-7 gap-2 md:grid">
        {DAY_SHORT.map((label, day) => {
          const item = byDay.get(day);
          return (
            <div
              key={label}
              className={`min-h-36 min-w-0 overflow-hidden rounded-2xl border p-3 ${
                item
                  ? "border-border bg-surface"
                  : "border-dashed border-border"
              }`}
            >
              <p className="text-xs font-semibold text-ink-muted">{label}</p>
              {item ? (
                readOnly ? (
                  <div className="mt-2 block min-w-0">
                    <p className="line-clamp-3 break-words text-sm font-semibold leading-snug text-ink">
                      {item.title}
                    </p>
                    <span
                      className={`mt-2 inline-flex max-w-full rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[item.status]}`}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                ) : (
                  <Link href={`/planner/${item.id}`} className="mt-2 block min-w-0">
                    <p className="line-clamp-3 break-words text-sm font-semibold leading-snug text-ink">
                      {item.title}
                    </p>
                    <span
                      className={`mt-2 inline-flex max-w-full rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[item.status]}`}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </Link>
                )
              ) : readOnly ? (
                <p className="mt-3 text-sm text-ink-muted">Kosong</p>
              ) : (
                <Link
                  href={`/planner/new?day=${day}`}
                  className="mt-3 block text-sm text-ink-muted"
                >
                  + Buat ide
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function PlannerHint() {
  return (
    <p className="mt-4 text-sm text-ink-muted">
      Seret kartu ke hari lain untuk memindahkan atau menukar. Ketuk singkat
      untuk membuka detail. Slot kosong? Ambil ide dari{" "}
      <Link href="/rekomendasi" className="font-semibold text-coral">
        Rekomendasi
      </Link>{" "}
      atau{" "}
      <Link href="/tren" className="font-semibold text-coral">
        Tren
      </Link>
      .
    </p>
  );
}

function InteractiveBoard({
  items,
  layout,
}: {
  items: PlannerBoardItem[];
  layout: LayoutKind;
}) {
  const [localItems, setLocalItems] = useState(items);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const moveLock = useRef(false);
  const skipClickRef = useRef(false);
  const skipClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (skipClickTimer.current) clearTimeout(skipClickTimer.current);
    };
  }, []);

  const byDay = useMemo(() => buildByDay(localItems), [localItems]);
  const activeItem = activeItemId
    ? localItems.find((i) => i.id === activeItemId)
    : undefined;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  const armSkipClick = useCallback(() => {
    skipClickRef.current = true;
    if (skipClickTimer.current) clearTimeout(skipClickTimer.current);
    skipClickTimer.current = setTimeout(() => {
      skipClickRef.current = false;
      skipClickTimer.current = null;
    }, 80);
  }, []);

  const onDragStart = useCallback((event: DragStartEvent) => {
    const itemId = event.active.data.current?.itemId as string | undefined;
    setActiveItemId(itemId ?? null);
    skipClickRef.current = true;
    if (skipClickTimer.current) clearTimeout(skipClickTimer.current);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveItemId(null);
      armSkipClick();

      const { active, over } = event;
      if (!over || pending || moveLock.current) return;

      const toDay = parseDropDay(over.id, localItems);
      if (toDay === null) return;

      const itemId = (active.data.current?.itemId as string | undefined) ?? null;
      if (!itemId) return;

      const moving = localItems.find((i) => i.id === itemId);
      if (!moving || moving.dayOfWeek === toDay) return;

      const fromDay = moving.dayOfWeek;
      const occupant = localItems.find(
        (i) => i.dayOfWeek === toDay && i.id !== moving.id,
      );

      const previous = localItems;
      setLocalItems(
        localItems.map((i) => {
          if (i.id === moving.id) return { ...i, dayOfWeek: toDay };
          if (occupant && i.id === occupant.id) {
            return { ...i, dayOfWeek: fromDay };
          }
          return i;
        }),
      );

      moveLock.current = true;
      startTransition(async () => {
        try {
          const result = await moveContentItemAction(
            moving.id,
            toDay,
            fromDay,
          );
          if (result.error) {
            setLocalItems(previous);
            toast.error(result.error, { id: TOAST_ID });
            return;
          }
          if (result.success) {
            toast.success(result.success, { id: TOAST_ID });
          }
        } catch {
          setLocalItems(previous);
          toast.error("Gagal memindahkan ide. Coba lagi.", { id: TOAST_ID });
        } finally {
          moveLock.current = false;
        }
      });
    },
    [armSkipClick, localItems, pending],
  );

  return (
    <SkipClickContext.Provider value={skipClickRef}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setActiveItemId(null);
          armSkipClick();
        }}
      >
        <BoardLayout layout={layout} byDay={byDay} pending={pending} />
        <DragOverlay dropAnimation={null}>
          {activeItem ? <OverlayCard item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </SkipClickContext.Provider>
  );
}

export function PlannerBoard({ items }: { items: PlannerBoardItem[] }) {
  const layout = usePlannerLayout();
  const boardKey = items.map((i) => `${i.id}:${i.dayOfWeek}`).join("|");

  return (
    <>
      {layout ? (
        <InteractiveBoard
          key={`${layout}:${boardKey}`}
          items={items}
          layout={layout}
        />
      ) : (
        <StaticBoard items={items} />
      )}
      <PlannerHint />
    </>
  );
}

/** Public demo / embed: static week board with no auth links. */
export function ReadOnlyPlannerBoard({ items }: { items: PlannerBoardItem[] }) {
  return <StaticBoard items={items} readOnly />;
}
