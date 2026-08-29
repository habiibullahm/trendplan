"use client";

import { useActionState, useMemo } from "react";
import {
  addTrendToPlannerAction,
  type PlannerActionState,
} from "@/features/planner/actions/content";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useActionToasts } from "@/hooks/use-action-toasts";
import {
  DAY_SHORT,
  formatDayBoardLabel,
  formatWeekStartParam,
  getWeekStart,
} from "@/lib/week";
import { idleActionResult } from "@/lib/action-result";

const initial: PlannerActionState = idleActionResult;

export function AddToPlannerForm({ trendId }: { trendId: string }) {
  const [state, action, pending] = useActionState(
    addTrendToPlannerAction,
    initial,
  );
  useActionToasts(state);

  const weekStart = useMemo(() => getWeekStart(), []);
  const weekStartParam = formatWeekStartParam(weekStart);

  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="trendId" value={trendId} />
      <input type="hidden" name="weekStart" value={weekStartParam} />
      <p className="text-xs font-medium text-ink-muted">Pakai ke Planner</p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="shrink-0">
          <span className="sr-only">Hari</span>
          <Select
            name="dayOfWeek"
            defaultValue="0"
            className="mt-0 w-[9.5rem]"
          >
            {DAY_SHORT.map((_, index) => (
              <option key={index} value={index}>
                {formatDayBoardLabel(weekStart, index)}
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
