import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Shared field chrome for Input / Textarea / native Select.
 * Brand tokens (surface, ink, coral) + shadcn focus ring (`--ring` → coral).
 */
export const fieldVariants = cva(
  "w-full rounded-xl border border-border bg-surface text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus-visible:border-coral focus-visible:ring-3 focus-visible:ring-coral/30 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-coral aria-invalid:ring-3 aria-invalid:ring-coral/20",
  {
    variants: {
      control: {
        input: "mt-1 min-touch px-3",
        textarea: "mt-1 px-3 py-2",
        select: "mt-1 min-touch px-3",
      },
    },
    defaultVariants: {
      control: "input",
    },
  },
);

export type FieldControl = NonNullable<
  VariantProps<typeof fieldVariants>["control"]
>;

export function fieldClassName(
  className?: string,
  control: FieldControl = "input",
) {
  return cn(fieldVariants({ control }), className);
}

export function textareaClassName(className?: string) {
  return fieldClassName(className, "textarea");
}
