import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.onboardingComplete ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <p className="font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-tight text-ink">
          TrendPlan
        </p>
        <p className="mt-3 text-base text-ink-muted">
          Rencana konten TikTok kamu, tiap minggu — niche Couple Date Ideas.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="min-touch inline-flex items-center justify-center rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-white"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="min-touch inline-flex items-center justify-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink"
          >
            Daftar
          </Link>
        </div>
      </div>
    </main>
  );
}
