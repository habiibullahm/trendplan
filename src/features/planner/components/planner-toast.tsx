"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  purgeDeletedContentItemAction,
  restoreContentItemAction,
} from "@/features/planner/actions/content";
import { SOFT_DELETE_UNDO_MS } from "@/features/planner/lib/soft-delete";

const MESSAGES: Record<string, string> = {
  created: "Ide ditambahkan ke planner",
  saved: "Perubahan disimpan",
  "activity-created": "Aktivitas ditambahkan",
  "activities-created": "Beberapa aktivitas ditambahkan",
  "activity-saved": "Aktivitas disimpan",
  "activity-deleted": "Aktivitas dihapus",
  joined_share: "Kamu bergabung ke plan bersama.",
  left_share: "Kamu keluar dari plan",
};

const ERROR_MESSAGES: Record<string, string> = {
  posted_locked: "Konten Posted hanya bisa dibaca.",
};

const DELETE_TOAST_ID = "planner-delete";
/** Same id as useActionToasts success — spam replaces, doesn't stack duplicates. */
const FEEDBACK_TOAST_ID = "action-success";

function DeleteCountdownBar({ durationMs }: { durationMs: number }) {
  return (
    <div
      className="tp-toast-delete-progress"
      style={{ ["--tp-delete-ms" as string]: `${durationMs}ms` }}
      role="progressbar"
      aria-label="Waktu urungkan"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span />
    </div>
  );
}

function DeleteUndoToast({
  undoId,
  durationMs,
  skipPurgeRef,
  onRestored,
}: {
  undoId: string;
  durationMs: number;
  skipPurgeRef: { current: boolean };
  onRestored: () => void;
}) {
  const [pending, setPending] = useState(false);

  async function undo() {
    if (pending) return;
    skipPurgeRef.current = true;
    setPending(true);
    const result = await restoreContentItemAction(undoId);
    if (result.error) {
      skipPurgeRef.current = false;
      setPending(false);
      toast.error(result.error, { id: DELETE_TOAST_ID });
      await purgeDeletedContentItemAction(undoId);
      return;
    }
    toast.success(result.success ?? "Ide dikembalikan", {
      id: DELETE_TOAST_ID,
    });
    onRestored();
  }

  return (
    <div className="tp-toast-delete-card" role="status">
      <p className="tp-toast-delete-card__title">Dihapus dari planner</p>
      <button
        type="button"
        className="tp-toast-delete-card__action"
        disabled={pending}
        onClick={() => void undo()}
      >
        Urungkan
      </button>
      <DeleteCountdownBar durationMs={durationMs} />
    </div>
  );
}

/** Fires a one-shot Sonner toast from ?toast= then strips toast params only. */
export function PlannerToastFromQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  /** Last handled toast key (e.g. `deleted:cms…` or `saved`) so repeats still fire. */
  const shownKey = useRef<string | null>(null);

  useEffect(() => {
    const key = searchParams.get("toast");
    if (!key) {
      // URL cleaned — allow the same toast type on the next navigation.
      shownKey.current = null;
      return;
    }

    function stripToastFromUrl() {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("toast");
      next.delete("undo");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }

    if (key === "deleted") {
      const undoId = searchParams.get("undo");
      const eventKey = `deleted:${undoId ?? "none"}`;
      if (shownKey.current === eventKey) return;
      shownKey.current = eventKey;
      stripToastFromUrl();

      if (!undoId) {
        toast.success("Dihapus dari planner", { id: DELETE_TOAST_ID });
        return;
      }

      const skipPurgeRef = { current: false };

      async function purgeIfNeeded() {
        if (skipPurgeRef.current) return;
        await purgeDeletedContentItemAction(undoId!);
      }

      toast.custom(
        () => (
          <DeleteUndoToast
            undoId={undoId}
            durationMs={SOFT_DELETE_UNDO_MS}
            skipPurgeRef={skipPurgeRef}
            onRestored={() => router.refresh()}
          />
        ),
        {
          id: DELETE_TOAST_ID,
          duration: SOFT_DELETE_UNDO_MS,
          className: "tp-toast-delete-host",
          onAutoClose: () => {
            void purgeIfNeeded();
          },
          onDismiss: () => {
            void purgeIfNeeded();
          },
        },
      );
      return;
    }

    const errorMessage = ERROR_MESSAGES[key];
    if (errorMessage) {
      if (shownKey.current === key) return;
      shownKey.current = key;
      toast.error(errorMessage, { id: FEEDBACK_TOAST_ID });
      stripToastFromUrl();
      return;
    }

    const message = MESSAGES[key];
    if (!message) return;
    if (shownKey.current === key) return;
    shownKey.current = key;
    toast.success(message, { id: FEEDBACK_TOAST_ID });
    stripToastFromUrl();
  }, [searchParams, pathname, router]);

  return null;
}
