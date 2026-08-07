import type { SelectHTMLAttributes } from "react";
import { fieldClassName } from "@/components/ui/field-styles";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: Props) {
  return (
    <select className={fieldClassName(className)} {...props}>
      {children}
    </select>
  );
}
