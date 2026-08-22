import Link from "next/link";
import { FadeIn, Stagger } from "@/components/motion";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CompactTrendMedia } from "@/features/planner/components/trend-media";
import { WeekTargetCard } from "@/features/planner/components/week-target-card";
import { STATUS_LABEL } from "@/lib/labels";
import {
  DEMO_ITEMS,
  DEMO_NICHE,
  DEMO_TRENDS,
  DEMO_USER_NAME,
  DEMO_WEEKLY_GOAL,
  demoWeekLabel,
} from "@/features/planner/lib/demo-planner";
import { listInProgressContentItems } from "@/features/planner/lib/in-progress-items";

export default function DemoDashboardPage() {
  const scheduled = DEMO_ITEMS.length;
  const goal = DEMO_WEEKLY_GOAL;
  const progress = Math.min(100, Math.round((scheduled / goal) * 100));
  const topRecs = DEMO_TRENDS.slice(0, 2);
  const inProgressItems = listInProgressContentItems(DEMO_ITEMS);

  return (
    <main className="flex w-full flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Halo, {DEMO_USER_NAME}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {demoWeekLabel()}
            <span aria-hidden> · </span>
            <span className="text-ink-muted">{DEMO_NICHE}</span>
          </p>
        </div>
        <ThemeToggle />
      </div>

      <WeekTargetCard scheduled={scheduled} goal={goal} progress={progress} />

      {inProgressItems.length > 0 ? (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 text-lg font-semibold text-ink">
              Konten dalam proses ({inProgressItems.length})
            </h2>
            <Link
              href="/demo/planner"
              className="min-touch inline-flex shrink-0 items-center text-sm font-semibold text-coral transition-colors hover:underline"
            >
              Buka Plan
            </Link>
          </div>
          <Stagger
            as="ul"
            className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface"
          >
            {inProgressItems.map((item) => (
              <FadeIn key={item.id} as="li">
                <Link
                  href="/demo/planner"
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
        </section>
      ) : null}

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 text-lg font-semibold text-ink">
            Rekomendasi untukmu
          </h2>
            <Link
              href="/demo/rekomendasi"
              className="min-touch inline-flex shrink-0 items-center text-sm font-semibold text-coral transition-colors hover:underline"
            >
              Semua
            </Link>
        </div>
        <Stagger as="ul" className="mt-3 space-y-2">
          {topRecs.map((trend) => (
            <FadeIn key={trend.id} as="li">
              <div className="rounded-2xl border border-border bg-surface px-4 py-3">
                <CompactTrendMedia
                  title={trend.title}
                  titleHref={`/demo/tren#${trend.id}`}
                  media={{
                    coverUrl: trend.coverUrl,
                    audioTitle: trend.audioTitle,
                    audioUrl: trend.audioUrl,
                  }}
                />
              </div>
            </FadeIn>
          ))}
        </Stagger>
      </section>
    </main>
  );
}
