import { FadeIn, Stagger } from "@/components/motion";
import { CompactTrendMedia } from "@/features/planner/components/trend-media";
import { FORMAT_LABEL } from "@/lib/labels";
import { DEMO_TRENDS } from "@/features/planner/lib/demo-planner";

export default function DemoRekomendasiPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
          Rekomendasi untukmu
        </h1>
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-ink-muted">
          Mock
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        Diurutkan dari skor tren × kecocokan niche Couple Date Ideas.
      </p>

      <Stagger as="ul" className="mt-6 space-y-3">
        {DEMO_TRENDS.map((trend, index) => (
          <FadeIn
            key={trend.id}
            as="li"
            id={trend.id}
            className="scroll-mt-24 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral">
                #{index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <CompactTrendMedia
                  title={trend.title}
                  media={{
                    coverUrl: trend.coverUrl,
                    audioTitle: trend.audioTitle,
                    audioUrl: trend.audioUrl,
                  }}
                />
                <p className="mt-2 text-sm text-ink">{trend.reason}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Format {FORMAT_LABEL[trend.format]} · skor {trend.score}
                </p>
                <p className="mt-3 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-ink-muted">
                  Tambah ke planner tersedia setelah daftar.
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </Stagger>
    </main>
  );
}
