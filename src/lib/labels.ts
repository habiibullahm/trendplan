import type { ContentFormat, ContentStatus } from "@/generated/prisma/client";

/** User-facing statuses (MVP). IDE/DRAFT/READY display as Draft. */
export const STATUS_LABEL: Record<ContentStatus, string> = {
  IDE: "Draft",
  DRAFT: "Draft",
  READY: "Draft",
  POSTED: "Posted",
};

export const STATUS_CLASS: Record<ContentStatus, string> = {
  IDE: "border-border bg-paper text-ink-muted",
  DRAFT: "border-border bg-paper text-ink-muted",
  READY: "border-border bg-paper text-ink-muted",
  POSTED: "border-coral/30 bg-coral/10 text-coral",
};

/** Statuses shown in editors (pickers). */
export const EDITABLE_STATUSES: ContentStatus[] = ["IDE", "POSTED"];

/** @deprecated Prefer EDITABLE_STATUSES — kept for any leftover imports. */
export const ALL_STATUSES = EDITABLE_STATUSES;

export const FORMAT_LABEL: Record<ContentFormat, string> = {
  POV: "POV",
  LIST: "List",
  STORYTELLING: "Storytelling",
};

/** Normalize legacy DRAFT/READY to IDE for forms and filters. */
export function normalizeStatus(status: ContentStatus): "IDE" | "POSTED" {
  return status === "POSTED" ? "POSTED" : "IDE";
}

/**
 * Map form Draft|Posted to a DB write.
 * If the user-facing status did not change, keep the existing enum
 * (avoids silently rewriting DRAFT/READY → IDE on caption-only saves).
 */
export function resolveStatusUpdate(
  current: ContentStatus,
  submitted: "IDE" | "POSTED",
): ContentStatus {
  if (normalizeStatus(current) === submitted) return current;
  return submitted;
}
