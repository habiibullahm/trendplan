import Link from "next/link";
import { FadeIn, Stagger } from "@/components/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CompactTrendMedia } from "@/features/planner/components/trend-media";
import { getRecommendations } from "@/features/planner/fetchers/recommendations";
import { resolveNiche } from "@/lib/niches";

export async function BerandaRecsSection({ niche }: { niche: string | null }) {
  const topRecs = await getRecommendations(resolveNiche(niche), 2);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 text-lg font-semibold text-ink">
          Rekomendasi untukmu
        </h2>
        <Link
          href="/rekomendasi"
          className="min-touch inline-flex shrink-0 items-center text-sm font-semibold text-coral transition-colors hover:underline"
        >
          Semua
        </Link>
      </div>
      <Stagger as="ul" className="mt-3 space-y-2">
        {topRecs.map((trend) => (
          <FadeIn key={trend.id} as="li">
            <div className="rounded-2xl border border-border bg-surface px-4 py-3">
              <CompactTrendMedia
                title={trend.title}
                titleHref={`/tren#${trend.id}`}
                media={{
                  coverUrl: trend.coverUrl,
                  audioTitle: trend.audioTitle,
                  audioUrl: trend.audioUrl,
                }}
              />
            </div>
          </FadeIn>
        ))}
        {topRecs.length === 0 ? (
          <EmptyState as="li">
            <p className="font-medium text-ink">Belum ada rekomendasi</p>
            <p className="mt-1">
              Data masih kosong. Cek{" "}
              <Link
                href="/tren"
                className="font-semibold text-coral transition-colors hover:underline"
              >
                Tren
              </Link>{" "}
              atau ubah niche di Akun.
            </p>
          </EmptyState>
        ) : null}
      </Stagger>
    </section>
  );
}

export function BerandaRecsSkeleton() {
  return (
    <section className="mt-8" aria-hidden>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-44 max-w-[70%]" />
        <Skeleton className="h-4 w-12 shrink-0" />
      </div>
      <div className="mt-3 space-y-2">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </section>
  );
}
