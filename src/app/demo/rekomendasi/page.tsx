import { FadeIn, Stagger } from "@/components/motion";
import { TrendIdeaCard } from "@/features/planner/components/trend-idea-card";
import { DEMO_TRENDS } from "@/features/planner/lib/demo-planner";

export default function DemoRekomendasiPage() {
  return (
    <main className="flex flex-1 flex-col">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
        Rekomendasi untukmu
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Ide yang cocok untuk niche Couple Date Ideas.
      </p>

      <Stagger as="ul" className="mt-6 space-y-3">
        {DEMO_TRENDS.map((trend, index) => (
          <FadeIn
            key={trend.id}
            as="li"
            id={trend.id}
            className="scroll-mt-24 rounded-2xl border border-border bg-surface p-4"
          >
            <TrendIdeaCard
              rank={index + 1}
              title={trend.title}
              hook={trend.hook}
              reason={trend.reason}
              format={trend.format}
              coverUrl={trend.coverUrl}
              actions={
                <p className="mt-3 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-ink-muted">
                  Tambah ke planner tersedia setelah daftar.
                </p>
              }
            />
          </FadeIn>
        ))}
      </Stagger>
    </main>
  );
}
