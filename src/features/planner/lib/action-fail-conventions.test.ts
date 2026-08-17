import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { actionFail } from "@/lib/action-result";

/** Lock common planner/activity payload failure copy + domain errorCode. */
describe("planner/activity actionFail conventions", () => {
  it("uses invalid_payload (not catalog invalid) for bad form ids", () => {
    assert.deepEqual(
      actionFail("invalid_payload", { error: "Data tidak valid." }),
      {
        errorCode: "invalid_payload",
        error: "Data tidak valid.",
      },
    );
  });

  it("keeps day / empty-activity copy", () => {
    assert.equal(
      actionFail("invalid_day", { error: "Pilih hari yang valid." }).error,
      "Pilih hari yang valid.",
    );
    assert.equal(
      actionFail("activity_empty", {
        error: "Isi minimal satu aktivitas.",
      }).errorCode,
      "activity_empty",
    );
  });
});
