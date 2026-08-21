import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSafeSession } from "@/lib/auth/session";
import { ContentEditForm } from "@/features/planner/components/content-edit-form";
import { RiwayatPostedCard } from "@/features/planner/components/riwayat-posted-card";
import {
  DAY_LABELS,
  formatWeekRange,
  parsePlannerView,
  plannerHref,
} from "@/lib/week";
import { weekPlanAccessWhere } from "@/features/planner/lib/week-share";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ month?: string; week?: string; view?: string }>;
};

export default async function PlannerItemPage({
  params,
  searchParams,
}: Readonly<Props>) {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");

  const { itemId } = await params;
  const { month, week, view: viewRaw } = await searchParams;
  const item = await prisma.contentItem.findFirst({
    where: {
      id: itemId,
      deletedAt: null,
      dayOfWeek: { gte: 0 },
      weekPlan: weekPlanAccessWhere(session.user.id),
    },
    include: {
      trend: true,
      weekPlan: { select: { weekStart: true, userId: true } },
    },
  });

  if (!item) notFound();

  // Partner deep-links / missing view → return to Plan bersama when editing a foreign week.
  const view =
    item.weekPlan.userId !== session.user.id
      ? "shared"
      : parsePlannerView(viewRaw);

  const backHref = plannerHref({
    weekStart: item.weekPlan.weekStart,
    monthParam: month,
    weekParam: week,
    view,
  });
  const backUrl = new URL(backHref, "https://local");
  const returnMonth = backUrl.searchParams.get("month") ?? undefined;
  const returnWeekRaw = backUrl.searchParams.get("week");
  const returnWeek = returnWeekRaw ? Number(returnWeekRaw) : undefined;
  const dayLabel = DAY_LABELS[item.dayOfWeek] ?? "Hari";
  const weekLabel = formatWeekRange(item.weekPlan.weekStart);
  const isPosted = item.status === "POSTED";

  if (isPosted) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <p className="text-sm text-ink-muted">
          {dayLabel} · Posted · hanya baca
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
          Preview konten
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Konten Posted tidak bisa diedit dari sini.
        </p>
        <div className="mt-6">
          <RiwayatPostedCard
            title={item.title}
            meta={`${dayLabel} · ${weekLabel}`}
            trendTitle={item.trend?.title}
            hook={item.hook}
            caption={item.caption}
            hashtags={item.hashtags}
          />
        </div>
        <Link
          href={backHref}
          className="mt-6 text-sm font-semibold text-coral hover:underline"
        >
          ← Kembali ke Planner
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <p className="text-sm text-ink-muted">
        {dayLabel} · slot konten
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
        {item.title}
      </h1>
      {item.hook ? (
        <p className="mt-2 text-sm italic text-ink-muted">{item.hook}</p>
      ) : null}
      {item.trend ? (
        <p className="mt-2 text-xs text-ink-muted">
          Sumber tren: {item.trend.title} · skor {item.trend.score}
        </p>
      ) : null}

      <div className="mt-6">
        <ContentEditForm
          item={item}
          returnMonth={returnMonth}
          returnWeek={
            returnWeek != null && Number.isInteger(returnWeek)
              ? returnWeek
              : undefined
          }
          view={view}
          backHref={backHref}
        />
      </div>
    </main>
  );
}
