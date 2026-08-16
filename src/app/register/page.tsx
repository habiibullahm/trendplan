import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/auth-forms";
import { safeAuthCallbackUrl } from "@/lib/auth/callback-url";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;
  const safeCallback = safeAuthCallbackUrl(callbackUrl) ?? undefined;

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
            Daftar gratis — atur niche & target mingguan setelah masuk.
          </p>
        </div>
        <RegisterForm callbackUrl={safeCallback} />
      </div>
    </main>
  );
}
