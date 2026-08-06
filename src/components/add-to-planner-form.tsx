"use client";

import { useActionState } from "react";
import {
  addTrendToPlannerAction,
  type PlannerActionState,
} from "@/app/actions/planner";
import { useActionToasts } from "@/hooks/use-action-toasts";
import { DAY_SHORT } from "@/lib/week";

const initial: PlannerActionState = {};

export function AddToPlannerForm({ trendId }: { trendId: string }) {
  const [state, action, pending] = useActionState(
    addTrendToPlannerAction,
    initial,
  );
  useActionToasts(state);

  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="trendId" value={trendId} />
      <label className="text-xs font-medium text-ink-muted">
        Tambah ke hari
        <select
          name="dayOfWeek"
          defaultValue="0"
          className="min-touch mt-1 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink"
        >
          {DAY_SHORT.map((label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="min-touch inline-flex items-center justify-center rounded-xl bg-coral px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Menambahkan..." : "Tambah ke planner"}
      </button>
    </form>
  );
}
