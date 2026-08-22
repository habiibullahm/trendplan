import { redirect } from "next/navigation";
import { completeOnboardingAction } from "@/features/auth/actions/onboarding";
import { OnboardingForm } from "@/features/auth/components/onboarding-form";
import { prisma } from "@/lib/prisma";
import { gateAppUser } from "@/lib/auth/require-app-user";
import {
  safeAuthCallbackUrl,
  withAuthCallbackQuery,
} from "@/lib/auth/callback-url";
import {
  getSafeSession,
  redirectToLoginClearingSession,
} from "@/lib/auth/session";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function OnboardingPage({
  searchParams,
}: Readonly<Props>) {
  const session = await getSafeSession();
  if (!session?.user) redirectToLoginClearingSession();

  const { callbackUrl: rawCallback } = await searchParams;
  const callbackUrl = safeAuthCallbackUrl(rawCallback);

  const gate = await gateAppUser();
  if (!gate.ok) {
    if (gate.kind === "unverified") {
      redirect(withAuthCallbackQuery("/verify-email", callbackUrl));
    }
    redirectToLoginClearingSession();
  }

  if (session.user.onboardingComplete) {
    redirect(callbackUrl ?? "/dashboard");
  }

  const trendCount = await prisma.trend.count();

  async function submitOnboarding(formData: FormData) {
    "use server";
    await completeOnboardingAction(formData);
    const next = safeAuthCallbackUrl(String(formData.get("callbackUrl") ?? ""));
    redirect(next ?? "/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-ink-muted">Selamat datang di TrendPlan</p>
        <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
          Atur rencana konten kamu
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Pilih niche utama dulu — rekomendasi mengikuti pilihanmu. Di Tren kamu
          tetap bisa jelajahi katalog ide semua niche.
        </p>

        <OnboardingForm
          action={submitOnboarding}
          defaultGoal={3}
          defaultNiche={null}
          userName={session.user.name}
          trendCount={trendCount}
          callbackUrl={callbackUrl}
        />
      </div>
    </main>
  );
}
