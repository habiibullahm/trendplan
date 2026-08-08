import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FadeIn, ProgressBar, Stagger } from "@/components/motion";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { ThemeToggle } from "@/features/auth/components/theme-toggle";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateWeekPlan,
  getRecommendations,
} from "@/features/planner/lib/planner";
import { formatWeekRange } from "@/lib/week";
import { STATUS_LABEL } from "@/lib/labels";
import { resolveNiche } from "@/lib/niches";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyGoal: true, niche: true, name: true },
  });

  const niche = resolveNiche(user?.niche);
  const weekPlan = await getOrCreateWeekPlan(userId);
  const scheduled = weekPlan.items.length;
  const goal = user?.weeklyGoal ?? 3;
  const remaining = Math.max(0, goal - scheduled);
  const onTrack = remaining === 0;
  const progress = Math.min(100, Math.round((scheduled / goal) * 100));
  const topRecs = await getRecommendations(niche, 2);

  return (
    <main className="flex w-full flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">
            Halo, {user?.name ?? session?.user?.name ?? "creator"}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Perencana konten minggu ini
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {formatWeekRange(weekPlan.weekStart)} · {niche}
          </p>
        </div>
        <ThemeToggle />
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-4">
        <p className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {scheduled} / {goal}
        </p>
        <p className="mt-1 text-sm text-ink-muted">konten di planner</p>
        <ProgressBar value={progress} />
        {weekPlan.items.length > 0 ? (
          <Stagger as="ul" className="mt-4 space-y-2">
            {weekPlan.items.slice(0, 3).map((item) => (
              <FadeIn
                key={item.id}
                as="li"
                className="flex justify-between gap-2 text-sm"
              >
                <Link
                  href={`/planner/${item.id}`}
                  className="truncate font-medium text-ink transition-colors hover:text-coral"
                >
                  {item.title}
                </Link>
                <span className="shrink-0 text-ink-muted">
                  {STATUS_LABEL[item.status]}
                </span>
              </FadeIn>
            ))}
          </Stagger>
        ) : null}
        {!onTrack ? (
          <p className="mt-3 text-xs text-ink-muted">sisa {remaining}</p>
        ) : null}
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {onTrack ? (
          <ButtonLink href="/planner">Buka Planner</ButtonLink>
        ) : (
          <>
            <ButtonLink href="/tren">Lihat tren</ButtonLink>
            <Link
              href="/planner"
              className="text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              Planner
            </Link>
          </>
        )}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-ink">
              Rekomendasi untukmu
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">{niche}</p>
          </div>
          <Link
            href="/rekomendasi"
            className="shrink-0 text-sm font-semibold text-coral"
          >
            Semua
          </Link>
        </div>
        <Stagger as="ul" className="mt-3 space-y-2">
          {topRecs.map((trend) => (
            <FadeIn
              key={trend.id}
              as="li"
              className="rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <p className="text-sm font-semibold text-ink">{trend.title}</p>
              <p className="mt-1 text-xs text-ink-muted">{trend.reason}</p>
              <Link
                href={`/tren#${trend.id}`}
                className="mt-2 inline-block text-sm font-semibold text-coral transition-colors hover:text-ink"
              >
                Pakai di Tren
              </Link>
            </FadeIn>
          ))}
          {topRecs.length === 0 ? (
            <EmptyState as="li" variant="plain">
              Belum ada rekomendasi untuk niche ini. Jalankan{" "}
              <code>npm run db:seed</code>.
            </EmptyState>
          ) : null}
        </Stagger>
      </section>
    </main>
  );
}
