"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  updateContentItemAction,
  deleteContentItemAction,
  type PlannerActionState,
} from "@/app/actions/planner";
import { ALL_STATUSES, STATUS_LABEL } from "@/lib/labels";
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

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="itemId" value={item.id} />

        {state.error ? (
          <p className="rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="rounded-xl border border-sage/30 bg-sage/10 px-3 py-2 text-sm text-sage">
            {state.success}
          </p>
        ) : null}

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

        <label className="block">
          <span className="text-sm font-medium text-ink">Caption</span>
          <textarea
            name="caption"
            rows={4}
            defaultValue={item.caption ?? ""}
            placeholder="Tulis caption draft…"
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-coral"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Hashtag</span>
          <input
            name="hashtags"
            defaultValue={item.hashtags ?? ""}
            className="min-touch mt-1 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-coral"
          />
        </label>

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

        <button
          type="submit"
          disabled={pending}
          className="min-touch inline-flex items-center justify-center rounded-xl bg-coral px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

      <form action={deleteContentItemAction}>
        <input type="hidden" name="itemId" value={item.id} />
        <button
          type="submit"
          className="min-touch inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink-muted"
        >
          Hapus dari planner
        </button>
      </form>

      <Link href="/planner" className="text-center text-sm font-semibold text-coral">
        Kembali ke planner
      </Link>
    </div>
  );
}
