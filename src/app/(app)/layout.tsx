import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
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
