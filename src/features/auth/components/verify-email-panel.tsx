"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  resendVerificationEmailAction,
  verifyEmailAction,
  type EmailVerificationState,
} from "@/features/auth/actions/email-verification";
import { Button } from "@/components/ui/button";
import { useActionToasts } from "@/hooks/use-action-toasts";
import {
  idleActionResult,
  isCompletedActionSuccess,
} from "@/lib/action-result";

const initial: EmailVerificationState = idleActionResult;

export function VerifyEmailPanel({
  token,
  alreadyVerified,
  canResend,
  callbackUrl,
}: {
  token?: string;
  alreadyVerified: boolean;
  canResend: boolean;
  callbackUrl?: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyEmailAction,
    initial,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendVerificationEmailAction,
    initial,
  );
  useActionToasts(verifyState);
  useActionToasts(resendState);

  useEffect(() => {
    if (!token || alreadyVerified || submittedRef.current) return;
    submittedRef.current = true;
    formRef.current?.requestSubmit();
  }, [token, alreadyVerified]);

  if (alreadyVerified || isCompletedActionSuccess(verifyState)) {
    return (
      <p className="text-sm text-ink-muted">
        Email sudah diverifikasi.{" "}
        {canResend
          ? "Muat ulang atau buka Beranda untuk lanjut."
          : "Silakan masuk untuk lanjut."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">
        {token
          ? "Memproses tautan verifikasi…"
          : "Kami mengirim tautan verifikasi ke email kamu. Belum menerima?"}
      </p>

      {token ? (
        <form ref={formRef} action={verifyAction} className="hidden">
          <input type="hidden" name="token" value={token} />
          {callbackUrl ? (
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
          ) : null}
          <button type="submit">Verifikasi</button>
        </form>
      ) : null}

      {token && verifyPending ? (
        <p className="text-sm text-ink-muted">Memverifikasi tautan…</p>
      ) : null}
      {verifyState.status === "error" && verifyState.message ? (
        <p className="text-sm text-coral">{verifyState.message}</p>
      ) : null}

      {canResend ? (
        <form action={resendAction}>
          <Button
            type="submit"
            width="full"
            loading={resendPending}
            loadingText="Mengirim..."
          >
            Kirim ulang email
          </Button>
        </form>
      ) : (
        <p className="text-center text-sm text-ink-muted">
          Sudah punya akun? Masuk dulu jika perlu kirim ulang verifikasi.
        </p>
      )}
    </div>
  );
}
