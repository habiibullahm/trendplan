import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPlanReminderCopy,
  getTomorrowContext,
} from "@/features/reminders/lib/eligibility";
import { ymdToDate } from "@/lib/week";

describe("getTomorrowContext", () => {
  it("resolves Jakarta besok across a local calendar day", () => {
    // 2026-08-10 17:00 UTC = 2026-08-11 00:00 WIB → "today" Jakarta is Aug 11, besok Aug 12
    const ctx = getTomorrowContext(new Date("2026-08-10T17:00:00.000Z"));
    assert.equal(ctx.targetDate, "2026-08-12");
    assert.equal(ctx.dayOfWeek, 2); // Wed
  });
});

describe("buildPlanReminderCopy", () => {
  it("prefers tomorrow unfinished item", () => {
    const copy = buildPlanReminderCopy({
      tomorrowItems: [{ title: "Date night POV" }],
      weekItemCount: 1,
      weeklyGoal: 3,
    });
    assert.ok(copy);
    assert.match(copy!.body, /Besok: Date night POV/);
  });

  it("falls back to weekly goal progress", () => {
    const copy = buildPlanReminderCopy({
      tomorrowItems: [],
      weekItemCount: 1,
      weeklyGoal: 3,
    });
    assert.ok(copy);
    assert.match(copy!.body, /1\/3/);
  });

  it("returns null when goal met and no tomorrow item", () => {
    const copy = buildPlanReminderCopy({
      tomorrowItems: [],
      weekItemCount: 3,
      weeklyGoal: 3,
    });
    assert.equal(copy, null);
  });

  it("reminds about today's unfinished activities before weekly goal fallback", () => {
    const copy = buildPlanReminderCopy({
      tomorrowItems: [],
      weekItemCount: 3,
      weeklyGoal: 3,
      unfinishedActivitiesToday: 2,
    });
    assert.ok(copy);
    assert.match(copy!.body, /2 aktivitas hari ini belum dicentang/);
    assert.equal(copy!.url, "/planner?tab=aktivitas");
  });

  it("prefers tomorrow item over today's unfinished activities", () => {
    const copy = buildPlanReminderCopy({
      tomorrowItems: [{ title: "Date night POV" }],
      weekItemCount: 1,
      weeklyGoal: 3,
      unfinishedActivitiesToday: 5,
    });
    assert.ok(copy);
    assert.match(copy!.body, /Besok: Date night POV/);
  });
});

describe("ymdToDate smoke", () => {
  it("builds UTC midnight", () => {
    const d = ymdToDate(2026, 8, 12);
    assert.equal(d.toISOString(), "2026-08-12T00:00:00.000Z");
  });
});
