import Link from "next/link";
import { FadeIn, ProgressBar, Stagger } from "@/components/motion";
import { STATUS_LABEL } from "@/lib/labels";
import {
  DEMO_ITEMS,
  DEMO_NICHE,
  DEMO_TRENDS,
  DEMO_USER_NAME,
  DEMO_WEEKLY_GOAL,
  demoWeekLabel,
} from "@/lib/demo-planner";

export default function DemoDashboardPage() {
  const scheduled = DEMO_ITEMS.length;
  const goal = DEMO_WEEKLY_GOAL;
  const progress = Math.min(100, Math.round((scheduled / goal) * 100));
  const topRecs = DEMO_TRENDS.slice(0, 3);

  return (
    <main className="flex w-full flex-1 flex-col">
      <p className="text-sm text-ink-muted">Halo, {DEMO_USER_NAME}</p>
      <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
        Beranda
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Minggu {demoWeekLabel()} · Niche {DEMO_NICHE}
      </p>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm text-ink-muted">Progress minggu ini</p>
        <p className="mt-1 text-lg font-semibold text-ink">
          {scheduled} dari {goal} terjadwal
        </p>
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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/demo/planner"
          className="min-touch inline-flex items-center justify-center rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
        >
          Lanjut ke Planner
        </Link>
        <Link
          href="/demo/tren"
          className="min-touch inline-flex items-center justify-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper active:scale-[0.98]"
        >
          Lihat tren minggu ini
        </Link>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Rekomendasi top</h2>
          <Link
            href="/demo/rekomendasi"
            className="text-sm font-semibold text-coral"
          >
            Lihat semua
          </Link>
        </div>
        <Stagger as="ul" className="mt-3 space-y-2">
          {topRecs.map((trend, index) => (
            <FadeIn
              key={trend.id}
              as="li"
              className="rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <p className="text-sm font-semibold text-ink">
                {index + 1}. {trend.title}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{trend.reason}</p>
            </FadeIn>
          ))}
        </Stagger>
      </section>
    </main>
  );
}
