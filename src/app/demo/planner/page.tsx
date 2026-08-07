import Link from "next/link";
import { ReadOnlyPlannerBoard } from "@/components/planner-board";
import { DEMO_ITEMS, demoWeekLabel } from "@/lib/demo-planner";

export default function DemoPlannerPage() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3">
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

      <section className="mt-8 rounded-2xl border border-border bg-surface p-4 md:p-5">
        <h2 className="text-lg font-semibold text-ink">Buat ide sendiri</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Tambah ide di hari kosong tanpa memilih tren.
        </p>

        <div className="mt-4 flex flex-col gap-3 opacity-70">
          <label className="block">
            <span className="text-sm font-medium text-ink">Judul</span>
            <input
              value="Bookstore date aesthetic"
              disabled
              readOnly
              className="min-touch mt-1 w-full rounded-xl border border-border bg-paper px-3 text-sm text-ink"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Hook</span>
            <textarea
              value="Take them to a bookstore and do this…"
              disabled
              readOnly
              rows={2}
              className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
          </label>
          <button
            type="button"
            disabled
            className="min-touch inline-flex w-fit items-center justify-center rounded-xl bg-coral px-5 text-sm font-semibold text-white opacity-60"
          >
            Simpan ide
          </button>
        </div>

        <p className="mt-4 text-sm text-ink-muted">
          Buat ide sendiri tersedia setelah daftar.
        </p>
        <Link
          href="/register"
          target="_top"
          className="mt-3 inline-flex min-touch items-center justify-center rounded-xl border border-border bg-paper px-4 py-2 text-sm font-semibold text-ink"
        >
          Daftar
        </Link>
      </section>
    </main>
  );
}
