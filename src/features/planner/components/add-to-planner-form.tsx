"use client";

import { useActionState } from "react";
import {
  addTrendToPlannerAction,
  type PlannerActionState,
} from "@/features/planner/actions/content";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useActionToasts } from "@/hooks/use-action-toasts";
import { DAY_SHORT } from "@/lib/week";

const initial: PlannerActionState = { status: "success" };

export function AddToPlannerForm({ trendId }: { trendId: string }) {
  const [state, action, pending] = useActionState(
    addTrendToPlannerAction,
    initial,
  );
  useActionToasts(state);

  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="trendId" value={trendId} />
      <p className="text-xs font-medium text-ink-muted">Pakai ke Planner</p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="shrink-0">
          <span className="sr-only">Hari</span>
          <Select
            name="dayOfWeek"
            defaultValue="0"
            className="mt-0 w-[5.25rem]"
          >
            {DAY_SHORT.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </Select>
        </label>
        <Button
          type="submit"
          size="sm"
          className="shrink-0"
          loading={pending}
          loadingText="…"
        >
          Pakai
        </Button>
      </div>
    </form>
  );
}
