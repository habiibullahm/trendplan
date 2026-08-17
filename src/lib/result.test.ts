import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isErr,
  isOk,
  resultErr,
  resultOk,
  type Result,
} from "@/lib/result";

describe("Result helpers", () => {
  it("resultOk keeps ok:true after spreading payload (no clobber)", () => {
    const result = resultOk({ rawToken: "t", inviteId: "i", ok: false as never });
    assert.equal(result.ok, true);
    assert.equal(result.rawToken, "t");
    assert.equal(result.inviteId, "i");
  });

  it("resultErr carries a stable domain code", () => {
    const result = resultErr("self_invite");
    assert.equal(result.ok, false);
    assert.equal(result.code, "self_invite");
  });

  it("narrows with isOk / isErr", () => {
    const success: Result<{ url: string }, "invalid"> = resultOk({ url: "/x" });
    const failure: Result<{ url: string }, "invalid"> = resultErr("invalid");

    assert.equal(isOk(success), true);
    assert.equal(isErr(success), false);
    if (isOk(success)) {
      assert.equal(success.url, "/x");
    }

    assert.equal(isOk(failure), false);
    assert.equal(isErr(failure), true);
    if (isErr(failure)) {
      assert.equal(failure.code, "invalid");
    }
  });
});
