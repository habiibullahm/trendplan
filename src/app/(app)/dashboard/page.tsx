import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FadeIn, ProgressBar, Stagger } from "@/components/motion";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { getOrCreateWeekPlan, getRecommendations } from "@/features/planner/lib/planner";
import { formatWeekRange } from "@/lib/week";
import { STATUS_LABEL } from "@/lib/labels";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyGoal: true, niche: true, name: true },
  });

  const weekPlan = await getOrCreateWeekPlan(userId);
  const scheduled = weekPlan.items.length;
  const goal = user?.weeklyGoal ?? 3;
  const progress = Math.min(100, Math.round((scheduled / goal) * 100));
  const topRecs = await getRecommendations(3);

  return (
    <main className="flex w-full flex-1 flex-col">
      <p className="text-sm text-ink-muted">
        Halo, {user?.name ?? session?.user?.name ?? "creator"}
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
        Beranda
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Minggu {formatWeekRange(weekPlan.weekStart)} · Niche{" "}
        {user?.niche ?? "Couple Date Ideas"}
      </p>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm text-ink-muted">Progress minggu ini</p>
        <p className="mt-1 text-lg font-semibold text-ink">
          {scheduled} dari {goal} terjadwal
        </p>
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
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ButtonLink href="/planner">Lanjut ke Planner</ButtonLink>
        <ButtonLink href="/tren" variant="secondary">
          Lihat tren
        </ButtonLink>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Rekomendasi top</h2>
          <Link href="/rekomendasi" className="text-sm font-semibold text-coral">
            Lihat semua
          </Link>
        </div>
        <Stagger as="ul" className="mt-3 space-y-2">
          {topRecs.map((trend, index) => (
            <FadeIn
              key={trend.id}
              as="li"
              className="rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <p className="text-sm font-semibold text-ink">
                {index + 1}. {trend.title}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{trend.reason}</p>
            </FadeIn>
          ))}
          {topRecs.length === 0 ? (
            <EmptyState as="li" variant="plain">
              Belum ada tren. Jalankan <code>npm run db:seed</code>.
            </EmptyState>
          ) : null}
        </Stagger>
      </section>
    </main>
  );
}
