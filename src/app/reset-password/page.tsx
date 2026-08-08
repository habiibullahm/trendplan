import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { isTransactionalEmailEnabled } from "@/lib/auth/env";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
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
        <p className="mt-2 text-sm text-muted-foreground">Atur password baru</p>
      </div>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Tautan reset tidak lengkap.{" "}
          {emailEnabled ? (
            <Link href="/forgot-password" className="font-semibold text-primary">
              Minta tautan baru
            </Link>
          ) : (
            <Link href="/login" className="font-semibold text-primary">
              Kembali ke masuk
            </Link>
          )}
        </p>
      )}
    </AuthShell>
  );
}
