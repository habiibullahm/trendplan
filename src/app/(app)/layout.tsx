import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PasswordUpgradeToast } from "@/features/auth/components/password-upgrade-nudge";
import { gateAppUser } from "@/lib/auth/require-app-user";
import { redirectToLoginClearingSession } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const gate = await gateAppUser();
  if (!gate.ok) {
    if (gate.kind === "unverified") redirect("/verify-email");
    redirectToLoginClearingSession();
  }

  if (!gate.onboardingComplete) redirect("/onboarding");

  return (
    <AppShell>
      {gate.passwordNeedsUpgrade ? <PasswordUpgradeToast /> : null}
      {children}
    </AppShell>
  );
}
