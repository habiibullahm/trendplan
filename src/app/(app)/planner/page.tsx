import { auth } from "@/auth";
import { PlannerBoard } from "@/components/planner-board";
import { getOrCreateWeekPlan } from "@/lib/planner";
import { formatWeekRange } from "@/lib/week";
import { prisma } from "@/lib/prisma";

export default async function PlannerPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyGoal: true },
  });
  const weekPlan = await getOrCreateWeekPlan(userId);
  const goal = user?.weeklyGoal ?? 3;

  return (
    <main className="flex flex-1 flex-col">
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

      <PlannerBoard items={weekPlan.items} />
    </main>
  );
}
