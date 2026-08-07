import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sharp from "sharp";
import {
  AVATAR_MAX_BYTES,
  AVATAR_MAX_EDGE,
  canSubmitAvatarUpdate,
  prepareAvatarUpload,
  removeButtonMode,
  shouldDiscardPendingOnModalClose,
  sniffImageKind,
  validateAvatarFileClient,
} from "./avatar-image";

describe("validateAvatarFileClient", () => {
  it("rejects unsupported MIME", () => {
    assert.equal(
      validateAvatarFileClient({ type: "image/gif", size: 100 }),
      "format",
    );
  });

  it("rejects oversized files", () => {
    assert.equal(
      validateAvatarFileClient({
        type: "image/jpeg",
        size: AVATAR_MAX_BYTES + 1,
      }),
      "size",
    );
  });

  it("accepts jpeg/png/webp within limit", () => {
    assert.equal(
      validateAvatarFileClient({ type: "image/png", size: 1024 }),
      null,
    );
  });
});

describe("removeButtonMode + canSubmitAvatarUpdate (pick → Perbarui / Hapus)", () => {
  it("pending pick enables Perbarui and uses Batal (discard)", () => {
    assert.equal(canSubmitAvatarUpdate(true, true), true);
    assert.equal(removeButtonMode(true), "discard-pending");
  });

  it("without pending pick, Perbarui stays off and Hapus confirms delete", () => {
    assert.equal(canSubmitAvatarUpdate(false, false), false);
    assert.equal(canSubmitAvatarUpdate(true, false), false);
    assert.equal(removeButtonMode(false), "confirm-delete");
  });
});

describe("shouldDiscardPendingOnModalClose", () => {
  it("keeps pending pick when the preview sheet closes", () => {
    assert.equal(shouldDiscardPendingOnModalClose(), false);
  });
});

describe("sniffImageKind", () => {
  it("detects PNG magic bytes", async () => {
    const png = await sharp({
      create: {
        width: 8,
        height: 8,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      .png()
      .toBuffer();
    assert.equal(sniffImageKind(png.subarray(0, 16)), "image/png");
  });

  it("returns null for non-images", () => {
    assert.equal(sniffImageKind(Buffer.from("not-an-image")), null);
  });
});

describe("prepareAvatarUpload", () => {
  it("rejects non-image buffers", async () => {
    const result = await prepareAvatarUpload(Buffer.from("hello"));
    assert.deepEqual(result, { error: "format" });
  });

  it("resizes large images to max edge and encodes webp", async () => {
    // Noise so JPEG isn't tiny after solid-color compression.
    const input = await sharp({
      create: {
        width: 1200,
        height: 800,
        channels: 3,
        noise: { type: "gaussian", mean: 128, sigma: 30 },
      },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    const result = await prepareAvatarUpload(input);
    assert.ok(!("error" in result));
    if ("error" in result) return;

    assert.equal(result.contentType, "image/webp");
    assert.equal(result.ext, "webp");
    assert.ok(result.buffer.byteLength < input.byteLength);

    const meta = await sharp(result.buffer).metadata();
    assert.equal(meta.format, "webp");
    assert.ok((meta.width ?? 0) <= AVATAR_MAX_EDGE);
    assert.ok((meta.height ?? 0) <= AVATAR_MAX_EDGE);
    // cover fit on 1200x800 → 512x512
    assert.equal(meta.width, AVATAR_MAX_EDGE);
    assert.equal(meta.height, AVATAR_MAX_EDGE);
  });

  it("does not upscale tiny images", async () => {
    const input = await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 3,
        background: { r: 1, g: 2, b: 3 },
      },
    })
      .png()
      .toBuffer();

    const result = await prepareAvatarUpload(input);
    assert.ok(!("error" in result));
    if ("error" in result) return;

    const meta = await sharp(result.buffer).metadata();
    assert.equal(meta.width, 64);
    assert.equal(meta.height, 64);
  });
});
