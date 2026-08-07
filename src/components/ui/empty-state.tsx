import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: "div" | "li" | "p";
  /** `card` = dashed panel (riwayat). `plain` = quiet helper text (lists). */
  variant?: "card" | "plain";
};

export function EmptyState({
  children,
  as = "div",
  variant = "card",
  className,
  ...props
}: Props) {
  const classes = cn(
    "text-sm text-ink-muted",
    variant === "card" &&
      "rounded-2xl border border-dashed border-border px-4 py-6",
    className,
  );

  if (as === "li") {
    return (
      <li className={classes} {...props}>
        {children}
      </li>
    );
  }
  if (as === "p") {
    return (
      <p className={classes} {...props}>
        {children}
      </p>
    );
  }
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
