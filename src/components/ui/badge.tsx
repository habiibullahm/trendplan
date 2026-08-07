import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const SIZE = {
  sm: "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
  md: "rounded-full border px-2 py-1 text-xs font-semibold",
} as const;

type Props = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  size?: keyof typeof SIZE;
};

export function Badge({
  children,
  size = "md",
  className,
  ...props
}: Props) {
  return (
    <span className={cn(SIZE[size], className)} {...props}>
      {children}
    </span>
  );
}
