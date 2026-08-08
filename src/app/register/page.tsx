import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/auth-forms";
import { AuthShell } from "@/features/auth/components/auth-shell";

export default function RegisterPage() {
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
          Daftar gratis — atur niche & target mingguan setelah masuk.
        </p>
      </div>
      <RegisterForm />
    </AuthShell>
  );
}
