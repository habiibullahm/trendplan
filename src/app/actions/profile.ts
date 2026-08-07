"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { AVATAR_MAX_BYTES } from "@/features/auth/lib/avatar-image";
import { prepareAvatarUpload } from "@/features/auth/lib/prepare-avatar-upload";
import { prisma } from "@/lib/prisma";

export type ProfileImageActionState = {
  error?: string;
  success?: string;
};

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
  if (file.size > AVATAR_MAX_BYTES) {
    return { error: "Ukuran maksimal 2 MB." };
  }

  const raw = Buffer.from(await file.arrayBuffer());
  let prepared: Awaited<ReturnType<typeof prepareAvatarUpload>>;
  try {
    prepared = await prepareAvatarUpload(raw);
  } catch {
    return { error: "Gagal memproses foto. Coba lagi." };
  }
  if ("error" in prepared) {
    return { error: "Format harus JPEG, PNG, atau WebP." };
  }

  const userId = session.user.id;
  const pathname = `avatars/${userId}/${crypto.randomUUID()}.${prepared.ext}`;

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { imageUrl: true },
  });

  let blobUrl: string;
  try {
    const blob = await put(pathname, prepared.buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: prepared.contentType,
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
