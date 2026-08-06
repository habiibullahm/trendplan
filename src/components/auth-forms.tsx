"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  loginAction,
  registerAction,
  type AuthFormState,
} from "@/app/actions/auth";

const initialState: AuthFormState = {};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-sm text-coral">{messages[0]}</p>;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      {state.error ? (
        <p className="rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
          {state.error}
        </p>
      ) : null}

      <label className="block text-left">
        <span className="text-sm font-medium text-ink">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 min-touch w-full rounded-xl border border-border bg-surface px-3 text-ink outline-none focus:border-coral"
          placeholder="nama@email.com"
        />
        <FieldError messages={state.fieldErrors?.email} />
      </label>

      <label className="block text-left">
        <span className="text-sm font-medium text-ink">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 min-touch w-full rounded-xl border border-border bg-surface px-3 text-ink outline-none focus:border-coral"
          placeholder="Minimal 6 karakter"
        />
        <FieldError messages={state.fieldErrors?.password} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="min-touch mt-2 inline-flex items-center justify-center rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Masuk..." : "Masuk"}
      </button>

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

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      {state.error ? (
        <p className="rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
          {state.error}
        </p>
      ) : null}

      <label className="block text-left">
        <span className="text-sm font-medium text-ink">Nama</span>
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-1 min-touch w-full rounded-xl border border-border bg-surface px-3 text-ink outline-none focus:border-coral"
          placeholder="Nama panggilan"
        />
        <FieldError messages={state.fieldErrors?.name} />
      </label>

      <label className="block text-left">
        <span className="text-sm font-medium text-ink">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 min-touch w-full rounded-xl border border-border bg-surface px-3 text-ink outline-none focus:border-coral"
          placeholder="nama@email.com"
        />
        <FieldError messages={state.fieldErrors?.email} />
      </label>

      <label className="block text-left">
        <span className="text-sm font-medium text-ink">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 min-touch w-full rounded-xl border border-border bg-surface px-3 text-ink outline-none focus:border-coral"
          placeholder="Minimal 6 karakter"
        />
        <FieldError messages={state.fieldErrors?.password} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="min-touch mt-2 inline-flex items-center justify-center rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Mendaftar..." : "Daftar"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-coral">
          Masuk
        </Link>
      </p>
    </form>
  );
}
