"use client";

import { useActionState } from "react";
import {
  resetPasswordAction,
  type PasswordActionState,
} from "@/features/auth/actions/password";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useActionToasts } from "@/hooks/use-action-toasts";

const initial: PasswordActionState = { status: "success" };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    initial,
  );
  useActionToasts(state);

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <FormField label="Password baru" error={state.data?.fieldErrors?.newPassword}>
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
        label="Konfirmasi password"
        error={state.data?.fieldErrors?.confirmPassword}
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
        Simpan password baru
      </Button>
    </form>
  );
}
