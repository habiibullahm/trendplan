import Link from "next/link";
import { FadeIn, Stagger } from "@/components/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { WeekTargetSkeleton } from "@/components/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekTargetCard } from "@/features/planner/components/week-target-card";
import { getBerandaUser } from "@/features/dashboard/fetchers/user";
import { getWeekPlanForBeranda } from "@/features/planner/fetchers/week-plan";
import { listInProgressContentItems } from "@/features/planner/lib/in-progress-items";
import { resolveNiche } from "@/lib/niches";
import { formatWeekRange } from "@/lib/week";
import { STATUS_LABEL } from "@/lib/labels";

export async function BerandaProgressSection({ userId }: { userId: string }) {
  const [user, weekPlan] = await Promise.all([
    getBerandaUser(userId),
    getWeekPlanForBeranda(userId),
  ]);
  const goal = user?.weeklyGoal ?? 3;
  const nicheLabel = resolveNiche(user?.niche);
  const scheduled = weekPlan.items.length;
  const progress = Math.min(100, Math.round((scheduled / goal) * 100));
  const inProgressItems = listInProgressContentItems(weekPlan.items);

  return (
    <>
      <p className="mt-2 text-sm text-ink-muted">
        {formatWeekRange(weekPlan.weekStart)}
        <span aria-hidden> · </span>
        <span className="text-ink-muted">{nicheLabel}</span>
      </p>

      <WeekTargetCard scheduled={scheduled} goal={goal} progress={progress} />

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 text-lg font-semibold text-ink">
            {inProgressItems.length > 0
              ? `Konten dalam proses (${inProgressItems.length})`
              : "Konten dalam proses"}
          </h2>
          <Link
            href="/planner"
            className="min-touch inline-flex shrink-0 items-center text-sm font-semibold text-coral transition-colors hover:underline"
          >
            Buka Plan
          </Link>
        </div>
        {inProgressItems.length > 0 ? (
          <Stagger
            as="ul"
            className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface"
          >
            {inProgressItems.map((item) => (
              <FadeIn key={item.id} as="li">
                <Link
                  href={`/planner/${item.id}`}
                  className="min-touch flex items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-coral/5"
                >
                  <span className="truncate text-sm font-medium text-ink">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {STATUS_LABEL[item.status]}
                  </span>
                </Link>
              </FadeIn>
            ))}
          </Stagger>
        ) : scheduled > 0 ? (
          <EmptyState className="mt-3">
            <p className="font-medium text-ink">
              Semua ide minggu ini sudah Posted
            </p>
            <p className="mt-1">
              Lihat di{" "}
              <Link
                href="/riwayat"
                className="font-semibold text-coral transition-colors hover:underline"
              >
                Riwayat
              </Link>{" "}
              atau buka Plan untuk detail.
            </p>
          </EmptyState>
        ) : (
          <EmptyState className="mt-3">
            <p className="font-medium text-ink">Belum ada ide minggu ini</p>
            <p className="mt-1">
              Isi slot dari Tren atau buat ide sendiri di planner.
            </p>
          </EmptyState>
        )}
      </section>
    </>
  );
}

export function BerandaProgressSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="mt-2 h-4 w-56 max-w-full" />
      <WeekTargetSkeleton />
      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-48 max-w-[70%]" />
          <Skeleton className="h-4 w-12 shrink-0" />
        </div>
        <div className="mt-3 space-y-0 overflow-hidden rounded-2xl border border-border bg-surface">
          <Skeleton className="h-12 w-full rounded-none" />
          <Skeleton className="h-12 w-full rounded-none" />
        </div>
      </section>
    </div>
  );
}
