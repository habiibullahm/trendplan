import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FadeIn, Stagger } from "@/components/motion";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { DAY_SHORT } from "@/lib/week";

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
        Konten yang sudah ditandai Posted.
      </p>

      <Stagger as="ul" className="mt-6 space-y-3">
        {items.map((item) => (
          <FadeIn
            key={item.id}
            as="li"
            className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-coral/30"
          >
            <Link href={`/planner/${item.id}`} className="block">
              <p className="font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {DAY_SHORT[item.dayOfWeek]} ·{" "}
                {item.performanceNote || "Belum ada catatan performa"}
              </p>
            </Link>
          </FadeIn>
        ))}
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
