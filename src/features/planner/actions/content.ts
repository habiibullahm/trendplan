"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ContentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId, purgeStaleSoftDeletes } from "@/features/planner/lib/planner";
import {
  getWeekPlanForViewer,
  weekPlanAccessWhere,
} from "@/features/planner/lib/week-share";
import {
  suggestCaption,
  suggestHashtags,
} from "@/features/planner/lib/export-text";
import {
  isParkedSoftDeleteDay,
  parkDayOfWeek,
  unparkDayOfWeek,
} from "@/features/planner/lib/soft-delete";
import { resolveStatusUpdate } from "@/lib/labels";
import {
  getWeekStart,
  parsePlannerView,
  parseWeekStartParam,
  plannerHref,
} from "@/lib/week";
import {
  captionSchema,
  hashtagsSchema,
  hookSchema,
} from "@/features/planner/lib/content-field-schemas";
import {
  actionFail,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";
import { isPrismaUniqueConflict } from "@/lib/prisma-errors";

const daySchema = z.coerce.number().int().min(0).max(6);
const statusSchema = z.enum(["IDE", "POSTED"]);
const titleSchema = z.string().trim().min(1).max(120);
const DAY_OCCUPIED_MESSAGE = "Hari itu sudah ada ide — pilih hari lain.";

function resolveWeekStartFromForm(formData: FormData): Date {
  return (
    parseWeekStartParam(String(formData.get("weekStart") ?? "")) ??
    getWeekStart()
  );
}

/** Prefer viewed month/week from the form when the week belongs to that month. */
function formView(formData: FormData) {
  return parsePlannerView(String(formData.get("view") ?? ""));
}

function returnHref(
  formData: FormData,
  weekStart: Date,
  extra?: { toast?: string; undo?: string },
) {
  return plannerHref({
    weekStart,
    monthParam: String(formData.get("returnMonth") ?? "") || null,
    weekParam: String(formData.get("returnWeek") ?? "") || null,
    view: formView(formData),
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

export type PlannerActionState = ActionResult;

export async function addTrendToPlannerAction(
  _prev: PlannerActionState,
  formData: FormData,
): Promise<PlannerActionState> {
  const userId = await requireUserId();
  const trendId = String(formData.get("trendId") ?? "");
  const dayParsed = daySchema.safeParse(formData.get("dayOfWeek"));

  if (!trendId || !dayParsed.success) {
    return actionFail("invalid_day", { message: "Pilih hari yang valid." });
  }

  const trend = await prisma.trend.findUnique({ where: { id: trendId } });
  if (!trend)
    return actionFail("trend_not_found", { message: "Tren tidak ditemukan." });

  const weekPlan = await getWeekPlanForViewer(
    userId,
    resolveWeekStartFromForm(formData),
    { view: formView(formData) },
  );
  const existing = weekPlan.items.find((i) => i.dayOfWeek === dayParsed.data);
  if (existing) {
    return actionFail("day_occupied", { message: DAY_OCCUPIED_MESSAGE });
  }

  try {
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
  } catch (error) {
    if (isPrismaUniqueConflict(error)) {
      return actionFail("day_occupied", { message: DAY_OCCUPIED_MESSAGE });
    }
    throw error;
  }

  revalidatePlanner();
  return actionSuccess("Ide ditambahkan ke planner");
}

export async function createContentItemAction(
  _prev: PlannerActionState,
  formData: FormData,
): Promise<PlannerActionState> {
  const userId = await requireUserId();
  const dayParsed = daySchema.safeParse(formData.get("dayOfWeek"));
  const titleParsed = titleSchema.safeParse(formData.get("title"));

  if (!dayParsed.success) {
    return actionFail("invalid_day", { message: "Pilih hari yang valid." });
  }
  if (!titleParsed.success) {
    return actionFail("title_required", { message: "Judul wajib diisi." });
  }

  const hookParsed = hookSchema.safeParse(formData.get("hook") ?? "");
  if (!hookParsed.success) {
    return actionFail("hook_too_long", { message: "Hook terlalu panjang." });
  }
  const hook = hookParsed.data || null;
  const weekStart = resolveWeekStartFromForm(formData);

  const weekPlan = await getWeekPlanForViewer(userId, weekStart, {
    view: formView(formData),
  });
  const existing = weekPlan.items.find((i) => i.dayOfWeek === dayParsed.data);
  if (existing) {
    return actionFail("day_occupied", { message: DAY_OCCUPIED_MESSAGE });
  }

  try {
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
  } catch (error) {
    if (isPrismaUniqueConflict(error)) {
      return actionFail("day_occupied", { message: DAY_OCCUPIED_MESSAGE });
    }
    throw error;
  }

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
    return actionFail("invalid_payload", { message: "Data tidak valid." });
  }

  const captionParsed = captionSchema.safeParse(formData.get("caption") ?? "");
  const hashtagsParsed = hashtagsSchema.safeParse(
    formData.get("hashtags") ?? "",
  );
  if (!captionParsed.success) {
    return actionFail("caption_too_long", {
      message: "Caption terlalu panjang.",
    });
  }
  if (!hashtagsParsed.success) {
    return actionFail("hashtags_too_long", {
      message: "Hashtag terlalu panjang.",
    });
  }

  const item = await prisma.contentItem.findFirst({
    where: {
      id: itemId,
      deletedAt: null,
      weekPlan: weekPlanAccessWhere(userId),
    },
    include: { weekPlan: { select: { weekStart: true } } },
  });
  if (!item)
    return actionFail("content_not_found", {
      message: "Konten tidak ditemukan.",
    });

  if (item.status === "POSTED") {
    return actionFail("content_posted_readonly", {
      message: "Konten Posted hanya bisa dibaca.",
    });
  }

  await prisma.contentItem.update({
    where: { id: itemId },
    data: {
      caption: captionParsed.data || null,
      hashtags: hashtagsParsed.data || null,
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
      weekPlan: weekPlanAccessWhere(userId),
    },
    include: { weekPlan: { select: { weekStart: true } } },
  });
  if (!item) {
    redirect(returnHref(formData, getWeekStart()));
  }

  if (item.status === "POSTED") {
    redirect(
      returnHref(formData, item.weekPlan.weekStart, {
        toast: "posted_locked",
      }),
    );
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

  // Sequential GC (not concurrent with the transaction) — keeps pg client happy.
  await purgeStaleSoftDeletes(userId);

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
  if (!itemId)
    return actionFail("invalid_payload", { message: "Data tidak valid." });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.contentItem.findFirst({
        where: {
          id: itemId,
          deletedAt: { not: null },
          weekPlan: weekPlanAccessWhere(userId),
        },
      });
      if (!item)
        return actionFail("undo_unavailable", {
          message: "Ide sudah tidak bisa diurungkan.",
        });
      if (!isParkedSoftDeleteDay(item.dayOfWeek)) {
        return actionFail("undo_unavailable", {
          message: "Ide sudah tidak bisa diurungkan.",
        });
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
        return actionFail("undo_day_occupied", {
          message: "Hari sudah terisi — tidak bisa urungkan.",
        });
      }

      await tx.contentItem.update({
        where: { id: item.id },
        data: {
          deletedAt: null,
          dayOfWeek: restoreDay,
        },
      });

      return actionSuccess("Ide dikembalikan");
    });

    if (result.status === "success") revalidatePlanner();
    return result;
  } catch {
    return actionFail("undo_failed", {
      message: "Gagal mengembalikan ide. Coba lagi.",
    });
  }
}

export async function purgeDeletedContentItemAction(
  itemId: string,
): Promise<PlannerActionState> {
  const userId = await requireUserId();
  if (!itemId)
    return actionFail("invalid_payload", { message: "Data tidak valid." });

  await prisma.contentItem.deleteMany({
    where: {
      id: itemId,
      deletedAt: { not: null },
      weekPlan: weekPlanAccessWhere(userId),
    },
  });

  revalidatePlanner();
  return { status: "success" };
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
    return actionFail("invalid_day", { message: "Hari tidak valid." });
  }

  const toDay = dayParsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.contentItem.findFirst({
        where: {
          id: itemId,
          deletedAt: null,
          dayOfWeek: { gte: 0 },
          weekPlan: weekPlanAccessWhere(userId),
        },
      });
      if (!item)
        return actionFail("content_not_found", {
          message: "Konten tidak ditemukan.",
        });

      if (item.status === "POSTED") {
        return actionFail("content_posted_readonly", {
          message: "Konten Posted tidak bisa dipindahkan.",
        });
      }

      const fromDay = item.dayOfWeek;
      if (expectedFromDay !== undefined && expectedFromDay !== fromDay) {
        return actionFail("stale_planner", {
          message: "Planner sudah berubah. Muat ulang lalu coba lagi.",
        });
      }

      if (fromDay === toDay) {
        return { status: "success" } as const;
      }

      const occupant = await tx.contentItem.findFirst({
        where: {
          weekPlanId: item.weekPlanId,
          dayOfWeek: toDay,
          deletedAt: null,
          NOT: { id: item.id },
        },
      });

      if (occupant?.status === "POSTED") {
        return actionFail("posted_slot_locked", {
          message: "Slot Posted tidak bisa digeser. Pilih hari lain.",
        });
      }

      if (!occupant) {
        await tx.contentItem.update({
          where: { id: item.id },
          data: { dayOfWeek: toDay },
        });
        return actionSuccess("Ide dipindahkan");
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

      return actionSuccess("Ide ditukar harinya");
    });

    if (result.status === "success") {
      revalidatePlanner();
    }
    return result;
  } catch {
    return actionFail("move_failed", {
      message: "Gagal memindahkan ide. Coba lagi.",
    });
  }
}
