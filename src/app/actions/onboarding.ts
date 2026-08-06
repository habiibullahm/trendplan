"use server";

import { revalidatePath } from "next/cache";
import { auth, unstable_update } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function completeOnboardingAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const raw = Number(formData.get("weeklyGoal"));
  const weeklyGoal = Number.isFinite(raw)
    ? Math.min(7, Math.max(1, Math.round(raw)))
    : 3;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      weeklyGoal,
      niche: "Couple Date Ideas",
      onboardingComplete: true,
    },
  });

  await unstable_update({
    user: {
      onboardingComplete: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
}
