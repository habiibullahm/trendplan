"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateWeeklyGoalAction,
  type WeeklyGoalActionState,
} from "@/features/auth/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useActionToasts } from "@/hooks/use-action-toasts";

const GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;
const initial: WeeklyGoalActionState = {};

function SaveGoalButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      width="full"
      loading={pending}
      loadingText="Menyimpan..."
    >
      Simpan
    </Button>
  );
}

function GoalPicker({
  goal,
  onSelect,
}: {
  goal: number;
  onSelect: (value: number) => void;
}) {
  const { pending } = useFormStatus();

  return (
    <ToggleGroup
      className="grid w-full grid-cols-7 gap-2"
      variant="outline"
      size="default"
      disabled={pending}
      value={[String(goal)]}
      onValueChange={(next) => {
        const raw = next[0];
        if (!raw) return;
        const n = Number(raw);
        if (n >= 1 && n <= 7) onSelect(n);
      }}
    >
      {GOAL_OPTIONS.map((value) => (
        <ToggleGroupItem key={value} value={String(value)}>
          {value}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function AkunGoalEditor({ weeklyGoal }: { weeklyGoal: number }) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState(weeklyGoal);
  const [state, action, pending] = useActionState(
    async (prev: WeeklyGoalActionState, formData: FormData) => {
      const next = await updateWeeklyGoalAction(prev, formData);
      if (next.success) setOpen(false);
      return next;
    },
    initial,
  );
  useActionToasts(state);

  function onClose() {
    if (pending) return;
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 py-2.5">
        <span className="text-sm text-ink-muted">Target / minggu</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{weeklyGoal} ide</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => {
              setGoal(weeklyGoal);
              setOpen(true);
            }}
          >
            Ubah
          </Button>
        </div>
      </div>

      <Modal
        open={open}
        onClose={onClose}
        allowClose={!pending}
        title="Target per minggu"
        description="Berapa ide yang ingin kamu rencanakan tiap minggu?"
        size="sm"
      >
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="weeklyGoal" value={goal} />
          <GoalPicker goal={goal} onSelect={setGoal} />
          <p className="text-center text-sm text-ink-muted">
            Target:{" "}
            <span className="font-semibold text-ink">{goal} ide / minggu</span>
          </p>
          <SaveGoalButton />
        </form>
      </Modal>
    </>
  );
}
