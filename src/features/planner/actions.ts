"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ContentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateWeekPlan, requireUserId } from "@/features/planner/lib/planner";
import { suggestCaption, suggestHashtags } from "@/features/planner/lib/export-text";
import {
  isParkedSoftDeleteDay,
  parkDayOfWeek,
  unparkDayOfWeek,
} from "@/features/planner/lib/soft-delete";
import { resolveStatusUpdate } from "@/lib/labels";
import { getWeekStart, parseWeekStartParam, plannerHref } from "@/lib/week";

const daySchema = z.coerce.number().int().min(0).max(6);
const statusSchema = z.enum(["IDE", "POSTED"]);
const titleSchema = z.string().trim().min(1).max(120);

function resolveWeekStartFromForm(formData: FormData): Date {
  return (
    parseWeekStartParam(String(formData.get("weekStart") ?? "")) ??
    getWeekStart()
  );
}

/** Prefer viewed month/week from the form when the week belongs to that month. */
function returnHref(
  formData: FormData,
  weekStart: Date,
  extra?: { toast?: string; undo?: string },
) {
  return plannerHref({
    weekStart,
    monthParam: String(formData.get("returnMonth") ?? "") || null,
    weekParam: String(formData.get("returnWeek") ?? "") || null,
    toast: extra?.toast,
    undo: extra?.undo,
  });
}

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

  const weekPlan = await getOrCreateWeekPlan(
    userId,
    resolveWeekStartFromForm(formData),
  );
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
      caption: suggestCaption({ title: trend.title, hook: trend.hook }),
      status: ContentStatus.IDE,
      trendId: trend.id,
      hashtags: suggestHashtags(),
    },
  });

  revalidatePlanner();
  return { success: "Ide ditambahkan ke planner" };
}

export async function createContentItemAction(
  _prev: PlannerActionState,
  formData: FormData,
): Promise<PlannerActionState> {
  const userId = await requireUserId();
  const dayParsed = daySchema.safeParse(formData.get("dayOfWeek"));
  const titleParsed = titleSchema.safeParse(formData.get("title"));

  if (!dayParsed.success) {
    return { error: "Pilih hari yang valid." };
  }
  if (!titleParsed.success) {
    return { error: "Judul wajib diisi." };
  }

  const hook = String(formData.get("hook") ?? "").trim() || null;
  const weekStart = resolveWeekStartFromForm(formData);

  const weekPlan = await getOrCreateWeekPlan(userId, weekStart);
  const existing = weekPlan.items.find((i) => i.dayOfWeek === dayParsed.data);
  if (existing) {
    return { error: "Hari itu sudah ada ide — pilih hari lain." };
  }

  await prisma.contentItem.create({
    data: {
      weekPlanId: weekPlan.id,
      dayOfWeek: dayParsed.data,
      title: titleParsed.data,
      hook,
      caption: suggestCaption({ title: titleParsed.data, hook }),
      hashtags: suggestHashtags(),
      status: ContentStatus.IDE,
    },
  });

  revalidatePlanner();
  redirect(returnHref(formData, weekStart, { toast: "created" }));
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
    where: { id: itemId, deletedAt: null, weekPlan: { userId } },
    include: { weekPlan: { select: { weekStart: true } } },
  });
  if (!item) return { error: "Konten tidak ditemukan." };

  await prisma.contentItem.update({
    where: { id: itemId },
    data: {
      caption: String(formData.get("caption") ?? "").trim() || null,
      hashtags: String(formData.get("hashtags") ?? "").trim() || null,
      status: resolveStatusUpdate(item.status, statusParsed.data),
      // Legacy field — no longer editable in UI; clear leftovers on save.
      performanceNote: null,
    },
  });

  revalidatePlanner();
  revalidatePath(`/planner/${itemId}`);
  redirect(returnHref(formData, item.weekPlan.weekStart, { toast: "saved" }));
}

