import { Skeleton } from "@/components/ui/skeleton";
import {
  AkunProfileSkeleton,
  ChipRowSkeleton,
  MediaCardListSkeleton,
  MediaCardSkeleton,
  PageHeaderSkeleton,
  PageLoading,
  PlannerBoardSkeleton,
  RowListSkeleton,
  ShortcutCardSkeleton,
  WeekTargetSkeleton,
} from "@/components/loading";

type ShellProps = {
  as?: "main" | "div";
};

export function DashboardPageLoading({ as }: ShellProps = {}) {
  return (
    <PageLoading label="Memuat beranda…" as={as}>
      <PageHeaderSkeleton />
      <WeekTargetSkeleton />
      <section className="mt-8" aria-hidden>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-48 max-w-[70%]" />
          <Skeleton className="h-4 w-12 shrink-0" />
        </div>
        <RowListSkeleton className="mt-3" count={2} />
      </section>
      <section className="mt-8" aria-hidden>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-40 max-w-[70%]" />
          <Skeleton className="h-4 w-12 shrink-0" />
        </div>
        <ul className="mt-3 space-y-2">
          <li>
            <MediaCardSkeleton dense />
          </li>
          <li>
            <MediaCardSkeleton dense />
          </li>
        </ul>
      </section>
    </PageLoading>
  );
}

export function PlannerPageLoading({ as }: ShellProps = {}) {
  return (
    <PageLoading label="Memuat planner…" as={as}>
      <div className="flex flex-wrap items-center justify-between gap-3" aria-hidden>
        <Skeleton className="h-4 w-48 max-w-full" />
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3" aria-hidden>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-10 rounded-xl" />
        </div>
        <ChipRowSkeleton count={5} className="-mx-1 px-1" />
      </div>
      <PlannerBoardSkeleton />
    </PageLoading>
  );
}

export function TrenPageLoading({ as }: ShellProps = {}) {
  return (
    <PageLoading label="Memuat tren…" as={as}>
      <ChipRowSkeleton count={6} />
      <MediaCardListSkeleton className="mt-6 space-y-4" count={4} />
    </PageLoading>
  );
}

export function RekomendasiPageLoading({ as }: ShellProps = {}) {
  return (
    <PageLoading label="Memuat rekomendasi…" as={as}>
      <PageHeaderSkeleton withBadge />
      <MediaCardListSkeleton className="mt-6" count={4} />
    </PageLoading>
  );
}

export function RiwayatPageLoading({ as }: ShellProps = {}) {
  return (
    <PageLoading label="Memuat riwayat…" as={as}>
      <div aria-hidden>
        <Skeleton className="h-8 w-36 rounded-lg sm:h-9" />
        <Skeleton className="mt-2 h-3.5 w-64 max-w-full" />
      </div>
      <ul className="mt-6 space-y-3" aria-hidden>
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i}>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-4 w-40 max-w-[70%]" />
                <Skeleton className="h-5 w-14 shrink-0 rounded-lg" />
              </div>
              <Skeleton className="mt-2 h-3.5 w-32" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-4/5 max-w-full" />
            </div>
          </li>
        ))}
      </ul>
    </PageLoading>
  );
}

export function AkunPageLoading({ as }: ShellProps = {}) {
  return (
    <PageLoading label="Memuat akun…" className="mx-auto max-w-lg" as={as}>
      <AkunProfileSkeleton />

      <hr className="mt-6 border-border" />

      <section className="mt-2" aria-hidden>
        <Skeleton className="h-4 w-36" />
        <div className="mt-1 divide-y divide-border">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <Skeleton className="h-3.5 w-14" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="flex items-center justify-between gap-3 py-2.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        </div>
      </section>

      <hr className="mt-2 border-border" />

      <section className="mt-2" aria-hidden>
        <Skeleton className="h-4 w-24" />
        <div className="mt-1 divide-y divide-border">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-12" />
          </div>
        </div>
      </section>

      <hr className="mt-6 border-border" />

      <section className="mt-4 space-y-3" aria-hidden>
        <Skeleton className="h-4 w-20" />
        <ShortcutCardSkeleton />
        <ShortcutCardSkeleton />
      </section>

      <Skeleton className="mt-6 min-touch w-full rounded-2xl" />
    </PageLoading>
  );
}

/** Edit / buat aktivitas — form shell (not the Plan board). */
export function ActivityEditPageLoading({ as }: ShellProps = {}) {
  return (
    <PageLoading
      label="Memuat aktivitas…"
      className="mx-auto max-w-lg"
      as={as}
    >
      <div aria-hidden>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-8 w-48 max-w-full rounded-lg sm:h-9" />
        <Skeleton className="mt-2 h-3.5 w-56 max-w-full" />
      </div>

      <div className="mt-6 flex flex-col gap-4" aria-hidden>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-11 w-24 rounded-xl" />
          <Skeleton className="h-11 w-20 rounded-xl" />
        </div>
      </div>
    </PageLoading>
  );
}
