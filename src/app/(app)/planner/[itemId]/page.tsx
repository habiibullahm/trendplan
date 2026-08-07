import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContentEditForm } from "@/components/content-edit-form";
import { DAY_LABELS } from "@/lib/week";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ itemId: string }>;
};

export default async function PlannerItemPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { itemId } = await params;
  const item = await prisma.contentItem.findFirst({
    where: {
      id: itemId,
      deletedAt: null,
      dayOfWeek: { gte: 0 },
      weekPlan: { userId: session.user.id },
    },
    include: { trend: true },
  });

  if (!item) notFound();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <p className="text-sm text-ink-muted">
        {DAY_LABELS[item.dayOfWeek]} · slot konten
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
        <ContentEditForm item={item} />
      </div>
    </main>
  );
}
