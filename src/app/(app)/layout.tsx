import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { AppShell } from "@/components/app-shell";
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
    select: { id: true, onboardingComplete: true },
  });

  // Session cookie exists but user row was deleted/reset
  if (!user) {
    await signOut({ redirectTo: "/login" });
    redirect("/login");
  }

  if (!user.onboardingComplete) redirect("/onboarding");

  return <AppShell>{children}</AppShell>;
}
