import { FadeIn, Stagger } from "@/components/motion";
import { FORMAT_LABEL } from "@/lib/labels";
import { DEMO_TRENDS } from "@/features/planner/lib/demo-planner";

export default function DemoTrenPage() {
  return (
    <main className="flex flex-1 flex-col">
      <h1 className="sr-only">Tren</h1>
      <Stagger as="ul" className="space-y-3">
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
