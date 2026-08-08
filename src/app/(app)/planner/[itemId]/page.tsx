import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContentEditForm } from "@/features/planner/components/content-edit-form";
import { RiwayatPostedCard } from "@/features/planner/components/riwayat-posted-card";
import {
  DAY_LABELS,
  formatWeekRange,
  plannerHref,
} from "@/lib/week";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ month?: string; week?: string }>;
};

export default async function PlannerItemPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { itemId } = await params;
  const { month, week } = await searchParams;
  const item = await prisma.contentItem.findFirst({
    where: {
      id: itemId,
      deletedAt: null,
      dayOfWeek: { gte: 0 },
      weekPlan: { userId: session.user.id },
    },
    include: {
      trend: true,
      weekPlan: { select: { weekStart: true } },
    },
  });

  if (!item) notFound();

  const backHref = plannerHref({
    weekStart: item.weekPlan.weekStart,
    monthParam: month,
    weekParam: week,
  });
  const backUrl = new URL(backHref, "http://local");
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
          backHref={backHref}
        />
      </div>
    </main>
  );
}
