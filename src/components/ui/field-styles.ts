import { cn } from "@/lib/cn";

export function fieldClassName(className?: string) {
  return cn(
    "mt-1 min-touch w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-coral",
    className,
  );
}

export function textareaClassName(className?: string) {
  return cn(
    "mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-coral",
    className,
  );
}
