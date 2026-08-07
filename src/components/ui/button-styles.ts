import { cn } from "@/lib/cn";

const VARIANT = {
  primary:
    "rounded-xl bg-coral text-white transition-transform active:scale-[0.98] disabled:opacity-60",
  secondary:
    "rounded-xl border border-border bg-surface text-ink transition-colors hover:bg-paper active:scale-[0.98] disabled:opacity-60",
  danger:
    "rounded-none bg-transparent text-ink-muted transition-colors hover:text-coral hover:underline disabled:opacity-60",
} as const;

const SIZE = {
  md: "min-touch px-5 text-sm font-semibold",
  sm: "min-touch px-4 text-sm font-semibold",
  /** Compact text control (e.g. Hapus) — no 44px touch floor */
  link: "min-h-0 min-w-0 px-0 py-0 text-sm font-semibold",
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
  const resolvedSize = variant === "danger" && size === "md" ? "link" : size;

  return cn(
    "inline-flex items-center justify-center",
    VARIANT[variant],
    SIZE[resolvedSize],
    WIDTH[width],
    className,
  );
}
