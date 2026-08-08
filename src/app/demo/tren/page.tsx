import { FadeIn, Stagger } from "@/components/motion";
import { FORMAT_LABEL } from "@/lib/labels";
import { DEMO_TRENDS } from "@/features/planner/lib/demo-planner";

export default function DemoTrenPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
          Tren
        </h1>
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-ink-muted">
          Mock
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        Pilih tren, lalu tambah ke Planner — tersedia setelah daftar.
      </p>

      <Stagger as="ul" className="mt-6 space-y-3">
        {DEMO_TRENDS.map((trend) => (
          <FadeIn
            key={trend.id}
            as="li"
            id={trend.id}
            className="scroll-mt-24 rounded-2xl border border-border bg-surface p-4"
          >
            <p className="font-semibold text-ink">{trend.title}</p>
            <p className="mt-1 text-sm italic text-ink-muted">{trend.hook}</p>
            <p className="mt-2 text-xs text-ink-muted">
              {FORMAT_LABEL[trend.format]} · skor {trend.score}
            </p>
            <p className="mt-3 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-ink-muted">
              Pakai ke Planner tersedia setelah daftar.
            </p>
          </FadeIn>
        ))}
      </Stagger>
    </main>
  );
}
