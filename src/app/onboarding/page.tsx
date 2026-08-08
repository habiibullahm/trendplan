import { redirect } from "next/navigation";
import { completeOnboardingAction } from "@/features/auth/actions/onboarding";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { OnboardingForm } from "@/features/auth/components/onboarding-form";
import { prisma } from "@/lib/prisma";
import { gateAppUser } from "@/lib/auth/require-app-user";
import {
  getSafeSession,
  redirectToLoginClearingSession,
} from "@/lib/auth/session";

export default async function OnboardingPage() {
  const session = await getSafeSession();
  if (!session?.user) redirectToLoginClearingSession();

  const gate = await gateAppUser();
  if (!gate.ok) {
    if (gate.kind === "unverified") redirect("/verify-email");
    redirectToLoginClearingSession();
  }

  if (session.user.onboardingComplete) redirect("/dashboard");

  const trendCount = await prisma.trend.count();

  async function submitOnboarding(formData: FormData) {
    "use server";
    await completeOnboardingAction(formData);
    redirect("/dashboard");
  }

  return (
    <AuthShell>
      <p className="text-sm text-muted-foreground">Selamat datang di TrendPlan</p>
      <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-foreground">
        Atur rencana konten kamu
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pilih niche utama dulu — rekomendasi mengikuti pilihanmu. Di Tren kamu
        tetap bisa jelajahi FYP mock semua niche.
      </p>

      <OnboardingForm
        action={submitOnboarding}
        defaultGoal={3}
        defaultNiche={null}
        userName={session.user.name}
        trendCount={trendCount}
      />
    </AuthShell>
  );
}
