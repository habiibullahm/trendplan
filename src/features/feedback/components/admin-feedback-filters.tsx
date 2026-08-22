import Link from "next/link";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
} from "@/features/feedback/lib/validation";
import { cn } from "@/lib/cn";

export function AdminFeedbackFilters({
  activeCategory,
}: {
  activeCategory: FeedbackCategory | null;
}) {
  return (
    <div
      className="tp-scroll-x -mx-1 flex flex-nowrap gap-2 px-1"
      role="group"
      aria-label="Filter kategori"
    >
      <Link
        href="/admin/feedback"
        prefetch
        className={cn(
          "min-touch inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition",
          activeCategory === null
            ? "border-coral/50 bg-coral/5 text-coral"
            : "border-border bg-surface text-ink hover:border-coral/40 hover:bg-coral/5",
        )}
      >
        Semua
      </Link>
      {FEEDBACK_CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/admin/feedback?category=${cat}`}
          prefetch
          className={cn(
            "min-touch inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition",
            activeCategory === cat
              ? "border-coral/50 bg-coral/5 text-coral"
              : "border-border bg-surface text-ink hover:border-coral/40 hover:bg-coral/5",
          )}
        >
          {FEEDBACK_CATEGORY_LABELS[cat]}
        </Link>
      ))}
    </div>
  );
}
