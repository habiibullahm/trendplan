export type DropDayItem = {
  id: string;
  dayOfWeek: number;
};

/** Resolve drop target day from a droppable day id or another card's drag id. */
export function parseDropDay(
  overId: string | number | undefined,
  items: DropDayItem[],
): number | null {
  if (typeof overId !== "string") return null;

  const dayMatch = /^(list|grid)-day-(\d+)$/.exec(overId);
  if (dayMatch) {
    const day = Number(dayMatch[2]);
    return Number.isInteger(day) && day >= 0 && day <= 6 ? day : null;
  }

  const itemMatch = /^(list|grid)-item-(.+)$/.exec(overId);
  if (itemMatch) {
    const target = items.find((i) => i.id === itemMatch[2]);
    return target ? target.dayOfWeek : null;
  }

  return null;
}

export function dropId(layout: "list" | "grid", day: number) {
  return `${layout}-day-${day}`;
}

export function dragId(layout: "list" | "grid", itemId: string) {
  return `${layout}-item-${itemId}`;
}
