"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  loginAction,
  registerAction,
  type AuthFormState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useActionToasts } from "@/hooks/use-action-toasts";
import { isTransactionalEmailEnabled } from "@/lib/auth-env";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  useActionToasts(state);
  const showForgotPassword = isTransactionalEmailEnabled();

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

      <FormField label="Password" error={state.fieldErrors?.password}>
        <Input
          name="password"
          type="password"
          required
          maxLength={128}
          autoComplete="current-password"
          placeholder="Password"
        />
      </FormField>

      <Button
        type="submit"
        width="full"
        className="mt-2"
        loading={pending}
        loadingText="Masuk..."
      >
        Masuk
      </Button>

      {showForgotPassword ? (
        <p className="text-center text-sm text-ink-muted">
          <Link href="/forgot-password" className="font-semibold text-coral">
            Lupa password?
          </Link>
        </p>
      ) : null}

      <p className="text-center text-sm text-ink-muted">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-coral">
          Daftar
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  useActionToasts(state);

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <FormField label="Nama" error={state.fieldErrors?.name}>
        <Input
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Nama panggilan"
        />
      </FormField>

      <FormField label="Email" error={state.fieldErrors?.email}>
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="nama@email.com"
        />
      </FormField>

      <FormField label="Password" error={state.fieldErrors?.password}>
        <Input
          name="password"
          type="password"
          required
          minLength={10}
          maxLength={128}
          autoComplete="new-password"
          placeholder="Minimal 10 karakter"
        />
      </FormField>

      <Button
        type="submit"
        width="full"
        className="mt-2"
        loading={pending}
        loadingText="Mendaftar..."
      >
        Daftar
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-coral">
          Masuk
        </Link>
      </p>
    </form>
  );
}
