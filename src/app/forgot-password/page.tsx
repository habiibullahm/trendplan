import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { isTransactionalEmailEnabled } from "@/lib/auth-env";

export default function ForgotPasswordPage() {
  const emailEnabled = isTransactionalEmailEnabled();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-none">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink"
          >
            TrendPlan
          </Link>
          <p className="mt-2 text-sm text-ink-muted">
            {emailEnabled
              ? "Kirim tautan reset password ke email kamu"
              : "Reset password via email belum aktif"}
          </p>
        </div>
        {emailEnabled ? (
          <ForgotPasswordForm />
        ) : (
          <div className="flex flex-col gap-4">
            <p className="rounded-xl border border-border bg-paper px-3 py-2 text-center text-sm text-ink">
              Fitur lupa password lewat email dinonaktifkan sampai domain
              pengirim Resend diverifikasi. Setelah masuk, ubah password dari
              menu Akun.
            </p>
            <p className="text-center text-sm text-ink-muted">
              <Link href="/login" className="font-semibold text-coral">
                Kembali ke masuk
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
