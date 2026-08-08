import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { isTransactionalEmailEnabled } from "@/lib/auth-env";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
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
          <p className="mt-2 text-sm text-ink-muted">Atur password baru</p>
        </div>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-center text-sm text-ink-muted">
            Tautan reset tidak lengkap.{" "}
            {emailEnabled ? (
              <Link href="/forgot-password" className="font-semibold text-coral">
                Minta tautan baru
              </Link>
            ) : (
              <Link href="/login" className="font-semibold text-coral">
                Kembali ke masuk
              </Link>
            )}
          </p>
        )}
      </div>
    </main>
  );
}
