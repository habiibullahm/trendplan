"use client";

import { useActionState, useMemo, useState } from "react";
import {
  createActivityAction,
  type ActivityActionState,
} from "@/features/activities/actions";
import { parseActivityTitles } from "@/features/activities/lib/parse-titles";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionToasts } from "@/hooks/use-action-toasts";
import { DAY_LABELS, type PlannerView } from "@/lib/week";
import { idleActionResult } from "@/lib/action-result";

const initial: ActivityActionState = idleActionResult;

export function CreateActivityForm({
  defaultDay,
  weekStartParam,
  returnMonth,
  returnWeek,
  view,
  cancelHref = "/planner?tab=aktivitas",
}: {
  defaultDay: number;
  weekStartParam?: string;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
  cancelHref?: string;
}) {
  const [state, action, pending] = useActionState(
    createActivityAction,
    initial,
  );
  const [raw, setRaw] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const parsed = useMemo(() => parseActivityTitles(raw), [raw]);
  const titles = parsed.titles;
  useActionToasts(state);

  return (
    <form
      action={action}
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        const next = parseActivityTitles(raw);
        if (next.error || next.titles.length === 0) {
          event.preventDefault();
          setClientError(next.error ?? "Isi minimal satu aktivitas.");
          return;
        }
        setClientError(null);
      }}
    >
      {weekStartParam ? (
        <input type="hidden" name="weekStart" value={weekStartParam} />
      ) : null}
      {returnMonth ? (
        <input type="hidden" name="returnMonth" value={returnMonth} />
      ) : null}
      {returnWeek != null ? (
        <input type="hidden" name="returnWeek" value={String(returnWeek)} />
      ) : null}
      {view === "shared" ? (
        <input type="hidden" name="view" value="shared" />
      ) : null}

      <FormField label="Hari" htmlFor="activity-day">
        <Select
          id="activity-day"
          name="dayOfWeek"
          defaultValue={String(defaultDay)}
        >
          {DAY_LABELS.map((label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </Select>
      </FormField>

      <div>
        <FormField label="Aktivitas" htmlFor="activity-titles">
          <Textarea
            id="activity-titles"
            name="titles"
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              if (clientError) setClientError(null);
            }}
            rows={5}
            placeholder={"Picnic di taman\nNonton malam\nDinner cafe"}
            aria-invalid={Boolean(clientError || state.status === "error")}
          />
        </FormField>
        <p className="mt-1.5 text-xs text-ink-muted">
          Satu baris per aktivitas (maks. 120 karakter / baris).
        </p>
        {titles.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-1.5" aria-label="Pratinjau daftar">
            {titles.map((title, index) => (
              <li
                key={`${index}-${title}`}
                className="flex items-start gap-2 rounded-xl bg-paper px-3 py-2 text-sm text-ink"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coral/10 text-[11px] font-semibold tabular-nums text-coral"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0 font-semibold">{title}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {clientError || (raw.trim() && parsed.error) ? (
          <p className="mt-2 text-sm text-coral" role="alert">
            {clientError ?? parsed.error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" loading={pending} loadingText="Menyimpan...">
          {titles.length > 1
            ? `Simpan ${titles.length} aktivitas`
            : "Simpan aktivitas"}
        </Button>
        <ButtonLink href={cancelHref} variant="secondary">
          Batal
        </ButtonLink>
      </div>
    </form>
  );
}
