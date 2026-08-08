import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FadeIn, Stagger } from "@/components/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { RiwayatPostedCard } from "@/features/planner/components/riwayat-posted-card";
import { prisma } from "@/lib/prisma";
import { DAY_SHORT, formatWeekRange } from "@/lib/week";

export default async function RiwayatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const items = await prisma.contentItem.findMany({
    where: {
      status: "POSTED",
      deletedAt: null,
      dayOfWeek: { gte: 0 },
      weekPlan: { userId },
    },
    include: {
      weekPlan: { select: { weekStart: true } },
      trend: { select: { title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
        Riwayat
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Preview konten yang sudah Posted. Hanya baca (termasuk di Planner).
      </p>

      <Stagger as="ul" className="mt-6 space-y-3">
        {items.map((item) => {
          const day = DAY_SHORT[item.dayOfWeek] ?? "";
          const week = formatWeekRange(item.weekPlan.weekStart);
          return (
            <FadeIn key={item.id} as="li">
              <RiwayatPostedCard
                title={item.title}
                meta={`${day} · ${week}`}
                trendTitle={item.trend?.title}
                hook={item.hook}
                caption={item.caption}
                hashtags={item.hashtags}
              />
            </FadeIn>
          );
        })}
        {items.length === 0 ? (
          <EmptyState as="li">
            Belum ada yang diposting. Ubah status konten di Planner menjadi{" "}
            <span className="font-semibold text-ink">Posted</span>.
          </EmptyState>
        ) : null}
      </Stagger>
    </main>
  );
}
