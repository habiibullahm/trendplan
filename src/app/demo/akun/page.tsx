import Link from "next/link";
import { UpdateLog } from "@/features/auth/components/update-log";

export default function DemoAkunPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <h1 className="sr-only">Akun</h1>

      <div className="mt-0 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-paper text-base font-bold text-ink"
            aria-hidden
          >
            D
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              Demo creator
            </p>
            <p className="truncate text-sm text-ink-muted">demo@trendplan.app</p>
          </div>
        </div>
        <p className="text-xs text-ink-muted">
          Ketuk foto/inisial untuk unggah; ubah atau hapus tersedia di app live.
        </p>
      </div>

      <hr className="mt-6 border-border" />

      <section className="mt-2">
        <p className="text-sm font-semibold text-ink">Preferensi konten</p>
        <div className="mt-1 divide-y divide-border">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-sm text-ink-muted">Niche</span>
            <span className="text-sm font-semibold text-ink">
              Couple Date Ideas
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-sm text-ink-muted">Target / minggu</span>
            <span className="text-sm font-semibold text-ink">3 ide</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Ubah target & foto profil tersedia setelah daftar / masuk.
        </p>
      </section>

      <hr className="mt-4 border-border" />

      <section className="mt-4 space-y-3">
        <p className="text-sm font-semibold text-ink">Pintasan</p>
        <Link
          href="/demo/riwayat"
          className="min-touch flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
        >
          <span>
            <span className="block text-sm font-semibold text-ink">Riwayat</span>
            <span className="text-xs text-ink-muted">Konten yang sudah Posted</span>
          </span>
          <span className="text-ink-muted">→</span>
        </Link>
        <Link
          href="/demo/rekomendasi"
          className="min-touch flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
        >
          <span>
            <span className="block text-sm font-semibold text-ink">
              Rekomendasi
            </span>
            <span className="text-xs text-ink-muted">Ide dari tren</span>
          </span>
          <span className="text-ink-muted">→</span>
        </Link>
        <UpdateLog />
      </section>

      <p className="mt-6 min-touch flex w-full items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-4 text-sm font-semibold text-ink-muted">
        Keluar tersedia di aplikasi live
      </p>
    </main>
  );
}
