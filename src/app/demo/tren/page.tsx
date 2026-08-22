import { TrenFeed } from "@/features/planner/components/tren-feed";
import { DEMO_NICHE, DEMO_TRENDS } from "@/features/planner/lib/demo-planner";

export default function DemoTrenPage() {
  return (
    <main className="flex flex-1 flex-col">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Tren
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Katalog ide untuk diplan. Filter niche. Pakai ke hari setelah daftar.
      </p>
      <div className="mt-4">
        <TrenFeed
          readOnly
          defaultNiche={DEMO_NICHE}
          trends={DEMO_TRENDS.map((t) => ({
            id: t.id,
            title: t.title,
            hook: t.hook,
            reason: t.reason,
            format: t.format,
            niche: t.niche ?? DEMO_NICHE,
            coverUrl: t.coverUrl,
          }))}
        />
      </div>
    </main>
  );
}
