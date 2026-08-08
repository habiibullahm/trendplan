import { redirect } from "next/navigation";
import { completeOnboardingAction } from "@/app/actions/onboarding";
import { OnboardingForm } from "@/features/auth/components/onboarding-form";
import { prisma } from "@/lib/prisma";
import { DEFAULT_NICHE } from "@/lib/niches";
import { gateAppUser } from "@/lib/require-app-user";
import { getSafeSession } from "@/lib/session";
import { signOut } from "@/auth";

export default async function OnboardingPage() {
  const session = await getSafeSession();
  if (!session?.user) redirect("/login");

  const gate = await gateAppUser();
  if (!gate.ok) {
    if (gate.kind === "unverified") redirect("/verify-email");
    await signOut({ redirectTo: "/login" });
    redirect("/login");
  }

  if (session.user.onboardingComplete) redirect("/dashboard");

  const trendCount = await prisma.trend.count();

  async function submitOnboarding(formData: FormData) {
    "use server";
    await completeOnboardingAction(formData);
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-ink-muted">Selamat datang di TrendPlan</p>
        <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
          Atur rencana konten kamu
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Pilih niche utama untuk rekomendasi personal. Di Tren kamu tetap bisa
          jelajahi FYP mock semua niche.
        </p>

        <OnboardingForm
          action={submitOnboarding}
          defaultGoal={3}
          defaultNiche={DEFAULT_NICHE}
          userName={session.user.name}
          trendCount={trendCount}
        />
      </div>
    </main>
  );
}
