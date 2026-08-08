import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AddToPlannerForm } from "@/features/planner/components/add-to-planner-form";
import { CompactTrendMedia } from "@/features/planner/components/trend-media";
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

      <Stagger as="ul" className="mt-6 space-y-3">
        {trends.map((trend, index) => (
          <FadeIn
            key={trend.id}
            as="li"
            id={trend.id}
            className="scroll-mt-24 rounded-2xl bg-card p-4 ring-1 ring-border"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral">
                #{index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <CompactTrendMedia
                  title={trend.title}
                  media={{
                    coverUrl: trend.coverUrl,
                    audioTitle: trend.audioTitle,
                    audioUrl: trend.audioUrl,
                  }}
                />
                <p className="mt-2 text-sm text-ink">{trend.reason}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Format {FORMAT_LABEL[trend.format]} · skor {trend.score}
                </p>
                <AddToPlannerForm trendId={trend.id} />
              </div>
            </div>
          </FadeIn>
        ))}
        {trends.length === 0 ? (
          <EmptyState as="li">
            <p className="font-medium text-ink">Belum ada rekomendasi</p>
            <p className="mt-1">
              Belum ada ide untuk niche {niche}. Coba lihat{" "}
              <Link href="/tren" className="font-semibold text-coral">
                Tren
              </Link>{" "}
              semua niche, atau ubah niche di Akun.
            </p>
          </EmptyState>
        ) : null}
      </Stagger>
    </main>
  );
}
