import { AdminFeedbackInbox } from "@/features/feedback/components/admin-feedback-inbox";
import { listAdminFeedback } from "@/features/feedback/fetchers/admin-list";
import type { FeedbackCategory } from "@/features/feedback/lib/validation";

export async function AdminFeedbackList({
  category,
}: {
  category: FeedbackCategory | null;
}) {
  const rows = await listAdminFeedback({ category });
  const items = rows.map((row) => ({
    id: row.id,
    category: row.category,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    adminReply: row.adminReply,
    repliedAt: row.repliedAt?.toISOString() ?? null,
    repliedByEmail: row.repliedByEmail,
    user: row.user,
  }));
  return <AdminFeedbackInbox items={items} filtered={Boolean(category)} />;
}
