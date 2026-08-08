/**
 * Pure Modal/Dialog behavior used by the Modal wrapper and smoke tests.
 * Keeps dismiss / focus / sheet-layout contracts out of JSX.
 */

export type ModalOpenChangePlan =
  | { action: "noop" }
  | { action: "close" }
  | { action: "cancel" };

/**
 * Plan a controlled Dialog open-change.
 * When dismiss is not allowed (e.g. form pending), callers must `details.cancel()`
 * so Base UI does not run close side-effects (focus return, floating dismiss).
 */
export function planModalOpenChange(
  nextOpen: boolean,
  allowClose: boolean,
): ModalOpenChangePlan {
  if (nextOpen) return { action: "noop" };
  if (!allowClose) return { action: "cancel" };
  return { action: "close" };
}

/** Map TrendPlan `restoreFocus` to Base UI Dialog `finalFocus`. */
export function modalFinalFocus(restoreFocus: boolean): boolean {
  return restoreFocus;
}

/**
 * Avatar file-picker open strategy.
 * - Modal already open ("Ubah"): click input in place; keep restoreFocus default.
 * - Modal closed (empty avatar): close/defer path — disable restoreFocus so the
 *   OS picker is not dismissed by focus returning to the avatar button.
 */
export function planAvatarPickerOpen(menuOpen: boolean): {
  clickWhileOpen: boolean;
  restoreFocus: boolean;
} {
  if (menuOpen) {
    return { clickWhileOpen: true, restoreFocus: true };
  }
  return { clickWhileOpen: false, restoreFocus: false };
}

/** Mobile bottom-sheet + sm+ centered panel (overrides DialogContent defaults). */
export const MODAL_POSITION_CLASSNAME =
  "top-auto bottom-4 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 translate-y-0 gap-0 data-open:slide-in-from-bottom-4 data-closed:slide-out-to-bottom-4 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:data-open:slide-in-from-bottom-0 sm:data-closed:slide-out-to-bottom-0";

export const MODAL_SIZE_CLASSNAME = {
  xs: "max-w-xs",
  sm: "max-w-sm",
} as const;

export type ModalSizeClass = keyof typeof MODAL_SIZE_CLASSNAME;

export function modalContentClassName(size: ModalSizeClass): string {
  return [MODAL_POSITION_CLASSNAME, MODAL_SIZE_CLASSNAME[size]].join(" ");
}
