import Link from "next/link";
import { FadeIn, ProgressBar, Stagger } from "@/components/motion";
import { ButtonLink } from "@/components/ui/button-link";
import { STATUS_LABEL } from "@/lib/labels";
import {
  DEMO_ITEMS,
  DEMO_TRENDS,
  DEMO_USER_NAME,
  DEMO_WEEKLY_GOAL,
  demoWeekLabel,
} from "@/features/planner/lib/demo-planner";

export default function DemoDashboardPage() {
  const scheduled = DEMO_ITEMS.length;
  const goal = DEMO_WEEKLY_GOAL;
  const onTrack = scheduled >= goal;
  const progress = Math.min(100, Math.round((scheduled / goal) * 100));
  const topRecs = DEMO_TRENDS.slice(0, 2);

  return (
    <main className="flex w-full flex-1 flex-col">
      <div className="min-w-0">
        <p className="text-sm text-ink-muted">Halo, {DEMO_USER_NAME}</p>
        <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Perencana konten minggu ini
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {demoWeekLabel()}
        </p>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-4">
        <p className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {scheduled} / {goal}
        </p>
        <p className="mt-1 text-sm text-ink-muted">konten di planner</p>
        <ProgressBar value={progress} />
        <Stagger as="ul" className="mt-4 space-y-2">
          {DEMO_ITEMS.slice(0, 3).map((item) => (
            <FadeIn
              key={item.id}
              as="li"
              className="flex justify-between gap-2 text-sm"
            >
              <span className="truncate font-medium text-ink">{item.title}</span>
              <span className="shrink-0 text-ink-muted">
                {STATUS_LABEL[item.status]}
              </span>
            </FadeIn>
          ))}
        </Stagger>
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {onTrack ? (
          <ButtonLink href="/demo/planner">Buka Planner</ButtonLink>
        ) : (
          <>
            <ButtonLink href="/demo/tren">Lihat tren</ButtonLink>
            <Link
              href="/demo/planner"
              className="text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              Planner
            </Link>
          </>
        )}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Rekomendasi</h2>
          <Link
            href="/demo/rekomendasi"
            className="text-sm font-semibold text-coral"
          >
            Semua
          </Link>
        </div>
        <Stagger as="ul" className="mt-3 space-y-2">
          {topRecs.map((trend) => (
            <FadeIn
              key={trend.id}
              as="li"
              className="rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <p className="text-sm font-semibold text-ink">{trend.title}</p>
              <p className="mt-1 text-xs text-ink-muted">{trend.reason}</p>
              <Link
                href={`/demo/tren#${trend.id}`}
                className="mt-2 inline-block text-sm font-semibold text-coral transition-colors hover:text-ink"
              >
                Pakai di Tren
              </Link>
            </FadeIn>
          ))}
        </Stagger>
      </section>
    </main>
  );
}
