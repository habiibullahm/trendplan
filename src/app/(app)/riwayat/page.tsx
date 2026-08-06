import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DAY_SHORT } from "@/lib/week";

export default async function RiwayatPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const items = await prisma.contentItem.findMany({
    where: {
      status: "POSTED",
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

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <Link href={`/planner/${item.id}`} className="block">
              <p className="font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {DAY_SHORT[item.dayOfWeek]} ·{" "}
                {item.performanceNote || "Belum ada catatan performa"}
              </p>
            </Link>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-ink-muted">
            Belum ada yang diposting. Ubah status konten di Planner menjadi{" "}
            <span className="font-semibold text-ink">Posted</span>.
          </li>
        ) : null}
      </ul>
    </main>
  );
}
