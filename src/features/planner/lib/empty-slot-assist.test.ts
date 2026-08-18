import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyPlannerDays,
  shouldShowEmptySlotSaran,
  unusedTrendsForEmptyDays,
} from "./empty-slot-assist";

function trend(id: string, score: number) {
  return { id, title: id, reason: null, score };
}

describe("emptyPlannerDays", () => {
  it("returns all days when none are occupied", () => {
    assert.deepEqual(emptyPlannerDays([]), [0, 1, 2, 3, 4, 5, 6]);
  });

  it("omits occupied days", () => {
    assert.deepEqual(emptyPlannerDays([1, 3, 3]), [0, 2, 4, 5, 6]);
  });
});

describe("unusedTrendsForEmptyDays", () => {
  const catalog = [trend("a", 90), trend("b", 80), trend("c", 70)];

  it("keeps score order and drops used ids", () => {
    assert.deepEqual(
      unusedTrendsForEmptyDays({
        trends: catalog,
        usedTrendIds: ["a", null, undefined],
        limit: 2,
      }),
      [trend("b", 80), trend("c", 70)],
    );
  });

  it("returns empty when every trend is already on the week", () => {
    assert.deepEqual(
      unusedTrendsForEmptyDays({
        trends: catalog,
        usedTrendIds: ["a", "b", "c"],
      }),
      [],
    );
  });

  it("caps at the limit", () => {
    assert.equal(
      unusedTrendsForEmptyDays({
        trends: catalog,
        usedTrendIds: [],
        limit: 1,
      }).length,
      1,
    );
  });
});

describe("shouldShowEmptySlotSaran", () => {
  it("hides when the week is full", () => {
    assert.equal(
      shouldShowEmptySlotSaran({
        emptyDays: [],
        unusedTrends: [trend("a", 1)],
      }),
      false,
    );
  });

  it("hides when nothing unused remains", () => {
    assert.equal(
      shouldShowEmptySlotSaran({
        emptyDays: [0],
        unusedTrends: [],
      }),
      false,
    );
  });

  it("shows when both empty days and unused trends exist", () => {
    assert.equal(
      shouldShowEmptySlotSaran({
        emptyDays: [2],
        unusedTrends: [trend("a", 1)],
      }),
      true,
    );
  });
});
