import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PasswordUpgradeToast } from "@/features/auth/components/password-upgrade-nudge";
import { prisma } from "@/lib/prisma";
import { gateAppUser } from "@/lib/auth/require-app-user";
import {
  getSafeSession,
  redirectToLoginClearingSession,
} from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSafeSession();
  if (!session?.user?.id) redirectToLoginClearingSession();

  const gate = await gateAppUser();
  if (!gate.ok) {
    if (gate.kind === "unverified") redirect("/verify-email");
    redirectToLoginClearingSession();
  }

  const user = await prisma.user.findUnique({
    where: { id: gate.userId },
    select: {
      id: true,
      onboardingComplete: true,
      passwordNeedsUpgrade: true,
    },
  });

  // Session cookie exists but user row was deleted/reset
  if (!user) redirectToLoginClearingSession();

  if (!user.onboardingComplete) redirect("/onboarding");

  return (
    <AppShell>
      {user.passwordNeedsUpgrade ? <PasswordUpgradeToast /> : null}
      {children}
    </AppShell>
  );
}
