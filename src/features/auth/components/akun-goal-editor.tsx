"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateWeeklyGoalAction,
  type WeeklyGoalActionState,
} from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { ChipButton } from "@/components/ui/chip-button";
import { Modal } from "@/components/ui/modal";
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

export function AkunGoalEditor({ weeklyGoal }: { weeklyGoal: number }) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState(weeklyGoal);
  const [state, action] = useActionState(
    async (prev: WeeklyGoalActionState, formData: FormData) => {
      const next = await updateWeeklyGoalAction(prev, formData);
      if (next.success) setOpen(false);
      return next;
    },
    initial,
  );
  useActionToasts(state);

  return (
    <>
      <div className="flex items-center justify-between gap-3 py-2.5">
        <span className="text-sm text-ink-muted">Target / minggu</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{weeklyGoal} ide</span>
          <ChipButton
            variant="ghost"
            onClick={() => {
              setGoal(weeklyGoal);
              setOpen(true);
            }}
          >
            Ubah
          </ChipButton>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Target per minggu"
        description="Berapa ide yang ingin kamu rencanakan tiap minggu?"
        size="sm"
      >
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="weeklyGoal" value={goal} />
          <div className="grid grid-cols-7 gap-2">
            {GOAL_OPTIONS.map((value) => {
              const active = value === goal;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGoal(value)}
                  className={`min-touch rounded-xl border text-sm font-semibold transition-colors ${
                    active
                      ? "border-coral bg-coral text-white"
                      : "border-border bg-paper text-ink"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
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
