import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  loginPath,
  registerPath,
  safeAuthCallbackUrl,
  withAuthCallbackQuery,
} from "@/lib/auth/callback-url";

describe("auth callbackUrl helpers", () => {
  it("safeAuthCallbackUrl rejects open redirects", () => {
    assert.equal(
      safeAuthCallbackUrl("/invite/week?token=a"),
      "/invite/week?token=a",
    );
    assert.equal(safeAuthCallbackUrl("//evil.example"), null);
    assert.equal(safeAuthCallbackUrl("https://evil.example"), null);
    assert.equal(safeAuthCallbackUrl(undefined), null);
  });

  it("withAuthCallbackQuery merges into existing query", () => {
    assert.equal(
      withAuthCallbackQuery("/login?registered=1", "/invite/week?token=x"),
      "/login?registered=1&callbackUrl=%2Finvite%2Fweek%3Ftoken%3Dx",
    );
    assert.equal(withAuthCallbackQuery("/onboarding", null), "/onboarding");
  });

  it("loginPath and registerPath carry callback", () => {
    assert.equal(
      loginPath({ registered: true, callbackUrl: "/invite/week?token=1" }),
      "/login?registered=1&callbackUrl=%2Finvite%2Fweek%3Ftoken%3D1",
    );
    assert.equal(
      registerPath("/invite/week?token=1"),
      "/register?callbackUrl=%2Finvite%2Fweek%3Ftoken%3D1",
    );
  });
});
