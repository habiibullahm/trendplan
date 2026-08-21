import { redirect } from "next/navigation";
import { TrenFeed } from "@/features/planner/components/tren-feed";
import { getRecommendations } from "@/features/planner/fetchers/recommendations";
import { getUserNiche } from "@/features/planner/fetchers/planner-user";
import { getSafeSession } from "@/lib/auth/session";
import { resolveNiche } from "@/lib/niches";

export default async function TrenPage() {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");

  const [user, trends] = await Promise.all([
    getUserNiche(session.user.id),
    getRecommendations(null, 48),
  ]);
  const userNiche = resolveNiche(user?.niche);

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Tren
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Ide yang lagi naik di niche-mu
      </p>
      <div className="mt-4">
        <TrenFeed
          defaultNiche={userNiche}
          trends={trends.map((t) => ({
            id: t.id,
            title: t.title,
            hook: t.hook,
            format: t.format,
            score: t.score,
            niche: t.niche,
            coverUrl: t.coverUrl,
            videoUrl: t.videoUrl,
            audioTitle: t.audioTitle,
            audioUrl: t.audioUrl,
          }))}
        />
      </div>
    </main>
  );
}
