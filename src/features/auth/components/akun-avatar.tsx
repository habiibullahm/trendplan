"use client";

import Image from "next/image";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";
import {
  removeProfileImageAction,
  uploadProfileImageAction,
  type ProfileImageActionState,
} from "@/features/auth/actions/profile";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import {
  canSubmitAvatarUpdate,
  removeButtonMode,
  shouldDiscardPendingOnModalClose,
  validateAvatarFileClient,
} from "@/features/auth/lib/avatar-image";
import { useActionToasts } from "@/hooks/use-action-toasts";

const emptyState: ProfileImageActionState = {};
const DELETE_CONFIRM_TOAST_ID = "avatar-delete-confirm";

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

const actionBtnClass =
  "flex flex-col items-center gap-1.5 outline-none disabled:opacity-50";

const actionIconClass =
  "flex h-11 w-11 items-center justify-center rounded-full border bg-surface shadow-sm transition enabled:active:scale-95 focus-visible:ring-2 focus-visible:ring-coral/40";

export function AkunAvatar({
  imageUrl,
  initialLetter,
  name,
  email,
}: {
  imageUrl: string | null;
  initialLetter: string;
  name: string;
  email: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [hasPendingFile, setHasPendingFile] = useState(false);
  const [openingPicker, setOpeningPicker] = useState(false);
  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadProfileImageAction,
    emptyState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeProfileImageAction,
    emptyState,
  );
  const pending = uploadPending || removePending;
  const shownUrl = localPreview ?? imageUrl;
  const modalOpen = Boolean(menuOpen && shownUrl);
  const canUpdate = canSubmitAvatarUpdate(hasPendingFile, Boolean(localPreview));
  const removeMode = removeButtonMode(hasPendingFile);

  useActionToasts(uploadState);
  useActionToasts(removeState);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    if (uploadState.success && inputRef.current) {
      inputRef.current.value = "";
      setHasPendingFile(false);
      setMenuOpen(false);
    }
  }, [uploadState.success]);

  // Clear optimistic preview on failed upload.
  useEffect(() => {
    if (!uploadState.error || !localPreview) return;
    const url = localPreview;
    queueMicrotask(() => {
      URL.revokeObjectURL(url);
      setLocalPreview((prev) => (prev === url ? null : prev));
      setHasPendingFile(false);
      if (inputRef.current) inputRef.current.value = "";
    });
  }, [uploadState.error, localPreview]);

  // After success, drop blob once server imageUrl refreshes.
  const prevImageUrl = useRef(imageUrl);
  useEffect(() => {
    if (prevImageUrl.current === imageUrl) return;
    prevImageUrl.current = imageUrl;
    if (!localPreview) return;
    const url = localPreview;
    queueMicrotask(() => {
      URL.revokeObjectURL(url);
      setLocalPreview((prev) => (prev === url ? null : prev));
      setHasPendingFile(false);
    });
  }, [imageUrl, localPreview]);

  // Open file picker after modal unmounts (avoids focus-restore dismissing it).
  useEffect(() => {
    if (menuOpen || !openingPicker) return;
    const id = requestAnimationFrame(() => {
      inputRef.current?.click();
      setOpeningPicker(false);
    });
    return () => cancelAnimationFrame(id);
  }, [menuOpen, openingPicker]);

  function openPicker() {
    // Keep modal open when replacing from preview; close first only when
    // starting from the empty avatar (no dialog yet).
    if (menuOpen) {
      inputRef.current?.click();
      return;
    }
    setOpeningPicker(true);
    setMenuOpen(false);
  }

  function onAvatarClick() {
    if (pending) return;
    if (shownUrl) {
      setMenuOpen(true);
      return;
    }
    openPicker();
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const invalid = validateAvatarFileClient(file);
    if (invalid === "format") {
      toast.error("Format harus JPEG, PNG, atau WebP.");
      input.value = "";
      return;
    }
    if (invalid === "size") {
      toast.error("Ukuran maksimal 2 MB.");
      input.value = "";
      return;
    }
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setHasPendingFile(true);
    setMenuOpen(true);
  }

  function onUpdate() {
    if (!canUpdate || pending) return;
    uploadFormRef.current?.requestSubmit();
  }

  function discardPendingPick() {
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setHasPendingFile(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onRemoveClick() {
    if (pending) return;
    if (removeMode === "discard-pending") {
      discardPendingPick();
      if (!imageUrl) setMenuOpen(false);
      return;
    }

    setMenuOpen(false);
    toast("Hapus foto profil?", {
      id: DELETE_CONFIRM_TOAST_ID,
      description: "Tindakan ini tidak bisa dibatalkan.",
      className: "tp-toast tp-toast-delete",
      duration: 8_000,
      action: {
        label: "Hapus",
        onClick: () => {
          discardPendingPick();
          startTransition(() => {
            removeAction(new FormData());
          });
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => undefined,
      },
    });
  }

  function onModalClose() {
    if (pending) return;
    if (shouldDiscardPendingOnModalClose() && hasPendingFile) {
      discardPendingPick();
    }
    setMenuOpen(false);
  }

  useEffect(() => {
    return () => {
      toast.dismiss(DELETE_CONFIRM_TOAST_ID);
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      {/* Real form box (not display:contents) — Safari form association. */}
      <form
        ref={uploadFormRef}
        action={uploadAction}
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        aria-hidden
      >
        <input
          ref={inputRef}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          tabIndex={-1}
          onChange={onFileChange}
        />
      </form>

      <button
        type="button"
        onClick={onAvatarClick}
        disabled={pending}
        aria-haspopup={shownUrl ? "dialog" : undefined}
        aria-expanded={modalOpen || undefined}
        aria-label={
          shownUrl ? "Lihat, ubah, atau hapus foto profil" : "Unggah foto profil"
        }
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-paper outline-none ring-coral/40 transition enabled:active:scale-[0.97] focus-visible:ring-2 disabled:opacity-60"
      >
        {shownUrl ? (
          localPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob: preview
            <img
              src={localPreview}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={shownUrl}
              alt=""
              width={48}
              height={48}
              // Public Blob CDN — skip /_next/image proxy (slow on local: full download + sharp).
              unoptimized
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <span className="flex h-full w-full items-center justify-center text-base font-bold text-ink">
            {initialLetter}
          </span>
        )}
        {/* Only when modal is closed — avoid stacking with preview spinner. */}
        {pending && !modalOpen ? (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/40 text-paper">
            <Spinner className="size-4" />
          </span>
        ) : null}
      </button>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        <p className="truncate text-sm text-ink-muted">{email}</p>
      </div>

      <Modal
        open={modalOpen}
        onClose={onModalClose}
        title="Foto profil"
        description={
          canUpdate
            ? "Ketuk Perbarui untuk menyimpan foto baru."
            : "Ubah, perbarui, atau hapus foto profil."
        }
        titleAlign="center"
        size="xs"
        bodyClassName="flex flex-col items-center gap-5"
        restoreFocus={!openingPicker}
      >
        <div className="relative h-28 w-28">
          <div className="h-full w-full overflow-hidden rounded-full border-2 border-border bg-paper shadow-sm">
            {localPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob: preview
              <img
                src={localPreview}
                alt={`Preview foto ${name}`}
                className="h-full w-full object-cover"
              />
            ) : shownUrl ? (
              <Image
                src={shownUrl}
                alt={`Foto ${name}`}
                width={112}
                height={112}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          {canUpdate ? (
            <span className="absolute -top-1 -right-1 rounded-full bg-coral px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              Baru
            </span>
          ) : null}
          {pending ? (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/45 text-paper">
              <Spinner className="size-5" />
            </span>
          ) : null}
        </div>

        <div className="flex w-full items-start justify-center gap-6">
          <button
            type="button"
            onClick={openPicker}
            disabled={pending}
            className={actionBtnClass}
          >
            <span className={`${actionIconClass} border-border text-ink`}>
              <PencilIcon className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-medium text-ink-muted">Ubah</span>
          </button>

          <button
            type="button"
            onClick={onUpdate}
            disabled={pending || !canUpdate}
            aria-label={
              canUpdate
                ? "Perbarui foto profil"
                : "Pilih foto baru terlebih dahulu"
            }
            className={actionBtnClass}
          >
            <span
              className={`${actionIconClass} ${
                canUpdate
                  ? "border-coral bg-coral/10 text-coral"
                  : "border-border text-ink-muted"
              }`}
            >
              <UploadIcon className="h-4 w-4" />
            </span>
            <span
              className={`text-[11px] font-medium ${
                canUpdate ? "text-coral" : "text-ink-muted"
              }`}
            >
              Perbarui
            </span>
          </button>

          <button
            type="button"
            onClick={onRemoveClick}
            disabled={pending}
            aria-label={
              removeMode === "discard-pending"
                ? "Buang pilihan foto"
                : "Hapus foto"
            }
            className={actionBtnClass}
          >
            <span className={`${actionIconClass} border-coral/30 text-coral`}>
              <TrashIcon className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-medium text-coral">
              {removeMode === "discard-pending" ? "Batal" : "Hapus"}
            </span>
          </button>
        </div>
      </Modal>
    </div>
  );
}
