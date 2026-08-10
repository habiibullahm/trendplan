import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CreateActivityForm } from "@/features/activities/components/create-activity-form";
import { getOrCreateWeekPlan } from "@/features/planner/lib/planner";
import {
  formatWeekRange,
  formatWeekStartParam,
  getWeekStart,
  parseWeekStartParam,
  plannerHref,
} from "@/lib/week";

type Props = {
  searchParams: Promise<{
    day?: string;
    weekStart?: string;
    month?: string;
    week?: string;
  }>;
};

function parseDay(raw?: string): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : 0;
}

export default async function ActivityNewPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const {
    day,
    weekStart: weekStartRaw,
    month,
    week,
  } = await searchParams;
  const weekStart =
    parseWeekStartParam(weekStartRaw ?? null) ?? getWeekStart();
  const weekPlan = await getOrCreateWeekPlan(session.user.id, weekStart);
  const weekStartParam = formatWeekStartParam(weekPlan.weekStart);
  const cancelHref = plannerHref({
    weekStart: weekPlan.weekStart,
    monthParam: month,
    weekParam: week,
    tab: "aktivitas",
  });
  const cancelUrl = new URL(cancelHref, "http://local");
  const returnMonth = cancelUrl.searchParams.get("month") ?? undefined;
  const returnWeekRaw = cancelUrl.searchParams.get("week");
  const returnWeek = returnWeekRaw ? Number(returnWeekRaw) : undefined;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink md:text-3xl">
        Tambah aktivitas
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Minggu {formatWeekRange(weekPlan.weekStart)} · bisa lebih dari satu
        sekaligus
      </p>

      <div className="mt-6">
        <CreateActivityForm
          defaultDay={parseDay(day)}
          weekStartParam={weekStartParam}
          returnMonth={returnMonth}
          returnWeek={
            returnWeek != null && Number.isInteger(returnWeek)
              ? returnWeek
              : undefined
          }
          cancelHref={cancelHref}
        />
      </div>
    </main>
  );
}
