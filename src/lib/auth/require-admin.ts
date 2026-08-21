import "server-only";

import { notFound } from "next/navigation";
import { isAdminEmail } from "@/lib/auth/admin";
import { gateAppUser } from "@/lib/auth/require-app-user";
import { prisma } from "@/lib/prisma";

/** Gate /admin/* pages: DB email allowlisted or 404. */
export async function requireAdminPage(): Promise<{
  userId: string;
  email: string;
}> {
  const gate = await gateAppUser();
  if (!gate.ok) notFound();

  const user = await prisma.user.findUnique({
    where: { id: gate.userId },
    select: { email: true },
  });
  if (!isAdminEmail(user?.email)) notFound();

  return { userId: gate.userId, email: user!.email.trim().toLowerCase() };
}
