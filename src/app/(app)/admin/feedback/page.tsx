import { AdminFeedbackInbox } from "@/features/feedback/components/admin-feedback-inbox";
import { listAdminFeedback } from "@/features/feedback/fetchers/admin-list";
import {
  FEEDBACK_CATEGORIES,
  type FeedbackCategory,
} from "@/features/feedback/lib/validation";
import { requireAdminPage } from "@/lib/auth/require-admin";

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

export default async function AdminFeedbackPage({
  searchParams,
}: Readonly<Props>) {
  await requireAdminPage();

  const params = await searchParams;
  const activeCategory = parseCategory(params.category);

  const rows = await listAdminFeedback({ category: activeCategory });

  const items = rows.map((row) => ({
    id: row.id,
    category: row.category,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    user: row.user,
  }));

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <h1 className="text-lg font-semibold text-ink">Masukan pengguna</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Kirim masukan dari halaman Akun. Menampilkan 50 terbaru.
      </p>
      <div className="mt-4">
        <AdminFeedbackInbox items={items} activeCategory={activeCategory} />
      </div>
    </main>
  );
}
