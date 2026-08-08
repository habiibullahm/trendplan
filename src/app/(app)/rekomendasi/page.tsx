import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AddToPlannerForm } from "@/features/planner/components/add-to-planner-form";
import { FadeIn, Stagger } from "@/components/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { FORMAT_LABEL } from "@/lib/labels";
import { resolveNiche } from "@/lib/niches";
import { prisma } from "@/lib/prisma";
import { getRecommendations } from "@/features/planner/lib/planner";

export default async function RekomendasiPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { niche: true },
  });
  const niche = resolveNiche(user?.niche);
  const trends = await getRecommendations(niche, 12);

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
        Personal untuk niche {niche}.{" "}
        <Link href="/tren" className="font-semibold text-coral">
          Lihat FYP semua niche di Tren
        </Link>
      </p>

      <Stagger as="ul" className="mt-6 space-y-4">
        {trends.map((trend, index) => (
          <FadeIn
            key={trend.id}
            as="li"
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
          </FadeIn>
        ))}
        {trends.length === 0 ? (
          <EmptyState as="li" variant="plain">
            Belum ada rekomendasi untuk niche ini. Jalankan{" "}
            <code>npm run db:seed</code>.
          </EmptyState>
        ) : null}
      </Stagger>
    </main>
  );
}
