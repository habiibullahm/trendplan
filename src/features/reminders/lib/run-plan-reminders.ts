import { prisma } from "@/lib/prisma";
import {
  buildPlanReminderCopy,
  getTomorrowContext,
} from "@/features/reminders/lib/eligibility";
import { listWeekPlanItemsForReminder } from "@/features/planner/lib/week-share";
import { sendPushToMany } from "@/lib/web-push";

/** Run daily H-1 plan reminders for all subscribed users. */
export async function runPlanReminders(now = new Date()) {
  const { targetDate, weekStart, dayOfWeek } = getTomorrowContext(now);

  const users = await prisma.user.findMany({
    where: { pushSubscriptions: { some: {} } },
    select: {
      id: true,
      weeklyGoal: true,
      pushSubscriptions: {
        select: { id: true, endpoint: true, p256dh: true, auth: true },
      },
      reminderDispatches: {
        where: { targetDate },
        select: { id: true },
        take: 1,
      },
    },
  });

  let notified = 0;
  let skipped = 0;
  let sent = 0;
  let gone = 0;
  let failed = 0;

  for (const user of users) {
    if (user.reminderDispatches.length > 0) {
      skipped += 1;
      continue;
    }

    // Owned or partner-shared week for this calendar week (no empty upsert).
    const items = await listWeekPlanItemsForReminder(user.id, weekStart);
    const tomorrowItems = items.filter(
      (i) => i.dayOfWeek === dayOfWeek && i.status !== "POSTED",
    );
    const copy = buildPlanReminderCopy({
      tomorrowItems,
      weekItemCount: items.length,
      weeklyGoal: user.weeklyGoal,
    });

    if (!copy) {
      skipped += 1;
      continue;
    }

    const result = await sendPushToMany(user.pushSubscriptions, copy);
    sent += result.sent;
    gone += result.gone;
    failed += result.failed;

    // Only mark dispatched after at least one successful delivery so a flaky
    // send can retry later the same targetDate.
    if (result.sent === 0) {
      continue;
    }

    try {
      await prisma.reminderDispatch.create({
        data: { userId: user.id, targetDate },
      });
      notified += 1;
    } catch {
      // Unique violation — concurrent worker already recorded this day.
      skipped += 1;
    }
  }

  return { targetDate, users: users.length, notified, skipped, sent, gone, failed };
}
