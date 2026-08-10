import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/spinner";

export const buttonVariants = cva(
  "inline-flex items-center justify-center disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "rounded-xl bg-coral text-white shadow-sm transition-[transform,filter,box-shadow] hover:brightness-110 hover:shadow-md active:scale-[0.98] disabled:opacity-60",
        secondary:
          "rounded-xl border border-border bg-surface text-ink transition hover:border-coral/40 hover:bg-coral/5 active:scale-[0.98] disabled:opacity-60",
        danger:
          "rounded-none bg-transparent text-ink-muted transition-colors hover:text-coral hover:underline disabled:opacity-60",
      },
      size: {
        md: "min-touch px-5 text-sm font-semibold",
        sm: "min-touch px-4 text-sm font-semibold",
        /** Compact text control (e.g. Hapus) — no 44px touch floor */
        link: "min-h-0 min-w-0 px-0 py-0 text-sm font-semibold",
      },
      width: {
        fit: "w-fit",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      width: "fit",
    },
  },
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
export type ButtonSize = NonNullable<
  VariantProps<typeof buttonVariants>["size"]
>;
export type ButtonWidth = NonNullable<
  VariantProps<typeof buttonVariants>["width"]
>;

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
    buttonVariants({ variant, size: resolvedSize, width }),
    className,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  loading?: boolean;
  loadingText?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  width = "fit",
  className = "",
  type = "button",
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: Props) {
  const isDisabled = Boolean(disabled) || loading;
  return (
    <button
      type={type}
      data-slot="button"
      className={buttonClassName({ variant, size, width, className })}
      {...props}
      disabled={isDisabled}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner className="size-3.5 shrink-0" />
          {loadingText ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
