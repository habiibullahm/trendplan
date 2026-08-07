import { cn } from "@/lib/cn";

const VARIANT = {
  primary:
    "bg-coral text-white transition-transform active:scale-[0.98] disabled:opacity-60",
  secondary:
    "border border-border bg-surface text-ink transition-colors hover:bg-paper active:scale-[0.98] disabled:opacity-60",
} as const;

const SIZE = {
  md: "min-touch px-5 text-sm font-semibold",
  sm: "min-touch px-4 text-sm font-semibold",
} as const;

const WIDTH = {
  fit: "w-fit",
  full: "w-full",
} as const;

export type ButtonVariant = keyof typeof VARIANT;
export type ButtonSize = keyof typeof SIZE;
export type ButtonWidth = keyof typeof WIDTH;

export function buttonClassName({
  variant = "primary",
  size = "md",
  width = "fit",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-xl",
    VARIANT[variant],
    SIZE[size],
    WIDTH[width],
    className,
  );
}
