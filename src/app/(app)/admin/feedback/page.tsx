import { Suspense } from "react";
import { AdminFeedbackFilters } from "@/features/feedback/components/admin-feedback-filters";
import { AdminFeedbackList } from "@/features/feedback/components/admin-feedback-list";
import {
  FEEDBACK_CATEGORIES,
  type FeedbackCategory,
} from "@/features/feedback/lib/validation";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

function parseCategory(
  raw: string | undefined,
): FeedbackCategory | null {
  if (!raw) return null;
  return (FEEDBACK_CATEGORIES as readonly string[]).includes(raw)
    ? (raw as FeedbackCategory)
    : null;
}

function AdminFeedbackListFallback() {
  return (
    <div className="mt-6 space-y-2" aria-hidden>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

export default async function AdminFeedbackPage({
  searchParams,
}: Readonly<Props>) {
  await requireAdminPage();

  const params = await searchParams;
  const activeCategory = parseCategory(params.category);

  return (
    <main className="mx-auto flex w-full max-w-lg min-w-0 flex-1 flex-col">
      <h1 className="text-lg font-semibold text-ink">Masukan pengguna</h1>
      <p className="mt-1 text-sm leading-snug text-ink-muted">
        Kirim masukan dari halaman Akun. Menampilkan 50 terbaru.
      </p>
      <div className="mt-4 min-w-0">
        <AdminFeedbackFilters activeCategory={activeCategory} />
        <Suspense fallback={<AdminFeedbackListFallback />}>
          <AdminFeedbackList category={activeCategory} />
        </Suspense>
      </div>
    </main>
  );
}
