import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CreateActivityForm } from "@/features/activities/components/create-activity-form";
import { getWeekPlanForViewer } from "@/features/planner/lib/week-share";
import {
  formatWeekRange,
  formatWeekStartParam,
  getWeekStart,
  parsePlannerView,
  parseWeekStartParam,
  plannerHref,
} from "@/lib/week";

type Props = {
  searchParams: Promise<{
    day?: string;
    weekStart?: string;
    month?: string;
    week?: string;
    view?: string;
  }>;
};

function parseDay(raw?: string): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : 0;
}

export default async function ActivityNewPage({
  searchParams,
}: Readonly<Props>) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const {
    day,
    weekStart: weekStartRaw,
    month,
    week,
    view: viewRaw,
  } = await searchParams;
  const view = parsePlannerView(viewRaw);
  const weekStart =
    parseWeekStartParam(weekStartRaw ?? null) ?? getWeekStart();
  const weekPlan = await getWeekPlanForViewer(session.user.id, weekStart, {
    view,
  });
  const weekStartParam = formatWeekStartParam(weekPlan.weekStart);
  const cancelHref = plannerHref({
    weekStart: weekPlan.weekStart,
    monthParam: month,
    weekParam: week,
    tab: "aktivitas",
    view,
  });
  const cancelUrl = new URL(cancelHref, "https://local");
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
          view={view}
          cancelHref={cancelHref}
        />
      </div>
    </main>
  );
}
