import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CreatePlanForm } from "@/features/planner/components/create-plan-form";
import { getOrCreateWeekPlan } from "@/features/planner/lib/planner";
import { formatWeekRange } from "@/lib/week";

type Props = {
  searchParams: Promise<{ day?: string }>;
};

function parseDay(raw?: string): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : 0;
}

export default async function PlannerNewPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { day } = await searchParams;
  const weekPlan = await getOrCreateWeekPlan(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink md:text-3xl">
        Buat ide
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Minggu {formatWeekRange(weekPlan.weekStart)} · Niche Couple Date Ideas
      </p>

      <div className="mt-6">
        <CreatePlanForm defaultDay={parseDay(day)} />
      </div>
    </main>
  );
}
