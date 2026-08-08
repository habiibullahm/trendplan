import type { ReactNode } from "react";
import { Label, LabelText } from "@/components/ui/label";
import { cn } from "@/lib/cn";

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p data-slot="field-error" className="mt-1 text-sm text-coral">
      {messages[0]}
    </p>
  );
}

type FormFieldProps = {
  label: ReactNode;
  htmlFor?: string;
  error?: string[];
  children: ReactNode;
  className?: string;
  /** Sibling control next to the label (must not nest inside <label>). */
  action?: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  error,
  children,
  className,
  action,
}: FormFieldProps) {
  if (action) {
    return (
      <div className={cn(className)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor={htmlFor} className="mb-0">
            <LabelText>{label}</LabelText>
          </Label>
          {action}
        </div>
        {children}
        <FieldError messages={error} />
      </div>
    );
  }

  return (
    <Label htmlFor={htmlFor} className={className}>
      <LabelText>{label}</LabelText>
      {children}
      <FieldError messages={error} />
    </Label>
  );
}
