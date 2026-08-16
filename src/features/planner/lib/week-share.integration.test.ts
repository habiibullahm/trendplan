/**
 * DB integration tests for partner accept + ACL.
 * Skips when DATABASE_URL is missing or the partner-share migration is not applied.
 *
 * Run: npm test -- src/features/planner/lib/week-share.integration.test.ts
 */
import "dotenv/config";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { hash } from "bcryptjs";
import { getWeekStart } from "@/lib/week";
import {
  createWeekInviteRawToken,
  hashWeekInviteToken,
} from "@/features/planner/lib/week-share-tokens";

describe("week-share accept + ACL (integration)", async () => {
  if (!process.env.DATABASE_URL) {
    it("skips without DATABASE_URL", () => {
      console.info(
        "[week-share.integration] skipped — set DATABASE_URL and run migrations",
      );
    });
    return;
  }

  const { Prisma } = await import("@/generated/prisma/client");
  const { prisma } = await import("@/lib/prisma");
  const {
    acceptWeekInvite,
    canEditWeekPlan,
    createOrRotateWeekInvite,
    getWeekPlanForViewer,
    rejectWeekInvite,
    removePartner,
    revokePendingInvites,
    userHasPartnerSeatForWeek,
    weekPlanAccessWhere,
  } = await import("@/features/planner/lib/week-share");

  async function mustCreateInvite(params: {
    weekPlanId: string;
    createdByUserId: string;
    invitedEmail?: string | null;
  }) {
    const created = await createOrRotateWeekInvite(params);
    assert.equal(
      created.ok,
      true,
      `expected invite create ok, got ${JSON.stringify(created)}`,
    );
    if (!created.ok) {
      throw new Error("unreachable");
    }
    return created;
  }

  async function dbReady(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$queryRaw`SELECT 1 FROM "WeekPlanMember" LIMIT 0`;
      return true;
    } catch {
      return false;
    }
  }

  const ready = await dbReady();
  if (!ready) {
    it("skips when DB / WeekPlanMember unavailable", () => {
      console.info(
        "[week-share.integration] skipped — DB unreachable or migration missing",
      );
    });
    await prisma.$disconnect().catch(() => undefined);
    return;
  }

  const stamp = Date.now();
  let ownerId = "";
  let partnerId = "";
  let strangerId = "";
  let weekPlanId = "";
  const weekStart = getWeekStart();
  const userIds: string[] = [];

  async function createUser(suffix: string) {
    return prisma.user.create({
      data: {
        email: `week-share-${suffix}-${stamp}@trendplan.test`,
        name: suffix,
        passwordHash: await hash("password12345", 4),
        niche: "Couple Date Ideas",
        weeklyGoal: 3,
        onboardingComplete: true,
        emailVerified: new Date(),
        passwordNeedsUpgrade: false,
      },
    });
  }

  before(async () => {
    const owner = await createUser("owner");
    const partner = await createUser("partner");
    const stranger = await createUser("stranger");
    ownerId = owner.id;
    partnerId = partner.id;
    strangerId = stranger.id;
    userIds.push(ownerId, partnerId, strangerId);

    const plan = await prisma.weekPlan.create({
      data: { userId: ownerId, weekStart },
    });
    weekPlanId = plan.id;
  });

  after(async () => {
    if (userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect().catch(() => undefined);
  });

  it("rejects self-accept", async () => {
    const created = await mustCreateInvite({
      weekPlanId,
      createdByUserId: ownerId,
    });
    const result = await acceptWeekInvite(created.rawToken, ownerId);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "self");
  });

  it("rejects self-invite by email on create", async () => {
    await revokePendingInvites(weekPlanId);
    await prisma.weekPlanMember.deleteMany({ where: { weekPlanId } });

    const owner = await prisma.user.findUniqueOrThrow({
      where: { id: ownerId },
      select: { email: true },
    });
    const result = await createOrRotateWeekInvite({
      weekPlanId,
      createdByUserId: ownerId,
      invitedEmail: owner.email.toUpperCase(),
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "self_invite");
  });

  it("accepts partner and grants edit ACL; stranger denied", async () => {
    await revokePendingInvites(weekPlanId);
    await prisma.weekPlanMember.deleteMany({ where: { weekPlanId } });

    const created = await mustCreateInvite({
      weekPlanId,
      createdByUserId: ownerId,
    });

    const result = await acceptWeekInvite(created.rawToken, partnerId);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.weekPlanId, weekPlanId);
    }

    assert.equal(await canEditWeekPlan(ownerId, weekPlanId), true);
    assert.equal(await canEditWeekPlan(partnerId, weekPlanId), true);
    assert.equal(await canEditWeekPlan(strangerId, weekPlanId), false);

    const again = await acceptWeekInvite(created.rawToken, strangerId);
    assert.equal(again.ok, false);
    if (!again.ok) assert.equal(again.code, "invalid");
  });

  it("enforces one partner via unique weekPlanId (DB)", async () => {
    await prisma.weekPlanMember.deleteMany({ where: { weekPlanId } });
    await prisma.weekPlanMember.create({
      data: { weekPlanId, userId: partnerId },
    });

    await assert.rejects(
      () =>
        prisma.weekPlanMember.create({
          data: { weekPlanId, userId: strangerId },
        }),
      (err: unknown) =>
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002",
    );
  });

  it("accept returns partner_exists when seat is taken", async () => {
    await prisma.weekPlanMember.deleteMany({ where: { weekPlanId } });
    await prisma.weekPlanMember.create({
      data: { weekPlanId, userId: partnerId },
    });

    const rawToken = createWeekInviteRawToken();
    await prisma.weekPlanInvite.create({
      data: {
        weekPlanId,
        createdByUserId: ownerId,
        tokenHash: hashWeekInviteToken(rawToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const result = await acceptWeekInvite(rawToken, strangerId);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "partner_exists");
  });

  it("reject then accept → revoked", async () => {
    await removePartner(weekPlanId, ownerId);
    await revokePendingInvites(weekPlanId);

    const created = await mustCreateInvite({
      weekPlanId,
      createdByUserId: ownerId,
    });
    assert.equal(await rejectWeekInvite(created.rawToken), "ok");

    const result = await acceptWeekInvite(created.rawToken, partnerId);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "revoked");
  });

  it("expired invite is rejected", async () => {
    await revokePendingInvites(weekPlanId);
    const rawToken = createWeekInviteRawToken();
    await prisma.weekPlanInvite.create({
      data: {
        weekPlanId,
        createdByUserId: ownerId,
        tokenHash: hashWeekInviteToken(rawToken),
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    const result = await acceptWeekInvite(rawToken, partnerId);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "expired");
  });

  it("already_member when same partner accepts a fresh invite", async () => {
    await removePartner(weekPlanId, ownerId);
    await revokePendingInvites(weekPlanId);

    const first = await mustCreateInvite({
      weekPlanId,
      createdByUserId: ownerId,
    });
    const accepted = await acceptWeekInvite(first.rawToken, partnerId);
    assert.equal(accepted.ok, true);

    const rawToken = createWeekInviteRawToken();
    await prisma.weekPlanInvite.create({
      data: {
        weekPlanId,
        createdByUserId: ownerId,
        tokenHash: hashWeekInviteToken(rawToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const result = await acceptWeekInvite(rawToken, partnerId);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "already_member");
  });

  it("contentItem ACL query matches canEditWeekPlan", async () => {
    await removePartner(weekPlanId, ownerId);
    const created = await mustCreateInvite({
      weekPlanId,
      createdByUserId: ownerId,
    });
    await acceptWeekInvite(created.rawToken, partnerId);

    const item = await prisma.contentItem.create({
      data: {
        weekPlanId,
        dayOfWeek: 0,
        title: "Shared ide",
      },
    });

    const asPartner = await prisma.contentItem.findFirst({
      where: { id: item.id, weekPlan: weekPlanAccessWhere(partnerId) },
    });
    const asStranger = await prisma.contentItem.findFirst({
      where: { id: item.id, weekPlan: weekPlanAccessWhere(strangerId) },
    });

    assert.ok(asPartner);
    assert.equal(asStranger, null);

    await prisma.contentItem.delete({ where: { id: item.id } });
  });

  it("getWeekPlanForViewer mine vs shared for partner", async () => {
    await removePartner(weekPlanId, ownerId);
    await revokePendingInvites(weekPlanId);
    const created = await mustCreateInvite({
      weekPlanId,
      createdByUserId: ownerId,
    });
    const accepted = await acceptWeekInvite(created.rawToken, partnerId);
    assert.equal(accepted.ok, true);

    const partnerOwned = await prisma.weekPlan.upsert({
      where: {
        userId_weekStart: { userId: partnerId, weekStart },
      },
      create: { userId: partnerId, weekStart },
      update: {},
    });

    const mine = await getWeekPlanForViewer(partnerId, weekStart, {
      view: "mine",
    });
    const shared = await getWeekPlanForViewer(partnerId, weekStart, {
      view: "shared",
    });

    assert.equal(mine.id, partnerOwned.id);
    assert.equal(shared.id, weekPlanId);
    assert.notEqual(mine.id, shared.id);
    assert.equal(await userHasPartnerSeatForWeek(partnerId, weekStart), true);
    assert.equal(await userHasPartnerSeatForWeek(ownerId, weekStart), false);

    // After leave, shared falls back to owned.
    await removePartner(weekPlanId, ownerId);
    const afterLeave = await getWeekPlanForViewer(partnerId, weekStart, {
      view: "shared",
    });
    assert.equal(afterLeave.id, partnerOwned.id);
    assert.equal(await userHasPartnerSeatForWeek(partnerId, weekStart), false);
  });
});
