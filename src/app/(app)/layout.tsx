import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { PasswordUpgradeToast } from "@/features/auth/components/password-upgrade-nudge";
import { prisma } from "@/lib/prisma";
import { getSafeSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSafeSession();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      onboardingComplete: true,
      passwordNeedsUpgrade: true,
      passwordVersion: true,
    },
  });

  if (!user) {
    await signOut({ redirectTo: "/login" });
    redirect("/login");
  }

  // Invalidate sessions after password reset/change (Node auth also checks JWT).
  const tokenVersion =
    typeof session.user.passwordVersion === "number"
      ? session.user.passwordVersion
      : 0;
  if (user.passwordVersion !== tokenVersion) {
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
