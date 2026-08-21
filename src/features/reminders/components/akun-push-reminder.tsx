import { PushReminderToggle } from "@/features/reminders/components/push-reminder-toggle";
import { prisma } from "@/lib/prisma";

/** Separate await so Akun profile can stream before push subscription count. */
export async function AkunPushReminder({ userId }: { userId: string }) {
  const pushCount = await prisma.pushSubscription.count({
    where: { userId },
  });
  return <PushReminderToggle initialEnabled={pushCount > 0} />;
}
