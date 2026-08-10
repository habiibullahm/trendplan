import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type SubscribeBody = {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
};

function parseBody(data: SubscribeBody) {
  const endpoint = typeof data.endpoint === "string" ? data.endpoint.trim() : "";
  const p256dh =
    typeof data.keys?.p256dh === "string" ? data.keys.p256dh.trim() : "";
  const authKey =
    typeof data.keys?.auth === "string" ? data.keys.auth.trim() : "";
  if (!endpoint || !p256dh || !authKey) return null;
  if (!/^https:\/\//i.test(endpoint)) return null;
  return { endpoint, p256dh, auth: authKey };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: SubscribeBody;
  try {
    json = (await req.json()) as SubscribeBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseBody(json);
  if (!parsed) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: parsed.endpoint },
    select: { userId: true },
  });
  if (existing && existing.userId !== session.user.id) {
    return Response.json({ error: "Subscription conflict" }, { status: 409 });
  }

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint: parsed.endpoint },
      create: {
        userId: session.user.id,
        endpoint: parsed.endpoint,
        p256dh: parsed.p256dh,
        auth: parsed.auth,
      },
      update: {
        p256dh: parsed.p256dh,
        auth: parsed.auth,
      },
    });
  } catch {
    // Concurrent create for the same endpoint by another user.
    return Response.json({ error: "Subscription conflict" }, { status: 409 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let endpoint: string | undefined;
  try {
    const json = (await req.json()) as { endpoint?: unknown };
    if (typeof json.endpoint === "string" && json.endpoint.trim()) {
      endpoint = json.endpoint.trim();
    }
  } catch {
    // empty body → delete all for user
  }

  if (endpoint) {
    await prisma.pushSubscription.deleteMany({
      where: { userId: session.user.id, endpoint },
    });
  } else {
    await prisma.pushSubscription.deleteMany({
      where: { userId: session.user.id },
    });
  }

  return Response.json({ ok: true });
}
