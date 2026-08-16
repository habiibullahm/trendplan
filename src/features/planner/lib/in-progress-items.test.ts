import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  listInProgressContentItems,
  MAX_WEEK_CONTENT_SLOTS,
} from "@/features/planner/lib/in-progress-items";
import type { ContentStatus } from "@/generated/prisma/client";

function item(dayOfWeek: number, status: ContentStatus, title = `d${dayOfWeek}`) {
  return { dayOfWeek, status, title };
}

describe("listInProgressContentItems", () => {
  it("excludes POSTED and keeps IDE/DRAFT/READY", () => {
    const result = listInProgressContentItems([
      item(0, "IDE", "a"),
      item(1, "POSTED", "b"),
      item(2, "DRAFT", "c"),
      item(3, "READY", "d"),
    ]);
    assert.deepEqual(
      result.map((r) => r.title),
      ["a", "c", "d"],
    );
  });

  it("sorts by dayOfWeek", () => {
    const result = listInProgressContentItems([
      item(5, "IDE", "sab"),
      item(0, "IDE", "sen"),
      item(2, "DRAFT", "rab"),
    ]);
    assert.deepEqual(
      result.map((r) => r.title),
      ["sen", "rab", "sab"],
    );
  });

  it("caps at MAX_WEEK_CONTENT_SLOTS", () => {
    const overflow = Array.from({ length: MAX_WEEK_CONTENT_SLOTS + 3 }, (_, i) =>
      item(i, "IDE", `x${i}`),
    );
    const result = listInProgressContentItems(overflow);
    assert.equal(result.length, MAX_WEEK_CONTENT_SLOTS);
    assert.equal(result[0]?.title, "x0");
    assert.equal(result[MAX_WEEK_CONTENT_SLOTS - 1]?.title, `x${MAX_WEEK_CONTENT_SLOTS - 1}`);
  });

  it("returns empty when only posted", () => {
    assert.deepEqual(listInProgressContentItems([item(0, "POSTED")]), []);
  });
});
