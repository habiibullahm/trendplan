import { redirect } from "next/navigation";
import { TrenFeed } from "@/features/planner/components/tren-feed";
import { getRecommendations } from "@/features/planner/lib/planner";
import { getSafeSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { resolveNiche } from "@/lib/niches";

export default async function TrenPage() {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");

  const [user, trends] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { niche: true },
    }),
    getRecommendations(null, 48),
  ]);
  const userNiche = resolveNiche(user?.niche);

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="sr-only">Tren</h1>
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
    </main>
  );
}
