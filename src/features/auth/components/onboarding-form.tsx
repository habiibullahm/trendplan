"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { NICHES, type Niche } from "@/lib/niches";

const GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

type OnboardingFormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultGoal?: number;
  /** Omit or null = no niche preselected (user must choose). */
  defaultNiche?: Niche | null;
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
    <ToggleGroup
      className="mt-3 grid w-full grid-cols-7 gap-2"
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

function NichePicker({
  niche,
  onSelect,
}: {
  niche: Niche | null;
  onSelect: (value: Niche) => void;
}) {
  const { pending } = useFormStatus();

  return (
    <ToggleGroup
      className="mt-3 w-full"
      orientation="vertical"
      variant="outline"
      size="lg"
      disabled={pending}
      value={niche ? [niche] : []}
      onValueChange={(next) => {
        const value = next[0];
        if (value && NICHES.includes(value as Niche)) {
          onSelect(value as Niche);
        }
      }}
    >
      {NICHES.map((value) => (
        <ToggleGroupItem key={value} value={value}>
          {value}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      width="full"
      disabled={disabled}
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
  defaultNiche = null,
  userName,
  trendCount,
}: OnboardingFormProps) {
  const [goal, setGoal] = useState(defaultGoal);
  const [niche, setNiche] = useState<Niche | null>(defaultNiche);

  return (
    <form action={action} className="mt-6 flex flex-col gap-5">
      <input type="hidden" name="weeklyGoal" value={goal} />
      <input type="hidden" name="niche" value={niche ?? ""} />

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
            <span className="font-medium">{niche ?? "—"}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-ink-muted">Tren mock siap</span>
            <span className="font-medium text-sage">{trendCount} ide</span>
          </li>
        </ul>
      </section>

      <section>
        <p className="text-sm font-medium text-ink">Pilih niche utama</p>
        <p className="mt-1 text-sm text-ink-muted">
          Rekomendasi untukmu mengikuti niche ini. Di Tren kamu tetap bisa lihat
          semua niche.
        </p>
        <NichePicker niche={niche} onSelect={setNiche} />
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

      <SubmitButton disabled={!niche} />
    </form>
  );
}
