"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  modalContentClassName,
  modalFinalFocus,
  planModalOpenChange,
  type ModalSizeClass,
} from "@/components/ui/modal-behavior";
import { cn } from "@/lib/cn";

export type ModalSize = ModalSizeClass;

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
  /**
   * Restore focus to the opener on close.
   * Disable when chaining to a file picker (`finalFocus={false}` on Dialog).
   */
  restoreFocus?: boolean;
  /**
   * When false, Escape / backdrop dismiss is canceled at the Dialog layer
   * (use while a form submit is pending). Default true.
   */
  allowClose?: boolean;
};

/**
 * Shared bottom-sheet (mobile) / centered panel (sm+) modal.
 * Composes shadcn Dialog for portal, focus trap, Escape, and scroll lock.
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
  allowClose = true,
}: ModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        const plan = planModalOpenChange(next, allowClose);
        if (plan.action === "cancel") {
          details.cancel();
          return;
        }
        if (plan.action === "close") onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        finalFocus={modalFinalFocus(restoreFocus)}
        className={cn(
          modalContentClassName(size),
          "flex min-w-0 flex-col",
          className,
        )}
      >
        <DialogHeader
          className={cn(
            "min-w-0 shrink-0",
            titleAlign === "center" && "items-center text-center",
          )}
        >
          <DialogTitle
            className={cn(
              "min-w-0 break-words leading-snug [overflow-wrap:anywhere]",
              titleAlign === "center" && "text-center",
            )}
          >
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription
              className={cn(
                "mt-1 block break-words leading-snug",
                titleAlign === "center" && "text-center",
              )}
            >
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div
          className={cn(
            "min-h-0 min-w-0 overflow-y-auto",
            description || title ? "mt-3" : undefined,
            bodyClassName,
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
