"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  addTrendToPlannerAction,
  type PlannerActionState,
} from "@/features/planner/actions/content";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useActionToasts } from "@/hooks/use-action-toasts";
import {
  idleActionResult,
  isCompletedActionSuccess,
} from "@/lib/action-result";
import { DAY_SHORT, type PlannerView } from "@/lib/week";
import type { EmptySlotSaranConfig } from "@/features/planner/components/empty-slot-saran-config";

const initial: PlannerActionState = idleActionResult;

function PakaiForm({
  trendId,
  trendTitle,
  dayOfWeek,
  weekStartParam,
  view,
  busy,
  onBusy,
  onSuccess,
}: {
  trendId: string;
  trendTitle: string;
  dayOfWeek: number;
  weekStartParam?: string;
  view?: PlannerView;
  busy: boolean;
  onBusy: (id: string, next: boolean) => void;
  onSuccess: () => void;
}) {
  const [state, action, pending] = useActionState(
    addTrendToPlannerAction,
    initial,
  );
  useActionToasts(state);

  useEffect(() => {
    onBusy(trendId, pending);
    return () => onBusy(trendId, false);
  }, [pending, onBusy, trendId]);

  useEffect(() => {
    if (isCompletedActionSuccess(state)) onSuccess();
  }, [state, onSuccess]);

  return (
    <form
      action={action}
      className="mt-3"
      onSubmit={() => onBusy(trendId, true)}
    >
      <input type="hidden" name="trendId" value={trendId} />
      <input type="hidden" name="dayOfWeek" value={String(dayOfWeek)} />
      {weekStartParam ? (
        <input type="hidden" name="weekStart" value={weekStartParam} />
      ) : null}
      {view === "shared" ? (
        <input type="hidden" name="view" value="shared" />
      ) : null}
      <Button
        type="submit"
        size="sm"
        disabled={busy && !pending}
        loading={pending}
        loadingText="…"
        aria-label={`Pakai ${trendTitle}`}
      >
        Pakai
      </Button>
    </form>
  );
}

function SaranModalBody({
  config,
  initialDay,
  onClose,
}: {
  config: EmptySlotSaranConfig;
  initialDay: number;
  onClose: () => void;
}) {
  const [day, setDay] = useState(initialDay);
  const [busy, setBusy] = useState(false);
  const selectable = config.emptyDays.includes(day)
    ? day
    : (config.emptyDays[0] ?? 0);

  const pendingIds = useRef(new Set<string>());
  const markBusy = useCallback((id: string, next: boolean) => {
    if (next) pendingIds.current.add(id);
    else pendingIds.current.delete(id);
    setBusy(pendingIds.current.size > 0);
  }, []);

  return (
    <>
      <label className="block">
        <span className="text-xs font-medium text-ink-muted">Hari</span>
        <Select
          className="mt-1 w-[5.25rem]"
          value={String(selectable)}
          disabled={busy}
          onChange={(e) => setDay(Number(e.target.value))}
        >
          {config.emptyDays.map((d) => (
            <option key={d} value={d}>
              {DAY_SHORT[d]}
            </option>
          ))}
        </Select>
      </label>

      <ul className="mt-4 space-y-3">
        {config.suggestions.map((trend) => (
          <li
            key={trend.id}
            className="rounded-xl border border-border bg-surface p-3"
          >
            <p className="text-sm font-semibold text-ink">{trend.title}</p>
            {trend.reason ? (
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {trend.reason}
              </p>
            ) : null}
            <PakaiForm
              trendId={trend.id}
              trendTitle={trend.title}
              dayOfWeek={selectable}
              weekStartParam={config.weekStartParam}
              view={config.view}
              busy={busy}
              onBusy={markBusy}
              onSuccess={onClose}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export function SaranModal({
  config,
  openDay,
  onClose,
}: {
  config: EmptySlotSaranConfig;
  openDay: number | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={openDay !== null}
      onClose={onClose}
      title="Saran ide"
      description="Tren belum dipakai minggu ini. Pilih hari kosong, lalu Pakai. Caption tetap lewat Bantu AI di detail."
    >
      {openDay !== null ? (
        <SaranModalBody
          key={openDay}
          config={config}
          initialDay={openDay}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}
