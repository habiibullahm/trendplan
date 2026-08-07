import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/auth-forms";

export default function RegisterPage() {
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
            Daftar gratis — niche Couple Date Ideas
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
