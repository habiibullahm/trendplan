import "server-only";

import { notFound } from "next/navigation";
import { isAdminEmail } from "@/lib/auth/admin";
import { gateAppUser } from "@/lib/auth/require-app-user";
import { getSafeSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

/** Gate /admin/* pages: allowlisted email or 404. Prefer session email (no extra DB). */
export async function requireAdminPage(): Promise<{
  userId: string;
  email: string;
}> {
  const gate = await gateAppUser();
  if (!gate.ok) notFound();

  const session = await getSafeSession();
  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  if (sessionEmail && isAdminEmail(sessionEmail)) {
    return { userId: gate.userId, email: sessionEmail };
  }

  const user = await prisma.user.findUnique({
    where: { id: gate.userId },
    select: { email: true },
  });
  if (!isAdminEmail(user?.email)) notFound();

  return { userId: gate.userId, email: user!.email.trim().toLowerCase() };
}
