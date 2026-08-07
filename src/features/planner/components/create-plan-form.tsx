"use client";

import { useActionState } from "react";
import {
  createContentItemAction,
  type PlannerActionState,
} from "@/features/planner/actions";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
      <FormField label="Hari">
        <Select name="dayOfWeek" defaultValue={String(defaultDay)}>
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
          placeholder="Contoh: Bookstore date aesthetic"
        />
      </FormField>

      <FormField label="Hook (opsional)">
        <Textarea
          name="hook"
          rows={3}
          placeholder="Take them to a bookstore and do this…"
        />
      </FormField>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" loading={pending} loadingText="Menyimpan...">
          Simpan ide
        </Button>
        <ButtonLink href="/planner" variant="secondary">
          Batal
        </ButtonLink>
      </div>
    </form>
  );
}
