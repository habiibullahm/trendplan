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
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { moveContentItemAction } from "@/features/planner/actions/content";
import { dragId, dropId, parseDropDay } from "@/features/planner/lib/planner-dnd";
import { Badge } from "@/components/ui/badge";
import { STATUS_CLASS, STATUS_LABEL } from "@/lib/labels";
import { DAY_SHORT, type PlannerView } from "@/lib/week";
import { cn } from "@/lib/cn";
import {
  buildByDay,
  itemHref,
  newPlanHref,
  type LayoutKind,
  type PlannerBoardItem,
} from "@/features/planner/components/planner-board-shared";
import { EmptySlotSaranTrigger } from "@/features/planner/components/empty-slot-saran";

const TOAST_ID = "planner-dnd";

const SkipClickContext = createContext<RefObject<boolean> | null>(null);

function DaySlot({
  day,
  label,
  item,
  layout,
  pending,
  weekStartParam,
  returnMonth,
  returnWeek,
  view,
}: {
  day: number;
  label: string;
  item?: PlannerBoardItem;
  layout: LayoutKind;
  pending: boolean;
  weekStartParam?: string;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: dropId(layout, day),
    data: { day, layout },
    disabled: pending || item?.status === "POSTED",
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
            returnMonth={returnMonth}
            returnWeek={returnWeek}
            view={view}
          />
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
              <p className="text-xs font-semibold text-ink-muted">{label}</p>
              <p className="text-sm text-ink-muted">+ Buat ide</p>
            </Link>
            <EmptySlotSaranTrigger
              day={day}
              className="shrink-0 pr-3"
              disabled={pending}
            />
          </div>
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
      <div className="flex items-center justify-between gap-1">
        <p className="min-w-0 text-xs font-semibold text-ink-muted">{label}</p>
        {item ? (
          <Badge
            size="sm"
            className={`max-w-[calc(100%-1.5rem)] shrink-0 truncate ${STATUS_CLASS[item.status]}`}
          >
            {STATUS_LABEL[item.status]}
          </Badge>
        ) : null}
      </div>
      {item ? (
        <DraggableCard
          item={item}
          label={label}
          layout="grid"
          pending={pending}
          returnMonth={returnMonth}
          returnWeek={returnWeek}
          view={view}
        />
      ) : (
        <div className="mt-3 flex flex-col items-start gap-1">
          <Link
            href={newPlanHref(
              day,
              weekStartParam,
              returnMonth,
              returnWeek,
              view,
            )}
            className="block text-sm text-ink-muted transition-colors hover:text-coral"
          >
            + Buat ide
          </Link>
          <EmptySlotSaranTrigger day={day} disabled={pending} />
        </div>
      )}
    </div>
  );
}

function DraggableCard({
  item,
  label,
  layout,
  pending,
  returnMonth,
  returnWeek,
  view,
}: {
  item: PlannerBoardItem;
  label: string;
  layout: LayoutKind;
  pending: boolean;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
}) {
  const skipClickRef = useContext(SkipClickContext);
  const posted = item.status === "POSTED";
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: dragId(layout, item.id),
      data: {
        itemId: item.id,
        dayOfWeek: item.dayOfWeek,
        layout,
      },
      disabled: pending || posted,
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

  const showHandle = !posted && !pending;
  const handle = showHandle ? (
    <button
      type="button"
      className={cn(
        "min-touch inline-flex w-8 shrink-0 touch-none cursor-grab items-center justify-center text-ink-muted transition-colors hover:text-ink active:cursor-grabbing",
        "rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40",
      )}
      aria-label="Pindahkan ide"
      {...listeners}
      {...attributes}
    >
      <GripVertical className="size-4" aria-hidden />
    </button>
  ) : null;

  if (layout === "list") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="min-touch flex min-w-0 items-stretch overflow-hidden rounded-2xl border border-border bg-surface"
      >
        {handle}
        <Link
          href={itemHref(item.id, returnMonth, returnWeek, view)}
          className={cn(
            "flex min-w-0 flex-1 items-center justify-between gap-3 py-3",
            handle ? "pr-4 pl-1" : "px-4",
          )}
          onClick={onDetailClick}
          draggable={false}
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-muted">{label}</p>
            <p className="truncate text-sm font-semibold text-ink">
              {item.title}
            </p>
          </div>
          <Badge className={`max-w-full shrink-0 ${STATUS_CLASS[item.status]}`}>
            {STATUS_LABEL[item.status]}
          </Badge>
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mt-2 flex min-w-0 items-start gap-0.5 overflow-hidden"
    >
      {handle}
      <Link
        href={itemHref(item.id, returnMonth, returnWeek, view)}
        className="min-w-0 flex-1 pt-0.5"
        onClick={onDetailClick}
        draggable={false}
      >
        <p className="line-clamp-3 break-words text-sm font-semibold leading-snug text-ink">
          {item.title}
        </p>
      </Link>
    </div>
  );
}

