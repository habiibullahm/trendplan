import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSafeSession } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  BerandaProgressSection,
  BerandaProgressSkeleton,
} from "@/features/dashboard/components/beranda-progress";
import {
  BerandaRecsSection,
  BerandaRecsSkeleton,
} from "@/features/dashboard/components/beranda-recs";
import { getBerandaUser } from "@/features/dashboard/fetchers/user";
import { resolveNiche } from "@/lib/niches";

export default async function DashboardPage() {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const user = await getBerandaUser(userId);
  const displayName = user?.name ?? session.user.name ?? "creator";
  const nicheLabel = resolveNiche(user?.niche);

  return (
    <main className="flex w-full flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Halo, {displayName}
          </h1>
        </div>
        <ThemeToggle />
      </div>

      <Suspense fallback={<BerandaProgressSkeleton />}>
        <BerandaProgressSection
          userId={userId}
          goal={user?.weeklyGoal ?? 3}
          nicheLabel={nicheLabel}
        />
      </Suspense>

      <Suspense fallback={<BerandaRecsSkeleton />}>
        <BerandaRecsSection niche={user?.niche ?? null} />
      </Suspense>
    </main>
  );
}
