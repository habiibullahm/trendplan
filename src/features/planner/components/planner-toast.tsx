"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  purgeDeletedContentItemAction,
  restoreContentItemAction,
} from "@/features/planner/actions";
import { SOFT_DELETE_UNDO_MS } from "@/features/planner/lib/soft-delete";

const MESSAGES: Record<string, string> = {
  created: "Ide ditambahkan ke planner.",
  saved: "Perubahan disimpan.",
};

const DELETE_TOAST_ID = "planner-delete";

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

/** Fires a one-shot Sonner toast from ?toast= then strips it from the URL. */
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

    if (key === "deleted") {
      const undoId = searchParams.get("undo");
      const eventKey = `deleted:${undoId ?? "none"}`;
      if (shownKey.current === eventKey) return;
      shownKey.current = eventKey;
      router.replace(pathname);

      if (!undoId) {
        toast.success("Dihapus dari planner.", { id: DELETE_TOAST_ID });
        return;
      }

      // Sync flag — action click dismisses toast and would otherwise purge mid-restore.
      let skipPurge = false;

      async function purgeIfNeeded() {
        if (skipPurge) return;
        await purgeDeletedContentItemAction(undoId!);
      }

      toast("Dihapus dari planner.", {
        id: DELETE_TOAST_ID,
        duration: SOFT_DELETE_UNDO_MS,
        className: "tp-toast-delete",
        description: <DeleteCountdownBar durationMs={SOFT_DELETE_UNDO_MS} />,
        action: {
          label: "Urungkan",
          onClick: () => {
            skipPurge = true;
            void (async () => {
              const result = await restoreContentItemAction(undoId!);
              if (result.error) {
                toast.error(result.error, { id: DELETE_TOAST_ID });
                await purgeDeletedContentItemAction(undoId!);
                return;
              }
              toast.success(result.success ?? "Ide dikembalikan.", {
                id: DELETE_TOAST_ID,
              });
              router.refresh();
            })();
          },
        },
        onAutoClose: () => {
          void purgeIfNeeded();
        },
        onDismiss: () => {
          void purgeIfNeeded();
        },
      });
      return;
    }

    const message = MESSAGES[key];
    if (!message) return;
    if (shownKey.current === key) return;
    shownKey.current = key;
    toast.success(message);
    router.replace(pathname);
  }, [searchParams, pathname, router]);

  return null;
}
