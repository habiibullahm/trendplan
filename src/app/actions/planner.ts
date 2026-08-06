"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ContentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateWeekPlan, requireUserId } from "@/lib/planner";

const daySchema = z.coerce.number().int().min(0).max(6);
const statusSchema = z.enum(["IDE", "DRAFT", "READY", "POSTED"]);

function revalidatePlanner() {
  revalidatePath("/planner");
  revalidatePath("/dashboard");
  revalidatePath("/riwayat");
  revalidatePath("/tren");
  revalidatePath("/rekomendasi");
}

export type PlannerActionState = {
  error?: string;
  success?: string;
};

export async function addTrendToPlannerAction(
  _prev: PlannerActionState,
  formData: FormData,
): Promise<PlannerActionState> {
  const userId = await requireUserId();
  const trendId = String(formData.get("trendId") ?? "");
  const dayParsed = daySchema.safeParse(formData.get("dayOfWeek"));

  if (!trendId || !dayParsed.success) {
    return { error: "Pilih hari yang valid." };
  }

  const trend = await prisma.trend.findUnique({ where: { id: trendId } });
  if (!trend) return { error: "Tren tidak ditemukan." };

  const weekPlan = await getOrCreateWeekPlan(userId);
  const existing = weekPlan.items.find((i) => i.dayOfWeek === dayParsed.data);
  if (existing) {
    return { error: "Hari itu sudah ada ide — pilih hari lain." };
  }

  await prisma.contentItem.create({
    data: {
      weekPlanId: weekPlan.id,
      dayOfWeek: dayParsed.data,
      title: trend.title,
      hook: trend.hook,
      status: ContentStatus.IDE,
      trendId: trend.id,
      hashtags: "#coupledate #dateideas #tiktok",
    },
  });

  revalidatePlanner();
  return { success: "Ide ditambahkan ke planner." };
}

export async function updateContentItemAction(
  _prev: PlannerActionState,
  formData: FormData,
): Promise<PlannerActionState> {
  const userId = await requireUserId();
  const itemId = String(formData.get("itemId") ?? "");
  const statusParsed = statusSchema.safeParse(formData.get("status"));

  if (!itemId || !statusParsed.success) {
    return { error: "Data tidak valid." };
  }

  const item = await prisma.contentItem.findFirst({
    where: { id: itemId, weekPlan: { userId } },
  });
  if (!item) return { error: "Konten tidak ditemukan." };

  await prisma.contentItem.update({
    where: { id: itemId },
    data: {
      caption: String(formData.get("caption") ?? "").trim() || null,
      hashtags: String(formData.get("hashtags") ?? "").trim() || null,
      performanceNote:
        String(formData.get("performanceNote") ?? "").trim() || null,
      status: statusParsed.data,
    },
  });

  revalidatePlanner();
  revalidatePath(`/planner/${itemId}`);
  return { success: "Perubahan disimpan." };
}

export async function deleteContentItemAction(formData: FormData) {
  const userId = await requireUserId();
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) return;

  await prisma.contentItem.deleteMany({
    where: { id: itemId, weekPlan: { userId } },
  });

  revalidatePlanner();
  redirect("/planner");
}
