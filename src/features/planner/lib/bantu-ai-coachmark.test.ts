import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isBantuAiCoachOpen,
  isBantuAiCoachSeen,
  shouldShowBantuAiCoach,
} from "./bantu-ai-coachmark";

describe("shouldShowBantuAiCoach", () => {
  it("shows on planner detail when unseen", () => {
    assert.equal(
      shouldShowBantuAiCoach({ stored: null, pathname: "/planner/abc" }),
      true,
    );
  });

  it("hides after seen", () => {
    assert.equal(
      shouldShowBantuAiCoach({ stored: "1", pathname: "/planner/abc" }),
      false,
    );
  });

  it("hides on demo routes even when unseen", () => {
    assert.equal(
      shouldShowBantuAiCoach({ stored: null, pathname: "/demo" }),
      false,
    );
    assert.equal(
      shouldShowBantuAiCoach({
        stored: null,
        pathname: "/demo/planner",
      }),
      false,
    );
  });

  it("treats only the seen sentinel as dismissed", () => {
    assert.equal(isBantuAiCoachSeen(null), false);
    assert.equal(isBantuAiCoachSeen("1"), true);
    assert.equal(isBantuAiCoachSeen("true"), false);
  });
});

describe("isBantuAiCoachOpen", () => {
  it("hides after in-memory dismiss even when storage is still empty", () => {
    assert.equal(
      isBantuAiCoachOpen({
        dismissed: true,
        stored: null,
        pathname: "/planner/abc",
      }),
      false,
    );
  });

  it("still shows when not dismissed and unseen", () => {
    assert.equal(
      isBantuAiCoachOpen({
        dismissed: false,
        stored: null,
        pathname: "/planner/abc",
      }),
      true,
    );
  });
});
