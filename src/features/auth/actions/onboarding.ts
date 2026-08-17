"use server";

import { revalidatePath } from "next/cache";
import { unstable_update } from "@/auth";
import {
  actionFail,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { isNiche } from "@/lib/niches";
import { gateAppUser, requireAppUserAction } from "@/lib/auth/require-app-user";

export async function completeOnboardingAction(formData: FormData) {
  const gate = await gateAppUser();
  if (!gate.ok) {
    throw new Error("Unauthorized");
  }

  const raw = Number(formData.get("weeklyGoal"));
  const weeklyGoal = Number.isFinite(raw)
    ? Math.min(7, Math.max(1, Math.round(raw)))
    : 3;

  const nicheRaw = String(formData.get("niche") ?? "");
  if (!isNiche(nicheRaw)) {
    throw new Error("Pilih niche yang valid.");
  }
  const niche = nicheRaw;

  await prisma.user.update({
    where: { id: gate.userId },
    data: {
      weeklyGoal,
      niche,
      onboardingComplete: true,
    },
  });

  await unstable_update({});

  revalidatePath("/dashboard");
  revalidatePath("/tren");
  revalidatePath("/rekomendasi");
  revalidatePath("/onboarding");
}

export type WeeklyGoalActionState = ActionResult;

/** Update weekly content goal from Akun (does not touch onboarding flag). */
export async function updateWeeklyGoalAction(
  _prev: WeeklyGoalActionState,
  formData: FormData,
): Promise<WeeklyGoalActionState> {
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;

  const raw = Number(formData.get("weeklyGoal"));
  if (!Number.isInteger(raw) || raw < 1 || raw > 7) {
    return actionFail("invalid_weekly_goal", {
      error: "Pilih target 1–7.",
    });
  }

  try {
    await prisma.user.update({
      where: { id: gated.userId },
      data: { weeklyGoal: raw },
    });
  } catch {
    return actionFail("save_goal_failed", {
      error: "Gagal menyimpan target. Coba lagi.",
    });
  }

  revalidatePath("/akun");
  revalidatePath("/dashboard");
  revalidatePath("/planner");
  return actionSuccess(`Target ${raw} ide / minggu`);
}

export type NicheActionState = ActionResult;

/** Update content niche from Akun — retargets untukmu + Tren default filter. */
export async function updateNicheAction(
  _prev: NicheActionState,
  formData: FormData,
): Promise<NicheActionState> {
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;

  const nicheRaw = String(formData.get("niche") ?? "");
  if (!isNiche(nicheRaw)) {
    return actionFail("invalid_niche", {
      error: "Pilih niche yang valid.",
    });
  }

  try {
    await prisma.user.update({
      where: { id: gated.userId },
      data: { niche: nicheRaw },
    });
  } catch {
    return actionFail("save_niche_failed", {
      error: "Gagal menyimpan niche. Coba lagi.",
    });
  }

  revalidatePath("/akun");
  revalidatePath("/dashboard");
  revalidatePath("/tren");
  revalidatePath("/rekomendasi");
  return actionSuccess(`Niche: ${nicheRaw}`);
}
