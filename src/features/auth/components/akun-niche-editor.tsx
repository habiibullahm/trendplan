"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateNicheAction,
  type NicheActionState,
} from "@/features/auth/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useActionToasts } from "@/hooks/use-action-toasts";
import { NICHES, resolveNiche, type Niche } from "@/lib/niches";

const initial: NicheActionState = {};

function SaveNicheButton() {
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

function NichePicker({
  niche,
  onSelect,
}: {
  niche: Niche;
  onSelect: (value: Niche) => void;
}) {
  const { pending } = useFormStatus();

  return (
    <ToggleGroup
      className="w-full"
      orientation="vertical"
      variant="outline"
      size="lg"
      disabled={pending}
      value={[niche]}
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

export function AkunNicheEditor({ niche }: { niche: string }) {
  const current = resolveNiche(niche);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Niche>(current);
  const [state, action, pending] = useActionState(
    async (prev: NicheActionState, formData: FormData) => {
      const next = await updateNicheAction(prev, formData);
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
        <span className="text-sm text-ink-muted">Niche</span>
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink">
            {current}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => {
              setSelected(current);
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
        title="Ubah niche"
        description="Ganti niche untuk jelajahi tren lain. Konten di Planner tetap."
        size="sm"
      >
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="niche" value={selected} />
          <NichePicker niche={selected} onSelect={setSelected} />
          <SaveNicheButton />
        </form>
      </Modal>
    </>
  );
}
