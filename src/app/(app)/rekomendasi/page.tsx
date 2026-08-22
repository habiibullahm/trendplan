import Link from "next/link";
import { redirect } from "next/navigation";
import { getSafeSession } from "@/lib/auth/session";
import { AddToPlannerForm } from "@/features/planner/components/add-to-planner-form";
import { TrendIdeaCard } from "@/features/planner/components/trend-idea-card";
import { FadeIn, Stagger } from "@/components/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { resolveNiche } from "@/lib/niches";
import { getRecommendations } from "@/features/planner/fetchers/recommendations";
import { getUserNiche } from "@/features/planner/fetchers/planner-user";

export default async function RekomendasiPage() {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserNiche(session.user.id);
  const niche = resolveNiche(user?.niche);
  const trends = await getRecommendations(niche, 12);

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
        Rekomendasi untukmu
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Personal untuk niche {niche}.{" "}
        <Link href="/tren" className="font-semibold text-coral">
          Lihat semua ide di Tren
        </Link>
      </p>

      <Stagger as="ul" className="mt-6 space-y-3">
        {trends.map((trend, index) => (
          <FadeIn
            key={trend.id}
            as="li"
            id={trend.id}
            className="scroll-mt-24 rounded-2xl border border-border bg-surface p-4"
          >
            <TrendIdeaCard
              rank={index + 1}
              title={trend.title}
              hook={trend.hook}
              reason={trend.reason}
              format={trend.format}
              coverUrl={trend.coverUrl}
              actions={<AddToPlannerForm trendId={trend.id} />}
            />
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
