import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TrenFeed } from "@/features/planner/components/tren-feed";
import { getRecommendations } from "@/features/planner/lib/planner";
import { prisma } from "@/lib/prisma";
import { resolveNiche } from "@/lib/niches";

export default async function TrenPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { niche: true },
  });
  const userNiche = resolveNiche(user?.niche);

  const trends = await getRecommendations(null, 48);

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
          Tren
        </h1>
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-ink-muted">
          Mock FYP
        </span>
      </div>

      <TrenFeed
        defaultNiche={userNiche}
        trends={trends.map((t) => ({
          id: t.id,
          title: t.title,
          hook: t.hook,
          format: t.format,
          score: t.score,
          niche: t.niche,
        }))}
      />
    </main>
  );
}
