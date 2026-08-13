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
import { ALL_STATUSES, STATUS_LABEL, normalizeStatus } from "@/lib/labels";
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
    status: ContentStatus;
  };
  returnMonth?: string;
  returnWeek?: number;
  backHref?: string;
};

function ReturnFields({
  returnMonth,
  returnWeek,
}: {
  returnMonth?: string;
  returnWeek?: number;
}) {
  return (
    <>
      {returnMonth ? (
        <input type="hidden" name="returnMonth" value={returnMonth} />
      ) : null}
      {returnWeek != null ? (
        <input type="hidden" name="returnWeek" value={String(returnWeek)} />
      ) : null}
    </>
  );
}

export function ContentEditForm({
  item,
  returnMonth,
  returnWeek,
  backHref = "/planner",
}: Props) {
  const [state, action, savePending] = useActionState(
    updateContentItemAction,
    initial,
  );
  const [, deleteAction, deletePending] = useActionState(
    async (_prev: null, formData: FormData) => {
      await softDeleteContentItemAction(formData);
      return null;
    },
    null,
  );
  useActionToasts(state);

  const busy = savePending || deletePending;
  const [caption, setCaption] = useState(item.caption ?? "");
  const [hashtags, setHashtags] = useState(item.hashtags ?? "");
  const [aiPending, setAiPending] = useState(false);

  function applySaran(nextCaption: string, nextHashtags: string) {
    const captionDirty =
      caption.trim().length > 0 && caption.trim() !== nextCaption;
    const hashtagsDirty =
      hashtags.trim().length > 0 && hashtags.trim() !== nextHashtags;

    if (captionDirty || hashtagsDirty) {
      const ok = window.confirm(
        "Ganti caption & hashtag dengan saran? Teks di field akan ditimpa.",
      );
      if (!ok) return false;
    }

    setCaption(nextCaption);
    setHashtags(nextHashtags);
    return true;
  }

  /** Local template fallback (no network) — used if AI request fails hard. */
  function isiSaranTemplate() {
    const nextCaption = suggestCaption({
      title: item.title,
      hook: item.hook,
    });
    const nextHashtags = suggestHashtags();
    if (!applySaran(nextCaption, nextHashtags)) return;
    copyToastSuccess("Saran diisi");
  }

  async function bantuAi() {
    if (aiPending || busy) return;
    setAiPending(true);
    try {
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentItemId: item.id }),
      });

      if (res.status === 429) {
        copyToastError("Terlalu banyak permintaan. Coba lagi nanti.");
        return;
      }

      if (!res.ok) {
        isiSaranTemplate();
        return;
      }

      const data = (await res.json()) as {
        caption?: string;
        hashtags?: string;
        source?: "ai" | "template";
      };

      const nextCaption =
        typeof data.caption === "string"
          ? data.caption
          : suggestCaption({ title: item.title, hook: item.hook });
      const nextHashtags =
        typeof data.hashtags === "string" ? data.hashtags : suggestHashtags();

      if (!applySaran(nextCaption, nextHashtags)) return;

      if (data.source === "ai") {
        copyToastSuccess("Saran AI diisi");
      } else {
        copyToastSuccess("Saran template diisi");
      }
    } catch {
      isiSaranTemplate();
    } finally {
      setAiPending(false);
    }
  }

  async function salin() {
    const text = formatItemPaste({
      title: item.title,
      hook: item.hook,
      caption,
      hashtags,
    });
    if (!text) {
      copyToastError("Belum ada teks untuk disalin");
      return;
    }
    const ok = await copyText(text);
    if (ok) copyToastSuccess("Disalin");
    else copyToastError("Gagal menyalin");
  }

  const controlsBusy = busy || aiPending;

  return (
    <div className="flex flex-col gap-5">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="itemId" value={item.id} />
        <ReturnFields returnMonth={returnMonth} returnWeek={returnWeek} />

        <div>
          <LabelText>Status</LabelText>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ALL_STATUSES.map((status) => (
              <label
                key={status}
                className={`min-touch flex items-center justify-center rounded-xl border border-border bg-surface px-2 text-center text-xs font-semibold has-[:checked]:border-coral has-[:checked]:bg-coral/10 has-[:checked]:text-coral ${
                  controlsBusy
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  defaultChecked={normalizeStatus(item.status) === status}
                  disabled={controlsBusy}
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
            <ChipButton
              variant="ghost"
              onClick={bantuAi}
              disabled={controlsBusy}
              aria-busy={aiPending}
            >
              {aiPending ? "Menyusun…" : "Bantu AI"}
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
            disabled={controlsBusy}
          />
        </FormField>

        <FormField label="Hashtag">
          <Input
            name="hashtags"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            disabled={controlsBusy}
          />
        </FormField>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="submit"
            loading={savePending}
            disabled={deletePending || aiPending}
            loadingText="Menyimpan..."
          >
            Simpan
          </Button>
          <ChipButton onClick={salin} disabled={controlsBusy}>
            Salin
          </ChipButton>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="text-sm font-semibold text-coral hover:underline"
        >
          Kembali ke planner
        </Link>
        <form action={deleteAction}>
          <input type="hidden" name="itemId" value={item.id} />
          <ReturnFields returnMonth={returnMonth} returnWeek={returnWeek} />
          <Button
            type="submit"
            variant="danger"
            disabled={savePending || aiPending}
            loading={deletePending}
            loadingText="Menghapus..."
          >
            Hapus
          </Button>
        </form>
      </div>
    </div>
  );
}
