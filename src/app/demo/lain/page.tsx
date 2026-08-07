import Link from "next/link";

export default function DemoLainPage() {
  return (
    <main className="flex w-full max-w-lg flex-1 flex-col">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
        Lainnya
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Pengaturan cepat akun dan riwayat posting.
      </p>

      <div className="mt-6 space-y-3">
        <Link
          href="/demo/riwayat"
          className="min-touch flex items-center justify-between rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-ink"
        >
          <span>Riwayat</span>
          <span className="text-ink-muted">→</span>
        </Link>
        <Link
          href="/demo/rekomendasi"
          className="min-touch flex items-center justify-between rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-ink"
        >
          <span>Rekomendasi</span>
          <span className="text-ink-muted">→</span>
        </Link>

        <p className="min-touch flex w-full items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-4 text-sm font-semibold text-ink-muted">
          Keluar tersedia di aplikasi live
        </p>
      </div>
    </main>
  );
}
