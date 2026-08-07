"use client";

import { ChipButton } from "@/components/ui/chip-button";
import { copyText } from "@/features/planner/lib/clipboard";
import { copyToastError, copyToastSuccess } from "@/features/planner/lib/copy-toast";
import { formatWeekPaste, type WeekPasteItem } from "@/features/planner/lib/export-text";

export function CopyWeekButton({
  weekLabel,
  items,
}: {
  weekLabel: string;
  items: WeekPasteItem[];
}) {
  async function onCopy() {
    if (items.length === 0) {
      copyToastError("Belum ada ide minggu ini.");
      return;
    }
    const text = formatWeekPaste(items, weekLabel);
    const ok = await copyText(text);
    if (ok) copyToastSuccess("Disalin.");
    else copyToastError("Gagal menyalin.");
  }

  return (
    <ChipButton onClick={onCopy}>Salin minggu</ChipButton>
  );
}
