import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const VARIANT = {
  chip: "min-touch rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition hover:border-coral/40 hover:bg-coral/5 active:scale-[0.98] disabled:opacity-60",
  ghost:
    "min-touch rounded-lg px-2 text-xs font-semibold text-coral transition-colors hover:text-coral/80 hover:underline disabled:opacity-60",
} as const;

const WIDTH = {
  fit: "w-fit",
  full: "w-full",
} as const;

export type ChipVariant = keyof typeof VARIANT;
export type ChipWidth = keyof typeof WIDTH;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ChipVariant;
  width?: ChipWidth;
};

export function ChipButton({
  variant = "chip",
  width = "fit",
  className = "",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center",
        WIDTH[width],
        VARIANT[variant],
        className,
      )}
      {...props}
    />
  );
}
