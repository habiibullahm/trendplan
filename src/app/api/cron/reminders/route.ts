import { runPlanReminders } from "@/features/reminders/lib/run-plan-reminders";
import { requireCronAuth } from "@/lib/web-push";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = requireCronAuth(req);
  if (denied) return denied;

  try {
    const result = await runPlanReminders();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/reminders]", err);
    return Response.json({ error: "Reminder job failed" }, { status: 500 });
  }
}
