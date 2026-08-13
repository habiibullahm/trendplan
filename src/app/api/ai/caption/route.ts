import { gateAppUser } from "@/lib/auth/require-app-user";
import { generateCaptionAssist } from "@/features/planner/ai/generate-caption";
import { ActionErrors } from "@/lib/action-result";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const RATE = { limit: 20, windowMs: 60 * 60 * 1000 } as const;

type Body = {
  contentItemId?: unknown;
};

export async function POST(req: Request) {
  const gate = await gateAppUser();
  if (!gate.ok) {
    const status =
      gate.kind === "unauthorized"
        ? 401
        : gate.kind === "unverified"
          ? 403
          : 401;
    return Response.json(
      {
        error:
          gate.kind === "unverified"
            ? ActionErrors.emailUnverified
            : gate.kind === "stale"
              ? ActionErrors.sessionStale
              : ActionErrors.unauthorized,
      },
      { status },
    );
  }

  let json: Body;
  try {
    json = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const contentItemId =
    typeof json.contentItemId === "string" ? json.contentItemId.trim() : "";
  if (!contentItemId) {
    return Response.json({ error: "contentItemId wajib" }, { status: 400 });
  }

  const limited = await checkRateLimit(`ai-caption:${gate.userId}`, RATE);
  if (!limited.ok) {
    return Response.json(
      { error: ActionErrors.rateLimited },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  const item = await prisma.contentItem.findFirst({
    where: {
      id: contentItemId,
      deletedAt: null,
      weekPlan: { userId: gate.userId },
    },
    select: {
      title: true,
      hook: true,
      trend: {
        select: { title: true, reason: true, format: true },
      },
      weekPlan: {
        select: {
          user: { select: { niche: true } },
        },
      },
    },
  });

  if (!item) {
    return Response.json({ error: "Ide tidak ditemukan" }, { status: 404 });
  }

  const result = await generateCaptionAssist({
    title: item.title,
    hook: item.hook,
    niche: item.weekPlan.user.niche,
    trendTitle: item.trend?.title ?? null,
    trendReason: item.trend?.reason ?? null,
    trendFormat: item.trend?.format ?? null,
  });

  return Response.json(result);
}
