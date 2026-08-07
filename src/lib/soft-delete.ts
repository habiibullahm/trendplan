/** Soft-delete park slots: -100..-106 (avoids DnD temps -1..-7). */

export const SOFT_DELETE_UNDO_MS = 8_000;

export function parkDayOfWeek(dayOfWeek: number): number {
  return -100 - dayOfWeek;
}

export function unparkDayOfWeek(parkedDay: number): number {
  return -100 - parkedDay;
}

export function isParkedSoftDeleteDay(dayOfWeek: number): boolean {
  return dayOfWeek <= -100 && dayOfWeek >= -106;
}

/** Soft-deleted rows older than the undo toast window. */
export function softDeleteStaleBefore(now = new Date()): Date {
  return new Date(now.getTime() - SOFT_DELETE_UNDO_MS);
}
