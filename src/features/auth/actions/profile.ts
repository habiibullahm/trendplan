"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { AVATAR_MAX_BYTES } from "@/features/auth/lib/avatar-image";
import { prepareAvatarUpload } from "@/features/auth/lib/prepare-avatar-upload";
import {
  assertRateLimits,
  getClientIp,
} from "@/lib/action-middleware";
import {
  actionFail,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";
import { requireAppUserAction } from "@/lib/auth/require-app-user";
import { prisma } from "@/lib/prisma";
import {
  AVATAR_UPLOAD_IP_LIMIT,
  AVATAR_UPLOAD_USER_LIMIT,
} from "@/lib/rate-limit-policies";

export type ProfileImageActionState = ActionResult;

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
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return actionFail("blob_not_configured", {
      error: "Upload belum dikonfigurasi (BLOB_READ_WRITE_TOKEN).",
    });
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return actionFail("no_file", {
      error: "Pilih foto terlebih dahulu.",
    });
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return actionFail("file_too_large", {
      error: "Ukuran maksimal 2 MB.",
    });
  }

  const ip = await getClientIp();
  const limited = await assertRateLimits(
    {
      key: `avatar-upload:user:${gated.userId}`,
      options: AVATAR_UPLOAD_USER_LIMIT,
    },
    { key: `avatar-upload:ip:${ip}`, options: AVATAR_UPLOAD_IP_LIMIT },
  );
  if (limited) return limited;

  const raw = Buffer.from(await file.arrayBuffer());
  let prepared: Awaited<ReturnType<typeof prepareAvatarUpload>>;
  try {
    prepared = await prepareAvatarUpload(raw);
  } catch {
    return actionFail("process_failed", {
      error: "Gagal memproses foto. Coba lagi.",
    });
  }
  if ("error" in prepared) {
    return actionFail("invalid_format", {
      error: "Format harus JPEG, PNG, atau WebP.",
    });
  }

  const userId = gated.userId;
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
    return actionFail("upload_failed", {
      error: "Gagal mengunggah foto. Coba lagi.",
    });
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
      return actionFail("conflict", {
        error: "Foto berubah di perangkat lain. Coba lagi.",
      });
    }
  } catch {
    await deleteAvatarBestEffort(blobUrl, userId);
    return actionFail("save_failed", {
      error: "Gagal menyimpan foto. Coba lagi.",
    });
  }

  await deleteAvatarBestEffort(existing?.imageUrl, userId);

  revalidatePath("/akun");
  revalidatePath("/dashboard");
  return actionSuccess("Foto profil diperbarui");
}

export async function removeProfileImageAction(
  prev: ProfileImageActionState,
  formData: FormData,
): Promise<ProfileImageActionState> {
  void prev;
  void formData;
  const gated = await requireAppUserAction();
  if (!gated.ok) return gated.result;

  const userId = gated.userId;
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { imageUrl: true },
  });

  if (!existing?.imageUrl) {
    return actionFail("no_avatar", {
      error: "Belum ada foto profil.",
    });
  }

  try {
    const updated = await prisma.user.updateMany({
      where: { id: userId, imageUrl: existing.imageUrl },
      data: { imageUrl: null },
    });
    if (updated.count === 0) {
      return actionFail("remove_conflict", {
        error: "Foto sudah dihapus atau diganti.",
      });
    }
  } catch {
    return actionFail("remove_failed", {
      error: "Gagal menghapus foto. Coba lagi.",
    });
  }

  await deleteAvatarBestEffort(existing.imageUrl, userId);

  revalidatePath("/akun");
  revalidatePath("/dashboard");
  return actionSuccess("Foto profil dihapus");
}
