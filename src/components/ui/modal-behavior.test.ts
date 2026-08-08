import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MODAL_POSITION_CLASSNAME,
  modalContentClassName,
  modalFinalFocus,
  planAvatarPickerOpen,
  planModalOpenChange,
} from "./modal-behavior";

/**
 * Smoke coverage for Modal → shadcn Dialog residual risks:
 * 1) Escape / backdrop while form is loading (must cancel Base UI close)
 * 2) Avatar "Ubah" → file picker focus (restoreFocus / finalFocus)
 * 3) Mobile bottom-sheet vs desktop centered layout classes
 */
describe("modal smoke: dismiss while loading (Escape / backdrop)", () => {
  it("allows close when idle (allowClose)", () => {
    assert.deepEqual(planModalOpenChange(false, true), { action: "close" });
  });

  it("cancels dismiss while pending so Floating UI does not return focus", () => {
    // Mirrors change-password / niche / goal editors during submit.
    assert.deepEqual(planModalOpenChange(false, false), { action: "cancel" });
  });

  it("ignores open→open transitions", () => {
    assert.deepEqual(planModalOpenChange(true, true), { action: "noop" });
    assert.deepEqual(planModalOpenChange(true, false), { action: "noop" });
  });
});

describe("modal smoke: avatar file picker focus", () => {
  it("maps restoreFocus to Dialog finalFocus 1:1", () => {
    assert.equal(modalFinalFocus(true), true);
    assert.equal(modalFinalFocus(false), false);
  });

  it("Ubah while modal open: click picker in place, keep restoreFocus", () => {
    assert.deepEqual(planAvatarPickerOpen(true), {
      clickWhileOpen: true,
      restoreFocus: true,
    });
  });

  it("empty-avatar path: defer picker and disable restoreFocus", () => {
    assert.deepEqual(planAvatarPickerOpen(false), {
      clickWhileOpen: false,
      restoreFocus: false,
    });
    assert.equal(
      modalFinalFocus(planAvatarPickerOpen(false).restoreFocus),
      false,
    );
  });
});

describe("modal smoke: mobile sheet vs desktop center", () => {
  it("anchors to bottom on mobile", () => {
    assert.match(MODAL_POSITION_CLASSNAME, /\bbottom-4\b/);
    assert.match(MODAL_POSITION_CLASSNAME, /\btop-auto\b/);
    assert.match(MODAL_POSITION_CLASSNAME, /slide-in-from-bottom-4/);
  });

  it("centers on sm+ breakpoints", () => {
    assert.match(MODAL_POSITION_CLASSNAME, /\bsm:top-1\/2\b/);
    assert.match(MODAL_POSITION_CLASSNAME, /\bsm:bottom-auto\b/);
    assert.match(MODAL_POSITION_CLASSNAME, /\bsm:-translate-y-1\/2\b/);
  });

  it("composes size tokens for xs/sm modals", () => {
    const xs = modalContentClassName("xs");
    const sm = modalContentClassName("sm");
    assert.match(xs, /\bmax-w-xs\b/);
    assert.match(sm, /\bmax-w-sm\b/);
    assert.ok(xs.includes(MODAL_POSITION_CLASSNAME));
    assert.ok(sm.includes(MODAL_POSITION_CLASSNAME));
  });
});
