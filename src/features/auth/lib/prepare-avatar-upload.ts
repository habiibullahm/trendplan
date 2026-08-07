import "server-only";

import sharp from "sharp";
import {
  AVATAR_MAX_EDGE,
  AVATAR_WEBP_QUALITY,
  sniffImageKind,
} from "@/features/auth/lib/avatar-image";

export type PreparedAvatar = {
  buffer: Buffer;
  contentType: "image/webp";
  ext: "webp";
};

/**
 * Normalize avatar uploads: EXIF orient, cover-crop to max edge, WebP encode.
 * Server-only — import from Server Actions / route handlers, never Client Components
 * (sharp pulls Node builtins like child_process).
 */
export async function prepareAvatarUpload(
  input: Buffer,
): Promise<PreparedAvatar | { error: "format" }> {
  const kind = sniffImageKind(input.subarray(0, 16));
  if (!kind) return { error: "format" };

  const buffer = await sharp(input)
    .rotate()
    .resize(AVATAR_MAX_EDGE, AVATAR_MAX_EDGE, {
      fit: "cover",
      withoutEnlargement: true,
    })
    .webp({ quality: AVATAR_WEBP_QUALITY })
    .toBuffer();

  return { buffer, contentType: "image/webp", ext: "webp" };
}
