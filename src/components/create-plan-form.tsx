"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createContentItemAction,
  type PlannerActionState,
} from "@/app/actions/planner";
import { useActionToasts } from "@/hooks/use-action-toasts";
import { DAY_LABELS } from "@/lib/week";

const initial: PlannerActionState = {};

export function CreatePlanForm({ defaultDay }: { defaultDay: number }) {
  const [state, action, pending] = useActionState(
    createContentItemAction,
    initial,
  );
  useActionToasts(state);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="block">
        <span className="text-sm font-medium text-ink">Hari</span>
        <select
          name="dayOfWeek"
          defaultValue={String(defaultDay)}
          className="min-touch mt-1 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-coral"
        >
          {DAY_LABELS.map((label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Judul</span>
        <input
          name="title"
          required
          maxLength={120}
          placeholder="Contoh: Bookstore date aesthetic"
          className="min-touch mt-1 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-coral"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Hook (opsional)</span>
        <textarea
          name="hook"
          rows={3}
          placeholder="Take them to a bookstore and do this…"
          className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-coral"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="min-touch inline-flex items-center justify-center rounded-xl bg-coral px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan ide"}
        </button>
        <Link
          href="/planner"
          className="min-touch inline-flex items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
