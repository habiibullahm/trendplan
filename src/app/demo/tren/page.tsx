import Link from "next/link";
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
        Tren TikTok mock untuk niche Couple Date Ideas.
      </p>

      <Stagger as="ul" className="mt-6 space-y-3">
        {DEMO_TRENDS.map((trend) => (
          <FadeIn
            key={trend.id}
            as="li"
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{trend.title}</p>
                <p className="mt-1 text-sm italic text-ink-muted">{trend.hook}</p>
                <p className="mt-2 text-xs text-ink-muted">
                  {FORMAT_LABEL[trend.format]} · skor {trend.score}
                </p>
              </div>
              <Link
                href={`/demo/rekomendasi#${trend.id}`}
                className="min-touch shrink-0 text-sm font-semibold text-coral transition-colors hover:text-ink"
              >
                Pakai ide
              </Link>
            </div>
            <p className="mt-3 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-ink-muted">
              Tambah ke planner tersedia setelah daftar.
            </p>
          </FadeIn>
        ))}
      </Stagger>
    </main>
  );
}
