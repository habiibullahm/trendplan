import { prisma } from "@/lib/prisma";
import { requireCronAuth, sendPushToMany } from "@/lib/web-push";

export const runtime = "nodejs";

const MAX_TITLE = 80;
const MAX_BODY = 120;

type BroadcastBody = {
  title?: unknown;
  body?: unknown;
  url?: unknown;
};

function sanitizePath(url: unknown): string {
  if (typeof url !== "string" || !url.trim()) return "/";
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  return trimmed.slice(0, 200);
}

export async function POST(req: Request) {
  const denied = requireCronAuth(req);
  if (denied) return denied;

  let json: BroadcastBody;
  try {
    json = (await req.json()) as BroadcastBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title =
    typeof json.title === "string" ? json.title.trim().slice(0, MAX_TITLE) : "";
  const body =
    typeof json.body === "string" ? json.body.trim().slice(0, MAX_BODY) : "";
  if (!title || !body) {
    return Response.json(
      { error: "title and body are required" },
      { status: 400 },
    );
  }

  const url = sanitizePath(json.url);
  const subs = await prisma.pushSubscription.findMany({
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });

  try {
    const result = await sendPushToMany(subs, { title, body, url });
    return Response.json({
      ok: true,
      subscribers: subs.length,
      ...result,
    });
  } catch (err) {
    console.error("[push/broadcast]", err);
    return Response.json({ error: "Broadcast failed" }, { status: 500 });
  }
}
