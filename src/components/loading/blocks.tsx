import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type CountProps = {
  count?: number;
  className?: string;
};

export function PageHeaderSkeleton({
  className,
  withBadge,
}: {
  className?: string;
  withBadge?: boolean;
}) {
  return (
    <div className={cn(className)} aria-hidden>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-8 w-48 max-w-full rounded-lg sm:h-9 sm:w-64" />
          <Skeleton className="h-3.5 w-56 max-w-full" />
        </div>
        {withBadge ? (
          <Skeleton className="h-7 w-14 shrink-0 rounded-full" />
        ) : (
          <Skeleton className="size-9 shrink-0 rounded-xl" />
        )}
      </div>
    </div>
  );
}

export function RowListSkeleton({ count = 2, className }: CountProps) {
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface",
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <Skeleton className="h-3.5 w-36 max-w-[55%]" />
          <Skeleton className="h-3 w-14 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function MediaCardSkeleton({
  className,
  dense,
}: {
  className?: string;
  dense?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface",
        dense ? "px-4 py-3" : "p-4",
        className,
      )}
      aria-hidden
    >
      <div className="flex items-start gap-3">
        <Skeleton className="size-14 shrink-0 rounded-xl sm:size-16" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 max-w-full" />
          <Skeleton className="h-3 w-1/2 max-w-full" />
          {!dense ? <Skeleton className="mt-1 h-3 w-2/3 max-w-full" /> : null}
        </div>
      </div>
    </div>
  );
}

export function MediaCardListSkeleton({ count = 3, className }: CountProps) {
  return (
    <ul className={cn("space-y-3", className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <MediaCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

export function ChipRowSkeleton({ count = 5, className }: CountProps) {
  return (
    <div
      className={cn("tp-scroll-x flex gap-2 pb-1", className)}
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          className="h-9 shrink-0 rounded-full"
          style={{ width: `${4.5 + (i % 3) * 1.25}rem` }}
        />
      ))}
    </div>
  );
}

export function PlannerBoardSkeleton({ className }: { className?: string }) {
  return (
    <ul className={cn("mt-4 space-y-2", className)} aria-hidden>
      {Array.from({ length: 7 }, (_, i) => (
        <li key={i}>
          <div className="min-touch flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
            <Skeleton className="h-3.5 w-8 shrink-0" />
            <Skeleton className="h-3.5 min-w-0 flex-1" />
            <Skeleton className="h-5 w-16 shrink-0 rounded-lg" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AkunProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden>
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3.5 w-44 max-w-full" />
      </div>
    </div>
  );
}

export function WeekTargetSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("mt-6", className)} aria-hidden>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-baseline justify-between gap-3">
          <Skeleton className="h-4 w-44 max-w-[70%]" />
          <Skeleton className="h-3.5 w-10 shrink-0" />
        </div>
        <Skeleton className="mt-4 h-3.5 w-full rounded-sm" />
      </div>
    </section>
  );
}

export function ShortcutCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "min-touch rounded-2xl border border-border bg-surface px-4 py-3",
        className,
      )}
      aria-hidden
    >
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-1.5 h-3 w-28" />
    </div>
  );
}
