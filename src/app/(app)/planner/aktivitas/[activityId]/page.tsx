import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSafeSession } from "@/lib/auth/session";
import { EditActivityForm } from "@/features/activities/components/edit-activity-form";
import { prisma } from "@/lib/prisma";
import { weekPlanAccessWhere } from "@/features/planner/lib/week-share";
import {
  formatWeekRange,
  parsePlannerView,
  plannerHref,
} from "@/lib/week";

type Props = {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{ month?: string; week?: string; view?: string }>;
};

export default async function ActivityEditPage({
  params,
  searchParams,
}: Readonly<Props>) {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");

  const { activityId } = await params;
  const { month, week, view: viewRaw } = await searchParams;

  const activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
      weekPlan: weekPlanAccessWhere(session.user.id),
    },
    include: {
      weekPlan: { select: { weekStart: true, userId: true } },
    },
  });
  if (!activity) notFound();

  const view =
    activity.weekPlan.userId !== session.user.id
      ? "shared"
      : parsePlannerView(viewRaw);

  const backHref = plannerHref({
    weekStart: activity.weekPlan.weekStart,
    monthParam: month,
    weekParam: week,
    tab: "aktivitas",
    view,
  });
  const backUrl = new URL(backHref, "https://local");
  const returnMonth = backUrl.searchParams.get("month") ?? undefined;
  const returnWeekRaw = backUrl.searchParams.get("week");
  const returnWeek = returnWeekRaw ? Number(returnWeekRaw) : undefined;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <p className="text-sm text-ink-muted">
        <Link
          href={backHref}
          className="font-semibold text-coral hover:underline"
        >
          ← Kembali ke Aktivitas
        </Link>
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink md:text-3xl">
        Edit aktivitas
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Minggu {formatWeekRange(activity.weekPlan.weekStart)}
      </p>

      <div className="mt-6">
        <EditActivityForm
          activityId={activity.id}
          title={activity.title}
          dayOfWeek={activity.dayOfWeek}
          returnMonth={returnMonth}
          returnWeek={
            returnWeek != null && Number.isInteger(returnWeek)
              ? returnWeek
              : undefined
          }
          view={view}
          cancelHref={backHref}
        />
      </div>
    </main>
  );
}
