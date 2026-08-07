import type { TextareaHTMLAttributes } from "react";
import { textareaClassName } from "@/components/ui/field-styles";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: Props) {
  return <textarea className={textareaClassName(className)} {...props} />;
}