/** Soft-park for undo toast; hard-purge after toast window. */
export async function softDeleteContentItemAction(formData: FormData) {
  const userId = await requireUserId();
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) return;

  const item = await prisma.contentItem.findFirst({
    where: {
      id: itemId,
      deletedAt: null,
      dayOfWeek: { gte: 0 },
      weekPlan: { userId },
    },
    include: { weekPlan: { select: { weekStart: true } } },
  });
  if (!item) {
    redirect(returnHref(formData, getWeekStart()));
  }

  const parkedDay = parkDayOfWeek(item.dayOfWeek);

  await prisma.$transaction([
    // Free park slot if a prior undo never purged (unique weekPlanId+dayOfWeek).
    prisma.contentItem.deleteMany({
      where: {
        weekPlanId: item.weekPlanId,
        dayOfWeek: parkedDay,
        deletedAt: { not: null },
        NOT: { id: item.id },
      },
    }),
    prisma.contentItem.update({
      where: { id: item.id },
      data: {
        deletedAt: new Date(),
        dayOfWeek: parkedDay,
      },
    }),
  ]);

  revalidatePlanner();
  redirect(
    returnHref(formData, item.weekPlan.weekStart, {
      toast: "deleted",
      undo: item.id,
    }),
  );
}

export async function restoreContentItemAction(
  itemId: string,
): Promise<PlannerActionState> {
  const userId = await requireUserId();
  if (!itemId) return { error: "Data tidak valid." };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.contentItem.findFirst({
        where: {
          id: itemId,
          deletedAt: { not: null },
          weekPlan: { userId },
        },
      });
      if (!item) return { error: "Ide sudah tidak bisa diurungkan." } as const;
      if (!isParkedSoftDeleteDay(item.dayOfWeek)) {
        return { error: "Ide sudah tidak bisa diurungkan." } as const;
      }

      const restoreDay = unparkDayOfWeek(item.dayOfWeek);
      const occupant = await tx.contentItem.findFirst({
        where: {
          weekPlanId: item.weekPlanId,
          dayOfWeek: restoreDay,
          deletedAt: null,
          NOT: { id: item.id },
        },
      });
      if (occupant) {
        return { error: "Hari sudah terisi — tidak bisa urungkan." } as const;
      }

      await tx.contentItem.update({
        where: { id: item.id },
        data: {
          deletedAt: null,
          dayOfWeek: restoreDay,
        },
      });

      return { success: "Ide dikembalikan" } as const;
    });

    if (result.success) revalidatePlanner();
    return result;
  } catch {
    return { error: "Gagal mengembalikan ide. Coba lagi." };
  }
}

export async function purgeDeletedContentItemAction(
  itemId: string,
): Promise<PlannerActionState> {
  const userId = await requireUserId();
  if (!itemId) return { error: "Data tidak valid." };

  await prisma.contentItem.deleteMany({
    where: {
      id: itemId,
      deletedAt: { not: null },
      weekPlan: { userId },
    },
  });

  revalidatePlanner();
  return {};
}

/** Move item to another day; swap if that day is occupied. */
export async function moveContentItemAction(
  itemId: string,
  toDayOfWeek: number,
  expectedFromDay?: number,
): Promise<PlannerActionState> {
  const userId = await requireUserId();
  const dayParsed = daySchema.safeParse(toDayOfWeek);
  if (!itemId || !dayParsed.success) {
    return { error: "Hari tidak valid." };
  }

  const toDay = dayParsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.contentItem.findFirst({
        where: {
          id: itemId,
          deletedAt: null,
          dayOfWeek: { gte: 0 },
          weekPlan: { userId },
        },
      });
      if (!item) return { error: "Konten tidak ditemukan." } as const;

      const fromDay = item.dayOfWeek;
      if (expectedFromDay !== undefined && expectedFromDay !== fromDay) {
        return {
          error: "Planner sudah berubah. Muat ulang lalu coba lagi.",
        } as const;
      }

      if (fromDay === toDay) {
        return {} as const;
      }

      const occupant = await tx.contentItem.findFirst({
        where: {
          weekPlanId: item.weekPlanId,
          dayOfWeek: toDay,
          deletedAt: null,
          NOT: { id: item.id },
        },
      });

      if (!occupant) {
        await tx.contentItem.update({
          where: { id: item.id },
          data: { dayOfWeek: toDay },
        });
        return { success: "Ide dipindahkan" } as const;
      }

      // Unique (weekPlanId, dayOfWeek): park on temp day, then finish swap
      const tempDay = -1 - fromDay;
      await tx.contentItem.update({
        where: { id: item.id },
        data: { dayOfWeek: tempDay },
      });
      await tx.contentItem.update({
        where: { id: occupant.id },
        data: { dayOfWeek: fromDay },
      });
      await tx.contentItem.update({
        where: { id: item.id },
        data: { dayOfWeek: toDay },
      });

      return { success: "Ide ditukar harinya" } as const;
    });

    if (result.success) {
      revalidatePlanner();
    }
    return result;
  } catch {
    return { error: "Gagal memindahkan ide. Coba lagi." };
  }
}
