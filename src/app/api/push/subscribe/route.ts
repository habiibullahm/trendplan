import { gateAppUser } from "@/lib/auth/require-app-user";
import { ActionErrors } from "@/lib/action-result";
import { gateFailureResponse } from "@/lib/gate-http";
import {
  pushSubscribeBodySchema,
  pushUnsubscribeBodySchema,
} from "@/lib/push-subscription-schema";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  PUSH_SUBSCRIBE_USER_LIMIT,
  PUSH_UNSUBSCRIBE_USER_LIMIT,
} from "@/lib/rate-limit-policies";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function rateLimitedResponse(retryAfterSec: number) {
  return Response.json(
    { error: ActionErrors.rateLimited },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  );
}

export async function POST(req: Request) {
  const gate = await gateAppUser();
  if (!gate.ok) return gateFailureResponse(gate);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = pushSubscribeBodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const limited = await checkRateLimit(
    `push-subscribe:user:${gate.userId}`,
    PUSH_SUBSCRIBE_USER_LIMIT,
  );
  if (!limited.ok) {
    return rateLimitedResponse(limited.retryAfterSec);
  }

  const { endpoint, keys } = parsed.data;

  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint },
    select: { userId: true },
  });
  if (existing && existing.userId !== gate.userId) {
    return Response.json({ error: "Subscription conflict" }, { status: 409 });
  }

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: gate.userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });
  } catch {
    // Concurrent create for the same endpoint by another user.
    return Response.json({ error: "Subscription conflict" }, { status: 409 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const gate = await gateAppUser();
  if (!gate.ok) return gateFailureResponse(gate);

  let endpoint: string | undefined;
  try {
    const json: unknown = await req.json();
    const parsed = pushUnsubscribeBodySchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: "Invalid subscription" }, { status: 400 });
    }
    endpoint = parsed.data.endpoint;
  } catch {
    // empty / non-JSON body → delete all for user
  }

  const limited = await checkRateLimit(
    `push-subscribe-del:user:${gate.userId}`,
    PUSH_UNSUBSCRIBE_USER_LIMIT,
  );
  if (!limited.ok) {
    return rateLimitedResponse(limited.retryAfterSec);
  }

  if (endpoint) {
    await prisma.pushSubscription.deleteMany({
      where: { userId: gate.userId, endpoint },
    });
  } else {
    await prisma.pushSubscription.deleteMany({
      where: { userId: gate.userId },
    });
  }

  return Response.json({ ok: true });
}
