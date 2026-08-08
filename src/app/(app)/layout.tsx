import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { PasswordUpgradeToast } from "@/features/auth/components/password-upgrade-nudge";
import { prisma } from "@/lib/prisma";
import { gateAppUser } from "@/lib/require-app-user";
import { getSafeSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");

  const gate = await gateAppUser();
  if (!gate.ok) {
    if (gate.kind === "unverified") redirect("/verify-email");
    await signOut({ redirectTo: "/login" });
    redirect("/login");
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
  if (!user) {
    await signOut({ redirectTo: "/login" });
    redirect("/login");
  }

  if (!user.onboardingComplete) redirect("/onboarding");

  return (
    <AppShell>
      {user.passwordNeedsUpgrade ? <PasswordUpgradeToast /> : null}
      {children}
    </AppShell>
  );
}
