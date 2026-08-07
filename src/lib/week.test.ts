import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatMonthParam,
  formatWeekStartParam,
  getWeekStart,
  monthForWeekStart,
  parseMonthParam,
  parseWeekStartParam,
  plannerHref,
  resolvePlannerSelection,
  shiftMonth,
  weeksIntersectingMonth,
  ymdToDate,
} from "./week";

describe("getWeekStart (Asia/Jakarta)", () => {
  it("returns Monday for a mid-week Jakarta day", () => {
    // 2026-08-05 10:00 WIB = 2026-08-05 03:00 UTC (Wednesday)
    const wed = new Date("2026-08-05T03:00:00.000Z");
    const start = getWeekStart(wed);
    assert.equal(formatWeekStartParam(start), "2026-08-03");
  });

  it("treats Sunday as end of the Mon–Sun week", () => {
    // 2026-08-09 20:00 WIB = 2026-08-09 13:00 UTC (Sunday)
    const sun = new Date("2026-08-09T13:00:00.000Z");
    assert.equal(formatWeekStartParam(getWeekStart(sun)), "2026-08-03");
  });
});

describe("weeksIntersectingMonth", () => {
  it("lists weeks that overlap August 2026", () => {
    const weeks = weeksIntersectingMonth(2026, 8);
    const keys = weeks.map(formatWeekStartParam);
    assert.ok(keys.includes("2026-07-27"));
    assert.ok(keys.includes("2026-08-03"));
    assert.ok(keys.includes("2026-08-31") || keys.includes("2026-08-24"));
    assert.equal(weeks.length >= 4 && weeks.length <= 6, true);
  });

  it("includes a cross-month week in both months", () => {
    const jul = weeksIntersectingMonth(2026, 7).map(formatWeekStartParam);
    const aug = weeksIntersectingMonth(2026, 8).map(formatWeekStartParam);
    assert.ok(jul.includes("2026-07-27"));
    assert.ok(aug.includes("2026-07-27"));
  });
});

describe("month / week URL helpers", () => {
  it("parses and formats month params", () => {
    assert.deepEqual(parseMonthParam("2026-08"), { year: 2026, month: 8 });
    assert.equal(formatMonthParam(2026, 8), "2026-08");
    assert.deepEqual(shiftMonth(2026, 12, 1), { year: 2027, month: 1 });
  });

  it("parses weekStart and normalizes to Monday", () => {
    const parsed = parseWeekStartParam("2026-08-05");
    assert.ok(parsed);
    assert.equal(formatWeekStartParam(parsed), "2026-08-03");
    assert.equal(parseWeekStartParam("nope"), null);
  });

  it("resolves week index and clamps invalid week", () => {
    const now = ymdToDate(2026, 8, 5);
    const selected = resolvePlannerSelection({
      monthParam: "2026-08",
      weekParam: "2",
      now,
    });
    assert.equal(selected.weekIndex, 2);
    assert.equal(formatWeekStartParam(selected.weekStart), "2026-08-03");

    const clamped = resolvePlannerSelection({
      monthParam: "2026-08",
      weekParam: "99",
      now,
    });
    assert.equal(clamped.weekIndex, 2);
  });
});

describe("legacy weekStart keying + return month", () => {
  it("keys Asia/Jakarta local-midnight Monday to the same YYYY-MM-DD", () => {
    // 2026-08-03 00:00 WIB = 2026-08-02T17:00:00.000Z
    const legacy = new Date("2026-08-02T17:00:00.000Z");
    const canonical = ymdToDate(2026, 8, 3);
    assert.equal(formatWeekStartParam(legacy), "2026-08-03");
    assert.equal(formatWeekStartParam(canonical), "2026-08-03");
  });

  it("defaults cross-month week to Thursday's month", () => {
    // Week Mon 2026-07-27 … Sun 2026-08-02 → Thursday is Jul 30
    const weekStart = ymdToDate(2026, 7, 27);
    const picked = monthForWeekStart(weekStart);
    assert.equal(picked.monthParam, "2026-07");
    assert.equal(picked.weekIndex >= 1, true);
  });

  it("prefers viewed month when the week intersects it", () => {
    const weekStart = ymdToDate(2026, 7, 27);
    assert.equal(
      plannerHref({
        weekStart,
        monthParam: "2026-08",
        weekParam: "1",
      }),
      "/planner?month=2026-08&week=1",
    );
    assert.equal(
      plannerHref({ weekStart, toast: "saved" }),
      "/planner?month=2026-07&week=" +
        String(monthForWeekStart(weekStart).weekIndex) +
        "&toast=saved",
    );
  });
});
