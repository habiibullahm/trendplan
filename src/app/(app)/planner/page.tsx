import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PlannerBoard } from "@/components/planner-board";
import { PlannerToastFromQuery } from "@/components/planner-toast";
import { getOrCreateWeekPlan } from "@/lib/planner";
import { formatWeekRange } from "@/lib/week";
import { prisma } from "@/lib/prisma";

export default async function PlannerPage() {
  const session = await auth();
  // Layout also redirects, but page can render in parallel — never use session!.
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyGoal: true },
  });
  const weekPlan = await getOrCreateWeekPlan(userId);
  const goal = user?.weeklyGoal ?? 3;

  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={null}>
        <PlannerToastFromQuery />
      </Suspense>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
            Planner
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Minggu {formatWeekRange(weekPlan.weekStart)}
          </p>
        </div>
        <p className="text-sm font-medium text-ink">
          Target {goal} · isi {weekPlan.items.length}
        </p>
      </div>

      <PlannerBoard
        items={weekPlan.items.map((item) => ({
          id: item.id,
          dayOfWeek: item.dayOfWeek,
          title: item.title,
          status: item.status,
        }))}
      />
    </main>
  );
}
