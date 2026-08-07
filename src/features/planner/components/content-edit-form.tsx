"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  updateContentItemAction,
  softDeleteContentItemAction,
  type PlannerActionState,
} from "@/features/planner/actions";
import { ChipButton } from "@/components/ui/chip-button";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { LabelText } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToasts } from "@/hooks/use-action-toasts";
import { ALL_STATUSES, STATUS_LABEL } from "@/lib/labels";
import { copyText } from "@/features/planner/lib/clipboard";
import { copyToastError, copyToastSuccess } from "@/features/planner/lib/copy-toast";
import {
  formatItemPaste,
  suggestCaption,
  suggestHashtags,
} from "@/features/planner/lib/export-text";
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
          <LabelText>Status</LabelText>
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

        <FormField
          label="Caption"
          htmlFor="caption-field"
          action={
            <ChipButton variant="ghost" onClick={isiSaran}>
              Isi saran
            </ChipButton>
          }
        >
          <Textarea
            id="caption-field"
            name="caption"
            rows={4}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Tulis caption draft…"
          />
        </FormField>

        <FormField label="Hashtag">
          <Input
            name="hashtags"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
          />
        </FormField>

        <FormField label="Catatan performa (opsional)">
          <Input
            name="performanceNote"
            defaultValue={item.performanceNote ?? ""}
            placeholder="Contoh: 12k views, hook kuat"
          />
        </FormField>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" loading={pending} loadingText="Menyimpan...">
            Simpan
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
          <Button type="submit" variant="danger">
            Hapus
          </Button>
        </form>
      </div>
    </div>
  );
}
