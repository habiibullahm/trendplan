"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateWeeklyGoalAction,
  type WeeklyGoalActionState,
} from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { ChipButton } from "@/components/ui/chip-button";
import { useActionToasts } from "@/hooks/use-action-toasts";

const GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;
const initial: WeeklyGoalActionState = {};

function SaveGoalButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} loadingText="Menyimpan...">
      Simpan
    </Button>
  );
}

export function AkunGoalEditor({ weeklyGoal }: { weeklyGoal: number }) {
  const [editing, setEditing] = useState(false);
  const [goal, setGoal] = useState(weeklyGoal);
  const [state, action] = useActionState(updateWeeklyGoalAction, initial);
  useActionToasts(state);

  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state.success]);

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3 py-2.5">
        <span className="text-sm text-ink-muted">Target / minggu</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{weeklyGoal} ide</span>
          <ChipButton
            variant="ghost"
            onClick={() => {
              setGoal(weeklyGoal);
              setEditing(true);
            }}
          >
            Ubah
          </ChipButton>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3 py-2.5">
      <input type="hidden" name="weeklyGoal" value={goal} />
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-ink-muted">Target / minggu</span>
        <ChipButton
          variant="ghost"
          type="button"
          onClick={() => {
            setGoal(weeklyGoal);
            setEditing(false);
          }}
        >
          Batal
        </ChipButton>
      </div>
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
                  : "border-border bg-surface text-ink"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
      <SaveGoalButton />
    </form>
  );
}
