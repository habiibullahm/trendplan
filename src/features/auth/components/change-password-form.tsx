"use client";

import { useActionState, useState } from "react";
import {
  changePasswordAction,
  type PasswordActionState,
} from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import { ChipButton } from "@/components/ui/chip-button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useActionToasts } from "@/hooks/use-action-toasts";

const initial: PasswordActionState = {};

export function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    changePasswordAction,
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
        <span className="text-sm text-ink-muted">Password</span>
        <ChipButton
          variant="ghost"
          disabled={pending}
          onClick={() => setOpen(true)}
        >
          Ubah
        </ChipButton>
      </div>

      <Modal
        open={open}
        onClose={onClose}
        title="Ubah password"
        size="sm"
      >
        <form action={action} className="flex flex-col gap-3">
          <FormField
            label="Password saat ini"
            error={state.fieldErrors?.currentPassword}
          >
            <Input
              name="currentPassword"
              type="password"
              required
              maxLength={128}
              autoComplete="current-password"
              placeholder="Password saat ini"
            />
          </FormField>
          <FormField
            label="Password baru"
            error={state.fieldErrors?.newPassword}
          >
            <Input
              name="newPassword"
              type="password"
              required
              minLength={10}
              maxLength={128}
              autoComplete="new-password"
              placeholder="Minimal 10 karakter"
            />
          </FormField>
          <FormField
            label="Konfirmasi password baru"
            error={state.fieldErrors?.confirmPassword}
          >
            <Input
              name="confirmPassword"
              type="password"
              required
              minLength={10}
              maxLength={128}
              autoComplete="new-password"
              placeholder="Ulangi password baru"
            />
          </FormField>
          <Button
            type="submit"
            width="full"
            loading={pending}
            loadingText="Menyimpan..."
          >
            Perbarui password
          </Button>
        </form>
      </Modal>
    </>
  );
}
