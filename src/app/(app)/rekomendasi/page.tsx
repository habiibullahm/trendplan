import { AddToPlannerForm } from "@/components/add-to-planner-form";
import { FORMAT_LABEL } from "@/lib/labels";
import { getRecommendations } from "@/lib/planner";

export default async function RekomendasiPage() {
  const trends = await getRecommendations(12);

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
          Rekomendasi
        </h1>
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-ink-muted">
          Mock
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        Diurutkan dari skor tren × kecocokan niche Couple Date Ideas.
      </p>

      <ul className="mt-6 space-y-4">
        {trends.map((trend, index) => (
          <li
            key={trend.id}
            id={trend.id}
            className="scroll-mt-24 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral">
                #{index + 1}
              </span>
              <p className="font-semibold text-ink">{trend.title}</p>
            </div>
            <p className="mt-2 text-sm italic text-ink-muted">{trend.hook}</p>
            <p className="mt-2 text-sm text-ink">{trend.reason}</p>
            <p className="mt-1 text-xs text-ink-muted">
              Format {FORMAT_LABEL[trend.format]} · skor {trend.score}
            </p>
            <AddToPlannerForm trendId={trend.id} />
          </li>
        ))}
        {trends.length === 0 ? (
          <li className="text-sm text-ink-muted">
            Belum ada rekomendasi. Jalankan <code>npm run db:seed</code>.
          </li>
        ) : null}
      </ul>
    </main>
  );
}
