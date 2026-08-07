import Link from "next/link";
import { ReadOnlyPlannerBoard } from "@/components/planner-board";
import { DEMO_ITEMS, demoWeekLabel } from "@/lib/demo-planner";

export const metadata = {
  title: "Demo Planner · TrendPlan",
  description:
    "Preview baca saja — planner mingguan Couple Date Ideas tanpa login.",
  robots: { index: false, follow: true },
};

export default function DemoPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-4 md:px-6 md:py-6">
      <div className="rounded-2xl border border-border bg-surface px-4 py-3 md:px-5">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">Demo baca saja</span>
          {" — "}
          seret & edit butuh akun. Buka aplikasi lengkap untuk mencoba.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/register"
            target="_top"
            className="min-touch inline-flex items-center justify-center rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white"
          >
            Daftar
          </Link>
          <Link
            href="/"
            target="_top"
            className="min-touch inline-flex items-center justify-center rounded-xl border border-border bg-paper px-4 py-2 text-sm font-semibold text-ink"
          >
            Buka Live
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink md:text-3xl">
            Planner
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Minggu {demoWeekLabel()}
          </p>
        </div>
        <p className="text-sm font-medium text-ink">
          Target 5 · isi {DEMO_ITEMS.length}
        </p>
      </div>

      <ReadOnlyPlannerBoard items={DEMO_ITEMS} />
    </main>
  );
}
