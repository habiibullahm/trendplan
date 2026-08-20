"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { copyText } from "@/features/planner/lib/clipboard";
import { copyToastError, copyToastSuccess } from "@/features/planner/lib/copy-toast";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
} from "@/features/feedback/lib/validation";
import { cn } from "@/lib/cn";

export type AdminFeedbackRow = {
  id: string;
  category: string;
  message: string;
  createdAt: string;
  user: { name: string | null; email: string };
};

function categoryLabel(category: string): string {
  if (category in FEEDBACK_CATEGORY_LABELS) {
    return FEEDBACK_CATEGORY_LABELS[category as FeedbackCategory];
  }
  return category;
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function clampMessage(message: string, max = 120): string {
  const oneLine = message.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max - 1)}…`;
}

export function AdminFeedbackInbox({
  items,
  activeCategory,
}: {
  items: AdminFeedbackRow[];
  activeCategory: FeedbackCategory | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((i) => i.id === selectedId) ?? null;

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
        <Link
          href="/admin/feedback"
          className={cn(
            "min-touch inline-flex items-center justify-center rounded-lg border px-3 text-xs font-semibold transition",
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
            className={cn(
              "min-touch inline-flex items-center justify-center rounded-lg border px-3 text-xs font-semibold transition",
              activeCategory === cat
                ? "border-coral/50 bg-coral/5 text-coral"
                : "border-border bg-surface text-ink hover:border-coral/40 hover:bg-coral/5",
            )}
          >
            {FEEDBACK_CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState className="mt-6">
          <p className="font-semibold text-ink">Belum ada masukan</p>
          <p className="mt-1">
            {activeCategory
              ? "Tidak ada masukan di kategori ini."
              : "Kalau ada yang kirim dari Akun, akan muncul di sini."}
          </p>
        </EmptyState>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="min-touch w-full rounded-2xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-coral/40 hover:bg-coral/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge
                    size="sm"
                    className="border-border bg-paper text-ink-muted"
                  >
                    {categoryLabel(item.category)}
                  </Badge>
                  <span className="text-xs text-ink-muted">
                    {formatWhen(item.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {clampMessage(item.message)}
                </p>
                <p className="mt-1 truncate text-xs text-ink-muted">
                  {item.user.name?.trim() || "Creator"} · {item.user.email}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title="Detail masukan"
        description={
          selected
            ? `${categoryLabel(selected.category)} · ${formatWhen(selected.createdAt)}`
            : undefined
        }
      >
        {selected ? (
          <div className="space-y-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {selected.message}
            </p>
            <p className="text-xs text-ink-muted">
              Dari {selected.user.name?.trim() || "Creator"} ({selected.user.email})
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={async () => {
                const ok = await copyText(selected.message);
                if (ok) copyToastSuccess("Disalin");
                else copyToastError("Gagal menyalin");
              }}
            >
              Salin
            </Button>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
