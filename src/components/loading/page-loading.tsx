import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageLoadingProps = {
  label?: string;
  className?: string;
  children: ReactNode;
  /** Use `div` when embedding multiple shells (e.g. e2e gallery). Default `main`. */
  as?: "main" | "div";
};

/** Accessible page-shell for route `loading.tsx` skeletons. */
export function PageLoading({
  label = "Memuat…",
  className,
  children,
  as,
}: PageLoadingProps) {
  const Comp: ElementType = as ?? "main";
  return (
    <Comp
      className={cn("flex w-full flex-1 flex-col", className)}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      {children}
    </Comp>
  );
}
