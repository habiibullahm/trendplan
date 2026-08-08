import Link from "next/link";
import { LoginForm } from "@/features/auth/components/auth-forms";

type Props = {
  searchParams: Promise<{ verified?: string; registered?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { verified, registered } = await searchParams;

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
          <p className="mt-2 text-sm text-ink-muted">Masuk ke akun creator kamu</p>
        </div>
        {verified === "1" ? (
          <p className="mb-4 rounded-xl border border-border bg-paper px-3 py-2 text-center text-sm text-ink">
            Email berhasil diverifikasi. Silakan masuk.
          </p>
        ) : null}
        {registered === "1" ? (
          <p className="mb-4 rounded-xl border border-border bg-paper px-3 py-2 text-center text-sm text-ink">
            Daftar berhasil. Silakan masuk.
          </p>
        ) : null}
        <LoginForm />
      </div>
    </main>
  );
}
