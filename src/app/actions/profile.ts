"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ProfileImageActionState = {
  error?: string;
  success?: string;
};

const MAX_BYTES = 2 * 1024 * 1024;

type ImageKind = "image/jpeg" | "image/png" | "image/webp";

const EXT: Record<ImageKind, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Detect real image type from magic bytes (do not trust client MIME). */
function sniffImageKind(bytes: Uint8Array): ImageKind | null {
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

function isOurAvatarBlob(url: string, userId: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname.endsWith(".public.blob.vercel-storage.com") &&
      u.pathname.includes(`/avatars/${userId}/`)
    );
  } catch {
    return false;
  }
}

async function deleteAvatarBestEffort(
  url: string | null | undefined,
  userId: string,
) {
  if (!url || !isOurAvatarBlob(url, userId)) return;
  try {
    await del(url);
  } catch {
    // best-effort cleanup
  }
}

export async function uploadProfileImageAction(
  prev: ProfileImageActionState,
  formData: FormData,
): Promise<ProfileImageActionState> {
  void prev;
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sesi berakhir. Masuk lagi." };
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: "Upload belum dikonfigurasi (BLOB_READ_WRITE_TOKEN)." };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pilih foto terlebih dahulu." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Ukuran maksimal 2 MB." };
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const kind = sniffImageKind(header);
  if (!kind) {
    return { error: "Format harus JPEG, PNG, atau WebP." };
  }

  const userId = session.user.id;
  const ext = EXT[kind];
  const pathname = `avatars/${userId}/${crypto.randomUUID()}.${ext}`;

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { imageUrl: true },
  });

  let blobUrl: string;
  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: kind,
    });
    blobUrl = blob.url;
  } catch {
    return { error: "Gagal mengunggah foto. Coba lagi." };
  }

  try {
    // Only swap if imageUrl is still what we read — avoids wiping a newer upload.
    const updated = await prisma.user.updateMany({
      where: {
        id: userId,
        imageUrl: existing?.imageUrl ?? null,
      },
      data: { imageUrl: blobUrl },
    });
    if (updated.count === 0) {
      await deleteAvatarBestEffort(blobUrl, userId);
      return { error: "Foto berubah di perangkat lain. Coba lagi." };
    }
  } catch {
    await deleteAvatarBestEffort(blobUrl, userId);
    return { error: "Gagal menyimpan foto. Coba lagi." };
  }

  await deleteAvatarBestEffort(existing?.imageUrl, userId);

  revalidatePath("/akun");
  revalidatePath("/dashboard");
  return { success: "Foto profil diperbarui" };
}

export async function removeProfileImageAction(
  prev: ProfileImageActionState,
  formData: FormData,
): Promise<ProfileImageActionState> {
  void prev;
  void formData;
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sesi berakhir. Masuk lagi." };
  }

  const userId = session.user.id;
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { imageUrl: true },
  });

  if (!existing?.imageUrl) {
    return { error: "Belum ada foto profil." };
  }

  try {
    const updated = await prisma.user.updateMany({
      where: { id: userId, imageUrl: existing.imageUrl },
      data: { imageUrl: null },
    });
    if (updated.count === 0) {
      return { error: "Foto sudah dihapus atau diganti." };
    }
  } catch {
    return { error: "Gagal menghapus foto. Coba lagi." };
  }

  await deleteAvatarBestEffort(existing.imageUrl, userId);

  revalidatePath("/akun");
  revalidatePath("/dashboard");
  return { success: "Foto profil dihapus" };
}
