import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ActivityEditPageLoading, PlannerPageLoading } from "@/app/loadings";
import ActivityLoading from "./loading";

describe("planner/aktivitas/loading", () => {
  it("wires the activity form skeleton, not the Plan board skeleton", () => {
    assert.equal(ActivityLoading, ActivityEditPageLoading);
    assert.notEqual(ActivityLoading, PlannerPageLoading);
  });
});
