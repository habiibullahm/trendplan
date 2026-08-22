"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { copyText } from "@/features/planner/lib/clipboard";
import { copyToastError, copyToastSuccess } from "@/features/planner/lib/copy-toast";
import {
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
} from "@/features/feedback/lib/validation";

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
  filtered = false,
}: {
  items: AdminFeedbackRow[];
  filtered?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((i) => i.id === selectedId) ?? null;

  if (items.length === 0) {
    return (
      <EmptyState className="mt-6">
        <p className="font-semibold text-ink">Belum ada masukan</p>
        <p className="mt-1">
          {filtered
            ? "Tidak ada masukan di kategori ini."
            : "Kalau ada yang kirim dari Akun, akan muncul di sini."}
        </p>
      </EmptyState>
    );
  }

  return (
    <>
      <ul className="mt-6 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setSelectedId(item.id)}
              className="min-touch w-full min-w-0 rounded-2xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-coral/40 hover:bg-coral/5"
            >
              <div className="flex items-start justify-between gap-3">
                <Badge
                  size="sm"
                  className="min-w-0 max-w-[min(100%,11rem)] truncate border-border bg-paper text-ink-muted"
                >
                  {categoryLabel(item.category)}
                </Badge>
                <span className="shrink-0 text-right text-xs leading-5 text-ink-muted">
                  {formatWhen(item.createdAt)}
                </span>
              </div>
              <p className="mt-2 break-words text-sm font-semibold leading-snug text-ink">
                {clampMessage(item.message)}
              </p>
              <p className="mt-1 truncate text-xs text-ink-muted">
                {item.user.name?.trim() || "Creator"} · {item.user.email}
              </p>
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title="Detail masukan"
        className="max-h-[min(85dvh,32rem)] overflow-hidden"
      >
        {selected ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs leading-snug text-ink-muted">
              <span className="block">{categoryLabel(selected.category)}</span>
              <time
                className="mt-0.5 block"
                dateTime={selected.createdAt}
              >
                {formatWhen(selected.createdAt)}
              </time>
            </p>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere] text-ink">
              {selected.message}
            </p>
            <p className="break-words text-xs leading-snug [overflow-wrap:anywhere] text-ink-muted">
              Dari {selected.user.name?.trim() || "Creator"}
              <span className="mt-0.5 block">{selected.user.email}</span>
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0 self-start"
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
