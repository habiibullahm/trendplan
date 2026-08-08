import Link from "next/link";
import { LoginForm } from "@/features/auth/components/auth-forms";
import { AuthShell } from "@/features/auth/components/auth-shell";

type Props = {
  searchParams: Promise<{ verified?: string; registered?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { verified, registered } = await searchParams;

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
          Masuk ke akun creator kamu
        </p>
      </div>
      {verified === "1" ? (
        <p className="mb-4 rounded-xl bg-muted px-3 py-2 text-center text-sm text-foreground ring-1 ring-border">
          Email berhasil diverifikasi. Silakan masuk.
        </p>
      ) : null}
      {registered === "1" ? (
        <p className="mb-4 rounded-xl bg-muted px-3 py-2 text-center text-sm text-foreground ring-1 ring-border">
          Daftar berhasil. Silakan masuk.
        </p>
      ) : null}
      <LoginForm />
    </AuthShell>
  );
}
