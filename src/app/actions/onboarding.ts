"use server";

import { revalidatePath } from "next/cache";
import { auth, unstable_update } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_NICHE, isNiche } from "@/lib/niches";

export async function completeOnboardingAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const raw = Number(formData.get("weeklyGoal"));
  const weeklyGoal = Number.isFinite(raw)
    ? Math.min(7, Math.max(1, Math.round(raw)))
    : 3;

  const nicheRaw = String(formData.get("niche") ?? "");
  const niche = isNiche(nicheRaw) ? nicheRaw : DEFAULT_NICHE;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      weeklyGoal,
      niche,
      onboardingComplete: true,
    },
  });

  await unstable_update({
    user: {
      onboardingComplete: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/tren");
  revalidatePath("/rekomendasi");
  revalidatePath("/onboarding");
}

export type WeeklyGoalActionState = {
  error?: string;
  success?: string;
};

/** Update weekly content goal from Akun (does not touch onboarding flag). */
export async function updateWeeklyGoalAction(
  _prev: WeeklyGoalActionState,
  formData: FormData,
): Promise<WeeklyGoalActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sesi berakhir. Masuk lagi." };
  }

  const raw = Number(formData.get("weeklyGoal"));
  if (!Number.isInteger(raw) || raw < 1 || raw > 7) {
    return { error: "Pilih target 1–7." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { weeklyGoal: raw },
    });
  } catch {
    return { error: "Gagal menyimpan target. Coba lagi." };
  }

  revalidatePath("/akun");
  revalidatePath("/dashboard");
  revalidatePath("/planner");
  return { success: `Target ${raw} ide / minggu` };
}

export type NicheActionState = {
  error?: string;
  success?: string;
};

/** Update content niche from Akun — retargets untukmu + Tren default filter. */
export async function updateNicheAction(
  _prev: NicheActionState,
  formData: FormData,
): Promise<NicheActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sesi berakhir. Masuk lagi." };
  }

  const nicheRaw = String(formData.get("niche") ?? "");
  if (!isNiche(nicheRaw)) {
    return { error: "Pilih niche yang valid." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { niche: nicheRaw },
    });
  } catch {
    return { error: "Gagal menyimpan niche. Coba lagi." };
  }

  revalidatePath("/akun");
  revalidatePath("/dashboard");
  revalidatePath("/tren");
  revalidatePath("/rekomendasi");
  return { success: `Niche: ${nicheRaw}` };
}
