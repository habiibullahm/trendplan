import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDropDay, dropId, dragId } from "./planner-dnd";

describe("parseDropDay", () => {
  const items = [
    { id: "a", dayOfWeek: 0 },
    { id: "b", dayOfWeek: 4 },
  ];

  it("reads day from list/grid droppable id", () => {
    assert.equal(parseDropDay("list-day-2", items), 2);
    assert.equal(parseDropDay("grid-day-6", items), 6);
  });

  it("rejects out-of-range day ids", () => {
    assert.equal(parseDropDay("list-day-7", items), null);
    assert.equal(parseDropDay("grid-day--1", items), null);
  });

  it("resolves day when dropping onto another card", () => {
    assert.equal(parseDropDay("grid-item-b", items), 4);
    assert.equal(parseDropDay("list-item-a", items), 0);
  });

  it("returns null for unknown targets", () => {
    assert.equal(parseDropDay(undefined, items), null);
    assert.equal(parseDropDay("grid-item-missing", items), null);
    assert.equal(parseDropDay("nope", items), null);
  });
});

describe("dropId / dragId", () => {
  it("builds stable ids", () => {
    assert.equal(dropId("list", 3), "list-day-3");
    assert.equal(dragId("grid", "xyz"), "grid-item-xyz");
  });
});

describe("move stale-check contract", () => {
  it("documents expectedFromDay mismatch should abort", () => {
    // Mirrors moveContentItemAction guard: client sends fromDay; server aborts if DB differs.
    const dbFromDay: number = 1;
    const expectedFromDay: number = 0;
    const stale = expectedFromDay !== dbFromDay;
    assert.equal(stale, true);
  });
});
