import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label className={cn("block text-left", className)} {...props}>
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
    <span className={cn("text-sm font-medium text-ink", className)}>
      {children}
    </span>
  );
}
