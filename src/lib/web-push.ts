import { timingSafeEqual } from "node:crypto";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export type StoredPushSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function assertVapidConfigured() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error("VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT are required");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (!header) return false;
  return timingSafeStringEqual(header, `Bearer ${secret}`);
}

export function requireCronAuth(req: Request): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }
  if (!isCronAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** Send one notification; deletes the DB row on gone/expired endpoints. */
export async function sendPushToSubscription(
  sub: StoredPushSubscription,
  payload: PushPayload,
): Promise<"ok" | "gone" | "error"> {
  assertVapidConfigured();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/planner",
      }),
    );
    return "ok";
  } catch (err) {
    const status =
      err && typeof err === "object" && "statusCode" in err
        ? Number((err as { statusCode?: number }).statusCode)
        : undefined;
    if (status === 404 || status === 410) {
      await prisma.pushSubscription.deleteMany({ where: { id: sub.id } });
      return "gone";
    }
    console.error("[web-push] send failed", sub.id, err);
    return "error";
  }
}

export async function sendPushToMany(
  subs: StoredPushSubscription[],
  payload: PushPayload,
): Promise<{ sent: number; gone: number; failed: number }> {
  let sent = 0;
  let gone = 0;
  let failed = 0;
  for (const sub of subs) {
    const result = await sendPushToSubscription(sub, payload);
    if (result === "ok") sent += 1;
    else if (result === "gone") gone += 1;
    else failed += 1;
  }
  return { sent, gone, failed };
}
