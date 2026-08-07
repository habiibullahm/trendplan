"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/components/motion";
import { cn } from "@/lib/cn";

const SIZE = {
  xs: "max-w-xs",
  sm: "max-w-sm",
} as const;

export type ModalSize = keyof typeof SIZE;

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Visual title alignment. Default left. */
  titleAlign?: "left" | "center";
  size?: ModalSize;
  children: ReactNode;
  className?: string;
  /** Extra classes for the padded panel body (around children). */
  bodyClassName?: string;
  /** Restore focus to the opener on close. Disable when chaining to a file picker. */
  restoreFocus?: boolean;
};

const emptySubscribe = () => () => {};

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Shared bottom-sheet (mobile) / centered panel (sm+) modal.
 * Owns backdrop dismiss, Escape, focus trap, scroll lock, portal, and a11y wiring.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  titleAlign = "left",
  size = "sm",
  children,
  className,
  bodyClassName,
  restoreFocus = true,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const reduce = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const restoreFocusRef = useRef(restoreFocus);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
    restoreFocusRef.current = restoreFocus;
  }, [onClose, restoreFocus]);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
        )
      : [];
    const initial = focusables[0] ?? panel;
    initial?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);

      if (nodes.length === 0) {
        e.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      if (restoreFocusRef.current) {
        previousFocusRef.current?.focus?.();
      }
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-ink/40"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.18 }}
        onClick={() => onCloseRef.current()}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full rounded-2xl border border-border bg-surface p-4 shadow-lg outline-none",
          SIZE[size],
          className,
        )}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <p
          id={titleId}
          className={cn(
            "text-sm font-semibold text-ink",
            titleAlign === "center" && "text-center",
          )}
        >
          {title}
        </p>
        {description ? (
          <p
            id={descriptionId}
            className={cn(
              "mt-1 text-sm text-ink-muted",
              titleAlign === "center" && "text-center",
            )}
          >
            {description}
          </p>
        ) : null}
        <div
          className={cn(
            description || title ? "mt-4" : undefined,
            bodyClassName,
          )}
        >
          {children}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
