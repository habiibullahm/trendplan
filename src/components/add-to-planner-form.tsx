"use client";

import { useActionState } from "react";
import {
  addTrendToPlannerAction,
  type PlannerActionState,
} from "@/app/actions/planner";
import { Button } from "@/components/ui/button";
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
      <p className="text-xs font-medium text-ink-muted">Tambah ke hari</p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="shrink-0">
          <span className="sr-only">Hari</span>
          <select
            name="dayOfWeek"
            defaultValue="0"
            className="min-touch w-[5.25rem] rounded-xl border border-border bg-surface px-3 text-sm text-ink"
          >
            {DAY_SHORT.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" size="sm" className="shrink-0" disabled={pending}>
          {pending ? "…" : "Tambah"}
        </Button>
      </div>
    </form>
  );
}
