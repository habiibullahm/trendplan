"use client";

import Image from "next/image";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import {
  removeProfileImageAction,
  uploadProfileImageAction,
  type ProfileImageActionState,
} from "@/app/actions/profile";
import { Modal } from "@/components/ui/modal";
import { useActionToasts } from "@/hooks/use-action-toasts";

const emptyState: ProfileImageActionState = {};
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

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

const iconBtnClass =
  "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface shadow-sm outline-none ring-coral/40 transition enabled:active:scale-95 focus-visible:ring-2 disabled:opacity-60";

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
    }
  }, [uploadState.success]);

  // Clear optimistic preview on failed upload.
  useEffect(() => {
    if (!uploadState.error || !localPreview) return;
    const url = localPreview;
    queueMicrotask(() => {
      URL.revokeObjectURL(url);
      setLocalPreview((prev) => (prev === url ? null : prev));
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
    if (!ALLOWED.has(file.type)) {
      toast.error("Format harus JPEG, PNG, atau WebP.");
      input.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Ukuran maksimal 2 MB.");
      input.value = "";
      return;
    }
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setMenuOpen(false);
    uploadFormRef.current?.requestSubmit();
  }

  function onRemoveSubmit(e: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Hapus foto profil?")) {
      e.preventDefault();
      return;
    }
    setMenuOpen(false);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

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
        aria-expanded={shownUrl ? menuOpen : undefined}
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
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <span className="flex h-full w-full items-center justify-center text-base font-bold text-ink">
            {initialLetter}
          </span>
        )}
        {pending ? (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/40 text-[10px] font-semibold text-paper">
            …
          </span>
        ) : null}
      </button>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        <p className="truncate text-sm text-ink-muted">{email}</p>
      </div>

      <Modal
        open={Boolean(menuOpen && shownUrl)}
        onClose={() => setMenuOpen(false)}
        title="Foto profil"
        titleAlign="center"
        size="xs"
        bodyClassName="flex justify-center"
        restoreFocus={!openingPicker}
      >
        <div className="relative h-20 w-20">
          <div className="h-full w-full overflow-hidden rounded-full border-2 border-border bg-paper">
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
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <form
            action={removeAction}
            className="absolute -bottom-0.5 -left-0.5"
            onSubmit={onRemoveSubmit}
          >
            <button
              type="submit"
              disabled={pending}
              aria-label="Hapus foto"
              className={`${iconBtnClass} text-coral`}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </form>
          <button
            type="button"
            onClick={openPicker}
            disabled={pending}
            aria-label="Ubah foto"
            className={`absolute -bottom-0.5 -right-0.5 ${iconBtnClass} text-ink`}
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </Modal>
    </div>
  );
}
