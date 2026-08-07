import type { InputHTMLAttributes } from "react";
import { fieldClassName } from "@/components/ui/field-styles";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return <input className={fieldClassName(className)} {...props} />;
}
