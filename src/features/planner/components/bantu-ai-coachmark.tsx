"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/components/motion";
import { cn } from "@/lib/cn";
import {
  BANTU_AI_COACH_SEEN_VALUE,
  isBantuAiCoachOpen,
  persistBantuAiCoachSeen,
  readBantuAiCoachStored,
} from "@/features/planner/lib/bantu-ai-coachmark";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

/**
 * First-run callout on the Bantu AI control.
 * Anchored to the left of the button (does not cover Simpan). No focus steal.
 */
export function BantuAiCoachmark({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  const stored = useSyncExternalStore(
    subscribe,
    readBantuAiCoachStored,
    () => BANTU_AI_COACH_SEEN_VALUE,
  );
  const [dismissed, setDismissed] = useState(false);
  const open = isBantuAiCoachOpen({ dismissed, stored, pathname });
  const rootRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  const dismiss = useCallback(() => {
    setDismissed(true);
    persistBantuAiCoachSeen();
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    function onPointerDown(e: PointerEvent) {
      const node = e.target;
      if (!(node instanceof Node)) return;
      if (rootRef.current?.contains(node)) return;
      dismiss();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, dismiss]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onClickCapture={(e) => {
        if (!open) return;
        const t = e.target;
        if (t instanceof Element && t.closest('[role="dialog"]')) return;
        dismiss();
      }}
    >
      {open && !reduceMotion ? (
        <div
          className="pointer-events-none fixed inset-0 z-[45] bg-ink/40"
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          "relative",
          open && "z-50 rounded-lg",
          open &&
            !reduceMotion &&
            "ring-2 ring-coral ring-offset-2 ring-offset-paper",
        )}
      >
        {children}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className={cn(
            "absolute top-0 right-[calc(100%+0.5rem)] z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-paper p-3 text-left shadow-md",
            !reduceMotion && "ring-2 ring-coral/40",
          )}
        >
          <p id={titleId} className="text-sm font-semibold text-ink">
            Bantu AI
          </p>
          <p
            id={descId}
            className="mt-1 text-xs leading-relaxed text-ink-muted"
          >
            Mengisi caption dan hashtag dari ide/tren kamu. Kamu tetap bisa
            edit.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
          >
            Mengerti
          </Button>
        </div>
      ) : null}
    </div>
  );
}
