import Link from "next/link";
import { redirect } from "next/navigation";
import { getSafeSession } from "@/lib/auth/session";
import { FadeIn, Stagger } from "@/components/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CompactTrendMedia } from "@/features/planner/components/trend-media";
import { WeekTargetCard } from "@/features/planner/components/week-target-card";
import { prisma } from "@/lib/prisma";
import {
  getRecommendations,
} from "@/features/planner/lib/planner";
import { getWeekPlanForViewer } from "@/features/planner/lib/week-share";
import { listInProgressContentItems } from "@/features/planner/lib/in-progress-items";
import { formatWeekRange } from "@/lib/week";
import { STATUS_LABEL } from "@/lib/labels";
import { resolveNiche } from "@/lib/niches";

export default async function DashboardPage() {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyGoal: true, niche: true, name: true },
  });
  const niche = resolveNiche(user?.niche);
  const [weekPlan, topRecs] = await Promise.all([
    getWeekPlanForViewer(userId),
    getRecommendations(niche, 2),
  ]);

  const scheduled = weekPlan.items.length;
  const goal = user?.weeklyGoal ?? 3;
  const progress = Math.min(100, Math.round((scheduled / goal) * 100));
  const inProgressItems = listInProgressContentItems(weekPlan.items);

  return (
    <main className="flex w-full flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Halo, {user?.name ?? session?.user?.name ?? "creator"}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {formatWeekRange(weekPlan.weekStart)}
            <span aria-hidden> · </span>
            <span className="text-ink-muted">{niche}</span>
          </p>
        </div>
        <ThemeToggle />
      </div>

      <WeekTargetCard scheduled={scheduled} goal={goal} progress={progress} />

      {inProgressItems.length > 0 ? (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 text-lg font-semibold text-ink">
              Konten dalam proses ({inProgressItems.length})
            </h2>
            <Link
              href="/planner"
              className="min-touch inline-flex shrink-0 items-center text-sm font-semibold text-coral transition-colors hover:underline"
            >
              Buka Plan
            </Link>
          </div>
          <Stagger
            as="ul"
            className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface"
          >
            {inProgressItems.map((item) => (
              <FadeIn key={item.id} as="li">
                <Link
                  href={`/planner/${item.id}`}
                  className="min-touch flex items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-coral/5"
                >
                  <span className="truncate text-sm font-medium text-ink">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {STATUS_LABEL[item.status]}
                  </span>
                </Link>
              </FadeIn>
            ))}
          </Stagger>
        </section>
      ) : null}

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
                <Link href="/tren" className="font-semibold text-coral transition-colors hover:underline">
                  Tren
                </Link>{" "}
                atau ubah niche di Akun.
              </p>
            </EmptyState>
          ) : null}
        </Stagger>
      </section>
    </main>
  );
}
