import type { TextareaHTMLAttributes } from "react";
import { fieldClassName } from "@/components/ui/field-styles";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

/** TrendPlan textarea — native element, shadcn-compatible field chrome. */
export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      data-slot="textarea"
      className={fieldClassName(className, "textarea")}
      {...props}
    />
  );
}
