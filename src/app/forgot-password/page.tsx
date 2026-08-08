import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { isTransactionalEmailEnabled } from "@/lib/auth/env";

export default function ForgotPasswordPage() {
  const emailEnabled = isTransactionalEmailEnabled();

  return (
    <AuthShell>
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-foreground"
        >
          TrendPlan
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">
          {emailEnabled
            ? "Kirim tautan reset password ke email kamu"
            : "Reset password via email belum aktif"}
        </p>
      </div>
      {emailEnabled ? (
        <ForgotPasswordForm />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="rounded-xl bg-muted px-3 py-2 text-center text-sm text-foreground ring-1 ring-border">
            Fitur lupa password lewat email dinonaktifkan sampai domain pengirim
            Resend diverifikasi. Setelah masuk, ubah password dari menu Akun.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-semibold text-primary">
              Kembali ke masuk
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