function OverlayCard({ item }: { item: PlannerBoardItem }) {
  return (
    <div className="max-w-[200px] min-w-0 scale-[1.02] cursor-grabbing overflow-hidden rounded-2xl border border-coral/40 bg-surface p-3 ring-2 ring-coral/30">
      <div className="flex items-center justify-between gap-1">
        <p className="text-xs font-semibold text-ink-muted">
          {DAY_SHORT[item.dayOfWeek]}
        </p>
        <Badge
          size="sm"
          className={`max-w-[calc(100%-1.5rem)] shrink-0 truncate ${STATUS_CLASS[item.status]}`}
        >
          {STATUS_LABEL[item.status]}
        </Badge>
      </div>
      <p className="mt-2 line-clamp-3 break-words text-sm font-semibold leading-snug text-ink">
        {item.title}
      </p>
    </div>
  );
}

function BoardLayout({
  layout,
  byDay,
  pending,
  weekStartParam,
  returnMonth,
  returnWeek,
  view,
}: {
  layout: LayoutKind;
  byDay: Map<number, PlannerBoardItem>;
  pending: boolean;
  weekStartParam?: string;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
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
            weekStartParam={weekStartParam}
            returnMonth={returnMonth}
            returnWeek={returnWeek}
            view={view}
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
          weekStartParam={weekStartParam}
          returnMonth={returnMonth}
          returnWeek={returnWeek}
          view={view}
        />
      ))}
    </div>
  );
}

/** DnD-enabled board — loaded after first paint via dynamic import. */
export function InteractiveBoard({
  items,
  layout,
  weekStartParam,
  returnMonth,
  returnWeek,
  view,
}: {
  items: PlannerBoardItem[];
  layout: LayoutKind;
  weekStartParam?: string;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
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
      if (moving.status === "POSTED") {
        toast.error("Konten Posted tidak bisa dipindahkan.", { id: TOAST_ID });
        return;
      }

      const fromDay = moving.dayOfWeek;
      const occupant = localItems.find(
        (i) => i.dayOfWeek === toDay && i.id !== moving.id,
      );
      if (occupant?.status === "POSTED") {
        toast.error("Slot Posted tidak bisa digeser. Pilih hari lain.", {
          id: TOAST_ID,
        });
        return;
      }

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
          if (result.status === "error") {
            setLocalItems(previous);
            toast.error(result.message ?? "Gagal memindahkan ide. Coba lagi.", {
              id: TOAST_ID,
            });
            return;
          }
          if (result.status === "success" && result.message) {
            toast.success(result.message, { id: TOAST_ID });
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
        <BoardLayout
          layout={layout}
          byDay={byDay}
          pending={pending}
          weekStartParam={weekStartParam}
          returnMonth={returnMonth}
          returnWeek={returnWeek}
          view={view}
        />
        <DragOverlay dropAnimation={null}>
          {activeItem ? <OverlayCard item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </SkipClickContext.Provider>
  );
}
