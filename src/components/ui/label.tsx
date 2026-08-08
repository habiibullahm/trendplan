import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

/** Form label wrapper (block) — keeps FormField nesting working. */
export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "block text-left text-sm leading-none font-medium select-none",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export function LabelText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      data-slot="label-text"
      className={cn("text-sm font-medium text-ink", className)}
    >
      {children}
    </span>
  );
}
