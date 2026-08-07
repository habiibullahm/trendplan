import { ReadOnlyPlannerBoard } from "@/components/planner-board";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { ChipButton } from "@/components/ui/chip-button";
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
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium text-ink">
            Target 5 · isi {DEMO_ITEMS.length}
          </p>
          <ChipButton disabled>Salin minggu</ChipButton>
        </div>
      </div>

      <ReadOnlyPlannerBoard items={DEMO_ITEMS} />

      <section className="mt-8 rounded-2xl border border-border bg-surface p-4 md:p-5">
        <h2 className="text-lg font-semibold text-ink">
          Saran caption & hashtag
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Dari rekomendasi tren — siap disalin ke TikTok setelah daftar.
        </p>

        <div className="mt-4 space-y-3 opacity-80">
          <div>
            <p className="text-xs font-semibold text-ink-muted">Caption contoh</p>
            <p className="mt-1 whitespace-pre-line text-sm text-ink">
              {"Cheap date under 100k\n\n3 date ideas that feel expensive…"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-muted">Hashtag</p>
            <p className="mt-1 text-sm text-ink">
              #coupledate #dateideas #tiktok
            </p>
          </div>
          <ChipButton disabled className="bg-paper">
            Salin
          </ChipButton>
        </div>

        <p className="mt-4 text-sm text-ink-muted">
          Saran & salin tersedia setelah daftar.
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-surface p-4 md:p-5">
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
          <Button disabled>Simpan ide</Button>
        </div>

        <p className="mt-4 text-sm text-ink-muted">
          Buat ide sendiri tersedia setelah daftar.
        </p>
        <ButtonLink
          href="/register"
          target="_top"
          variant="secondary"
          size="sm"
          className="mt-3 bg-paper"
        >
          Daftar
        </ButtonLink>
      </section>
    </main>
  );
}
