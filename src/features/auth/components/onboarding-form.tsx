"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

const GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

type OnboardingFormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultGoal?: number;
  userName?: string | null;
  trendCount: number;
};

function GoalPicker({
  goal,
  onSelect,
}: {
  goal: number;
  onSelect: (value: number) => void;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="mt-3 grid grid-cols-7 gap-2">
      {GOAL_OPTIONS.map((value) => {
        const active = value === goal;
        return (
          <button
            key={value}
            type="button"
            disabled={pending}
            onClick={() => onSelect(value)}
            className={`min-touch rounded-xl border text-sm font-semibold transition-colors disabled:opacity-60 ${
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
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      width="full"
      loading={pending}
      loadingText="Menyimpan..."
    >
      Simpan & lanjut ke dashboard
    </Button>
  );
}

export function OnboardingForm({
  action,
  defaultGoal = 3,
  userName,
  trendCount,
}: OnboardingFormProps) {
  const [goal, setGoal] = useState(defaultGoal);

  return (
    <form action={action} className="mt-6 flex flex-col gap-5">
      <input type="hidden" name="weeklyGoal" value={goal} />

      <section className="rounded-2xl border border-border bg-paper p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Profil konten
        </p>
        <ul className="mt-3 space-y-2 text-sm text-ink">
          <li className="flex justify-between gap-3">
            <span className="text-ink-muted">Creator</span>
            <span className="font-medium">{userName ?? "Kamu"}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-ink-muted">Platform</span>
            <span className="font-medium">TikTok</span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-ink-muted">Niche</span>
            <span className="font-medium">Couple Date Ideas</span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-ink-muted">Tren mock siap</span>
            <span className="font-medium text-sage">{trendCount} ide</span>
          </li>
        </ul>
      </section>

      <section>
        <p className="text-sm font-medium text-ink">Berapa konten per minggu?</p>
        <p className="mt-1 text-sm text-ink-muted">
          Pilih target yang realistis supaya planner minggu ini terisi.
        </p>
        <GoalPicker goal={goal} onSelect={setGoal} />
        <p className="mt-3 text-center text-sm text-ink-muted">
          Target:{" "}
          <span className="font-semibold text-ink">{goal} konten / minggu</span>
        </p>
      </section>

      <SubmitButton />
    </form>
  );
}
