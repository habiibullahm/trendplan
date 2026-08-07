export default function AkunLoading() {
  return (
    <main
      className="mx-auto flex w-full max-w-lg flex-1 flex-col"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Memuat akun…</span>

      <div className="h-9 w-24 animate-pulse rounded-lg bg-border/60" />

      <div className="mt-6 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-border/60" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-border/60" />
          <div className="h-3.5 w-44 max-w-full animate-pulse rounded bg-border/50" />
        </div>
      </div>

      <hr className="mt-6 border-border" />

      <section className="mt-2" aria-hidden>
        <div className="h-4 w-36 animate-pulse rounded bg-border/60" />
        <div className="mt-1 divide-y divide-border">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <div className="h-3.5 w-14 animate-pulse rounded bg-border/50" />
            <div className="h-3.5 w-20 animate-pulse rounded bg-border/60" />
          </div>
          <div className="flex items-center justify-between gap-3 py-2.5">
            <div className="h-3.5 w-24 animate-pulse rounded bg-border/50" />
            <div className="h-3.5 w-16 animate-pulse rounded bg-border/60" />
          </div>
        </div>
      </section>

      <hr className="mt-2 border-border" />

      <section className="mt-4 space-y-3" aria-hidden>
        <div className="h-4 w-20 animate-pulse rounded bg-border/60" />
        <div className="min-touch rounded-2xl border border-border bg-surface px-4 py-3">
          <div className="h-4 w-20 animate-pulse rounded bg-border/60" />
          <div className="mt-1.5 h-3 w-28 animate-pulse rounded bg-border/50" />
        </div>
        <div className="min-touch rounded-2xl border border-border bg-surface px-4 py-3">
          <div className="h-4 w-28 animate-pulse rounded bg-border/60" />
          <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-border/50" />
        </div>
      </section>

      <div
        className="mt-6 min-touch w-full animate-pulse rounded-2xl border border-border bg-border/40"
        aria-hidden
      />
    </main>
  );
}
