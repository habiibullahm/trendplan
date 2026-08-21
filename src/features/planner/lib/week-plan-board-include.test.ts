import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  weekPlanBerandaInclude,
  weekPlanBoardInclude,
} from "@/features/planner/lib/week-plan-board-include";

describe("weekPlan includes", () => {
  it("board include loads share relations for planner", () => {
    const include = weekPlanBoardInclude();
    assert.ok(include.user);
    assert.ok(include.members);
    assert.ok(include.invites);
    assert.ok(include.items);
  });

  it("beranda include stays lean — items only, no share joins", () => {
    const include = weekPlanBerandaInclude();
    assert.ok(include.items);
    assert.equal("user" in include, false);
    assert.equal("members" in include, false);
    assert.equal("invites" in include, false);
    assert.ok(
      include.items &&
        typeof include.items === "object" &&
        "select" in include.items,
    );
  });
});
