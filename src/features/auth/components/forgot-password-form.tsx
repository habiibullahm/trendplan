"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordResetAction,
  type PasswordActionState,
} from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useActionToasts } from "@/hooks/use-action-toasts";

const initial: PasswordActionState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initial,
  );
  useActionToasts(state);

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <FormField label="Email" error={state.fieldErrors?.email}>
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="nama@email.com"
        />
      </FormField>
      <Button
        type="submit"
        width="full"
        loading={pending}
        loadingText="Mengirim..."
      >
        Kirim tautan reset
      </Button>
      {state.success ? (
        <p className="rounded-xl border border-border bg-paper px-3 py-2 text-center text-sm text-ink">
          {state.success}
          {process.env.NODE_ENV === "development" ? (
            <span className="mt-1 block text-xs text-ink-muted">
              Lokal tanpa Resend: cek terminal server untuk tautan reset.
            </span>
          ) : null}
        </p>
      ) : null}
      {state.error ? (
        <p className="text-center text-sm text-coral">{state.error}</p>
      ) : null}
      <p className="text-center text-sm text-ink-muted">
        <Link href="/login" className="font-semibold text-coral">
          Kembali ke masuk
        </Link>
      </p>
    </form>
  );
}
