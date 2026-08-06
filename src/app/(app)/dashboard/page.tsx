import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyGoal: true, niche: true, name: true },
  });

  const trendCount = await prisma.trend.count({
    where: { niche: "Couple Date Ideas" },
  });

  return (
    <main className="flex w-full max-w-lg flex-1 flex-col md:max-w-none">
      <p className="text-sm text-ink-muted">
        Halo, {user?.name ?? session?.user?.name ?? "creator"}
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
        Beranda
      </h1>
      <p className="mt-3 text-sm text-ink-muted">
        Target {user?.weeklyGoal ?? 3} konten / minggu. Tren mock siap dipakai di langkah
        berikutnya.
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm text-ink">
            Email: <span className="font-medium">{session?.user?.email}</span>
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Niche: {user?.niche ?? "Couple Date Ideas"} · TikTok
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-medium text-ink">Tren mock Couple Date Ideas</p>
          <p className="mt-1 text-sm text-ink-muted">
            {trendCount > 0
              ? `${trendCount} ide sudah di-seed (badge Mock).`
              : "Belum ada tren. Jalankan npm run db:seed."}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/tren"
          className="min-touch inline-flex items-center justify-center rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-white"
        >
          Lihat tren minggu ini
        </Link>
        <Link
          href="/planner"
          className="min-touch inline-flex items-center justify-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink"
        >
          Buka planner
        </Link>
      </div>
    </main>
  );
}
