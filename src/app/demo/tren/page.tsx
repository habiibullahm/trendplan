import { TrenFeed } from "@/features/planner/components/tren-feed";
import { DEMO_NICHE, DEMO_TRENDS } from "@/features/planner/lib/demo-planner";

export default function DemoTrenPage() {
  return (
    <main className="flex flex-1 flex-col">
      <h1 className="sr-only">Tren</h1>
      <TrenFeed
        defaultNiche={DEMO_NICHE}
        trends={DEMO_TRENDS.map((t) => ({
          id: t.id,
          title: t.title,
          hook: t.hook,
          format: t.format,
          score: t.score,
          niche: t.niche ?? DEMO_NICHE,
          coverUrl: t.coverUrl,
          videoUrl: t.videoUrl,
          audioTitle: t.audioTitle,
          audioUrl: t.audioUrl,
        }))}
      />
    </main>
  );
}
