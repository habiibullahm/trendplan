"use client";

import { useActionState } from "react";
import {
  deleteActivityAction,
  updateActivityAction,
  type ActivityActionState,
} from "@/features/activities/actions";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useActionToasts } from "@/hooks/use-action-toasts";
import { DAY_LABELS, type PlannerView } from "@/lib/week";

const initial: ActivityActionState = { status: "success" };

export function EditActivityForm({
  activityId,
  title,
  dayOfWeek,
  returnMonth,
  returnWeek,
  view,
  cancelHref,
}: {
  activityId: string;
  title: string;
  dayOfWeek: number;
  returnMonth?: string;
  returnWeek?: number;
  view?: PlannerView;
  cancelHref: string;
}) {
  const [state, action, pending] = useActionState(
    updateActivityAction,
    initial,
  );
  const [, deleteAction, deletePending] = useActionState(
    async (_prev: null, formData: FormData) => {
      await deleteActivityAction(formData);
      return null;
    },
    null,
  );
  useActionToasts(state);

  const viewField =
    view === "shared" ? (
      <input type="hidden" name="view" value="shared" />
    ) : null;

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="activityId" value={activityId} />
        {returnMonth ? (
          <input type="hidden" name="returnMonth" value={returnMonth} />
        ) : null}
        {returnWeek != null ? (
          <input type="hidden" name="returnWeek" value={String(returnWeek)} />
        ) : null}
        {viewField}

        <FormField label="Hari">
          <Select name="dayOfWeek" defaultValue={String(dayOfWeek)}>
            {DAY_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Judul">
          <Input
            name="title"
            required
            maxLength={120}
            defaultValue={title}
            placeholder="Contoh: Picnic di taman"
          />
        </FormField>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="submit"
            loading={pending}
            loadingText="Menyimpan..."
            disabled={deletePending}
          >
            Simpan
          </Button>
          <ButtonLink href={cancelHref} variant="secondary">
            Batal
          </ButtonLink>
        </div>
      </form>

      <form action={deleteAction} className="border-t border-border pt-4">
        <input type="hidden" name="activityId" value={activityId} />
        {returnMonth ? (
          <input type="hidden" name="returnMonth" value={returnMonth} />
        ) : null}
        {returnWeek != null ? (
          <input type="hidden" name="returnWeek" value={String(returnWeek)} />
        ) : null}
        {viewField}
        <Button
          type="submit"
          variant="danger"
          loading={deletePending}
          loadingText="Menghapus..."
          disabled={pending}
        >
          Hapus aktivitas
        </Button>
      </form>
    </div>
  );
}
