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
