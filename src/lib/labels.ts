import type { ContentFormat, ContentStatus } from "@/generated/prisma/client";

export const STATUS_LABEL: Record<ContentStatus, string> = {
  IDE: "Ide",
  DRAFT: "Draft",
  READY: "Siap Post",
  POSTED: "Posted",
};

export const STATUS_CLASS: Record<ContentStatus, string> = {
  IDE: "border-border bg-paper text-ink-muted",
  DRAFT:
    "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-200",
  READY: "border-sage/30 bg-sage/10 text-sage",
  POSTED: "border-coral/30 bg-coral/10 text-coral",
};

export const FORMAT_LABEL: Record<ContentFormat, string> = {
  POV: "POV",
  LIST: "List",
  STORYTELLING: "Storytelling",
};

export const ALL_STATUSES: ContentStatus[] = [
  "IDE",
  "DRAFT",
  "READY",
  "POSTED",
];
