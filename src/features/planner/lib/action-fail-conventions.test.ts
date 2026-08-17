import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { actionFail } from "@/lib/action-result";

describe("planner/activity actionFail conventions", () => {
  it("uses invalid_payload (not catalog invalid) for bad form ids", () => {
    assert.deepEqual(
      actionFail("invalid_payload", { error: "Data tidak valid." }),
      {
        status: "error",
        message: "Data tidak valid.",
        data: { errorCode: "invalid_payload" },
      },
    );
  });

  it("keeps day / empty-activity copy", () => {
    assert.equal(
      actionFail("invalid_day", { error: "Pilih hari yang valid." }).message,
      "Pilih hari yang valid.",
    );
    assert.equal(
      actionFail("activity_empty", {
        error: "Isi minimal satu aktivitas.",
      }).data?.errorCode,
      "activity_empty",
    );
  });
});
