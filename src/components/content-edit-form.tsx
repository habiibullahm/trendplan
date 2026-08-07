"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  updateContentItemAction,
  softDeleteContentItemAction,
  type PlannerActionState,
} from "@/app/actions/planner";
import { ChipButton } from "@/components/ui/chip-button";
import { Button } from "@/components/ui/button";
import { useActionToasts } from "@/hooks/use-action-toasts";
import { ALL_STATUSES, STATUS_LABEL } from "@/lib/labels";
import { copyText } from "@/lib/clipboard";
import { copyToastError, copyToastSuccess } from "@/lib/copy-toast";
import {
  formatItemPaste,
  suggestCaption,
  suggestHashtags,
} from "@/lib/export-text";
import type { ContentStatus } from "@/generated/prisma/client";

const initial: PlannerActionState = {};

type Props = {
  item: {
    id: string;
    title: string;
    hook: string | null;
    caption: string | null;
    hashtags: string | null;
    performanceNote: string | null;
    status: ContentStatus;
  };
};

export function ContentEditForm({ item }: Props) {
  const [state, action, pending] = useActionState(
    updateContentItemAction,
    initial,
  );
  useActionToasts(state);

  const [caption, setCaption] = useState(item.caption ?? "");
  const [hashtags, setHashtags] = useState(item.hashtags ?? "");

  function isiSaran() {
    const nextCaption = suggestCaption({
      title: item.title,
      hook: item.hook,
    });
    const nextHashtags = suggestHashtags();
    const captionDirty =
      caption.trim().length > 0 && caption.trim() !== nextCaption;
    const hashtagsDirty =
      hashtags.trim().length > 0 && hashtags.trim() !== nextHashtags;

    if (captionDirty || hashtagsDirty) {
      const ok = window.confirm(
        "Ganti caption & hashtag dengan saran? Teks di field akan ditimpa.",
      );
      if (!ok) return;
    }

    setCaption(nextCaption);
    setHashtags(nextHashtags);
    copyToastSuccess("Saran diisi.");
  }

  async function salin() {
    const text = formatItemPaste({
      title: item.title,
      hook: item.hook,
      caption,
      hashtags,
    });
    if (!text) {
      copyToastError("Belum ada teks untuk disalin.");
      return;
    }
    const ok = await copyText(text);
    if (ok) copyToastSuccess("Disalin.");
    else copyToastError("Gagal menyalin.");
  }

  return (
    <div className="flex flex-col gap-5">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="itemId" value={item.id} />

        <div>
          <p className="text-sm font-medium text-ink">Status</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ALL_STATUSES.map((status) => (
              <label
                key={status}
                className="min-touch flex cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-2 text-center text-xs font-semibold has-[:checked]:border-coral has-[:checked]:bg-coral/10 has-[:checked]:text-coral"
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  defaultChecked={item.status === status}
                  className="sr-only"
                />
                {STATUS_LABEL[status]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-ink">Caption</span>
            <ChipButton variant="ghost" onClick={isiSaran}>
              Isi saran
            </ChipButton>
          </div>
          <textarea
            name="caption"
            rows={4}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Tulis caption draft…"
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-coral"
          />
        </div>

        <div>
          <span className="text-sm font-medium text-ink">Hashtag</span>
          <input
            name="hashtags"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="min-touch mt-1 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-coral"
          />
        </div>

        <label className="block">
          <span className="text-sm font-medium text-ink">
            Catatan performa (opsional)
          </span>
          <input
            name="performanceNote"
            defaultValue={item.performanceNote ?? ""}
            placeholder="Contoh: 12k views, hook kuat"
            className="min-touch mt-1 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-coral"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
          <ChipButton onClick={salin}>Salin</ChipButton>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/planner"
          className="text-sm font-semibold text-coral hover:underline"
        >
          Kembali ke planner
        </Link>
        <form action={softDeleteContentItemAction}>
          <input type="hidden" name="itemId" value={item.id} />
          <button
            type="submit"
            className="text-sm font-semibold text-ink-muted hover:text-coral hover:underline"
          >
            Hapus
          </button>
        </form>
      </div>
    </div>
  );
}
