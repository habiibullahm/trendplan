"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { parseActivityTitles } from "@/features/activities/lib/parse-titles";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/features/planner/lib/planner";
import {
  getWeekPlanForViewer,
  weekPlanAccessWhere,
} from "@/features/planner/lib/week-share";
import {
  getWeekStart,
  parsePlannerView,
  parseWeekStartParam,
  plannerHref,
} from "@/lib/week";
import { actionFail, type ActionResult } from "@/lib/action-result";

const daySchema = z.coerce.number().int().min(0).max(6);
const titleSchema = z.string().trim().min(1).max(120);

export type ActivityActionState = ActionResult;

function resolveWeekStartFromForm(formData: FormData): Date {
  return (
    parseWeekStartParam(String(formData.get("weekStart") ?? "")) ??
    getWeekStart()
  );
}

function formView(formData: FormData) {
  return parsePlannerView(String(formData.get("view") ?? ""));
}

function returnHref(
  formData: FormData,
  weekStart: Date,
  extra?: { toast?: string },
) {
  return plannerHref({
    weekStart,
    monthParam: String(formData.get("returnMonth") ?? "") || null,
    weekParam: String(formData.get("returnWeek") ?? "") || null,
    tab: "aktivitas",
    view: formView(formData),
    toast: extra?.toast,
  });
}

function revalidateActivities() {
  revalidatePath("/planner");
}

export async function createActivityAction(
  _prev: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  const userId = await requireUserId();
  const dayParsed = daySchema.safeParse(formData.get("dayOfWeek"));
  // Prefer multiline `titles`; fall back to legacy single `title`.
  const rawTitles =
    String(formData.get("titles") ?? "").trim() ||
    String(formData.get("title") ?? "").trim();
  const parsed = parseActivityTitles(rawTitles);

  if (!dayParsed.success) {
    return actionFail("invalid_day", { message: "Pilih hari yang valid." });
  }
  if (parsed.error || parsed.titles.length === 0) {
    return actionFail("activity_empty", {
      message: parsed.error ?? "Isi minimal satu aktivitas.",
    });
  }

  const titles = parsed.titles;

  const weekStart = resolveWeekStartFromForm(formData);
  const weekPlan = await getWeekPlanForViewer(userId, weekStart, {
    view: formView(formData),
  });

  await prisma.activity.createMany({
    data: titles.map((title) => ({
      weekPlanId: weekPlan.id,
      dayOfWeek: dayParsed.data,
      title,
    })),
  });

  revalidateActivities();
  redirect(
    returnHref(formData, weekStart, {
      toast: titles.length > 1 ? "activities-created" : "activity-created",
    }),
  );
}

export async function updateActivityAction(
  _prev: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  const userId = await requireUserId();
  const activityId = String(formData.get("activityId") ?? "");
  const titleParsed = titleSchema.safeParse(formData.get("title"));
  const dayParsed = daySchema.safeParse(formData.get("dayOfWeek"));

  if (!activityId) {
    return actionFail("invalid_payload", { message: "Data tidak valid." });
  }
  if (!titleParsed.success) {
    return actionFail("title_required", { message: "Judul wajib diisi." });
  }
  if (!dayParsed.success) {
    return actionFail("invalid_day", { message: "Pilih hari yang valid." });
  }

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, weekPlan: weekPlanAccessWhere(userId) },
    include: { weekPlan: { select: { weekStart: true } } },
  });
  if (!activity)
    return actionFail("activity_not_found", {
      message: "Aktivitas tidak ditemukan.",
    });

  await prisma.activity.update({
    where: { id: activityId },
    data: {
      title: titleParsed.data,
      dayOfWeek: dayParsed.data,
    },
  });

  revalidateActivities();
  revalidatePath(`/planner/aktivitas/${activityId}`);
  redirect(
    returnHref(formData, activity.weekPlan.weekStart, {
      toast: "activity-saved",
    }),
  );
}

export async function deleteActivityAction(formData: FormData) {
  const userId = await requireUserId();
  const activityId = String(formData.get("activityId") ?? "");
  if (!activityId) return;

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, weekPlan: weekPlanAccessWhere(userId) },
    include: { weekPlan: { select: { weekStart: true } } },
  });
  if (!activity) {
    redirect(
      plannerHref({
        weekStart: getWeekStart(),
        tab: "aktivitas",
        view: formView(formData),
      }),
    );
  }

  await prisma.activity.delete({ where: { id: activityId } });

  revalidateActivities();
  redirect(
    returnHref(formData, activity.weekPlan.weekStart, {
      toast: "activity-deleted",
    }),
  );
}
