import sharp from "sharp";

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MAX_EDGE = 512;
export const AVATAR_WEBP_QUALITY = 82;

export type ImageKind = "image/jpeg" | "image/png" | "image/webp";

export const AVATAR_EXT: Record<ImageKind, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const AVATAR_ACCEPT = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** Detect real image type from magic bytes (do not trust client MIME). */
export function sniffImageKind(bytes: Uint8Array): ImageKind | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  // RIFF....WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export type ClientAvatarFileError =
  | "format"
  | "size"
  | null;

/** Client-side gate before preview / upload (server still sniffs magic bytes). */
export function validateAvatarFileClient(file: {
  type: string;
  size: number;
}): ClientAvatarFileError {
  if (!AVATAR_ACCEPT.has(file.type)) return "format";
  if (file.size > AVATAR_MAX_BYTES) return "size";
  return null;
}

/** Hapus in the preview sheet: discard a pending pick, or confirm deleting the saved photo. */
export function removeButtonMode(
  hasPendingFile: boolean,
): "discard-pending" | "confirm-delete" {
  return hasPendingFile ? "discard-pending" : "confirm-delete";
}

/** Perbarui is enabled only after a new file is chosen and previewed. */
export function canSubmitAvatarUpdate(
  hasPendingFile: boolean,
  hasLocalPreview: boolean,
): boolean {
  return hasPendingFile && hasLocalPreview;
}

/**
 * Backdrop / Escape must not wipe a pending pick — user can reopen and still
 * tap Perbarui or Batal.
 */
export function shouldDiscardPendingOnModalClose(): boolean {
  return false;
}

export type PreparedAvatar = {
  buffer: Buffer;
  contentType: "image/webp";
  ext: "webp";
};

/**
 * Normalize avatar uploads: EXIF orient, cover-crop to max edge, WebP encode.
 * Keeps display payloads small for 48–112px avatars served unoptimized from Blob.
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
