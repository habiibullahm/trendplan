"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const toggleVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-coral/30 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        /** Selectable chip — coral when pressed */
        outline:
          "border border-border bg-surface text-ink hover:bg-paper data-[pressed]:border-coral data-[pressed]:bg-coral data-[pressed]:text-white aria-pressed:border-coral aria-pressed:bg-coral aria-pressed:text-white",
      },
      size: {
        /** Tren filters, compact actions */
        sm: "min-touch shrink-0 rounded-xl px-3 text-xs",
        /** Goal 1–7 grid */
        default: "min-touch rounded-xl text-sm",
        /** Niche full-width rows */
        lg: "min-touch w-full justify-start rounded-xl px-3 py-2.5 text-left text-sm",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant = "outline",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
