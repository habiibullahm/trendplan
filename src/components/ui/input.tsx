import type { InputHTMLAttributes } from "react";
import { fieldClassName } from "@/components/ui/field-styles";

type Props = InputHTMLAttributes<HTMLInputElement>;

/** TrendPlan input — native element, shadcn-compatible field chrome. */
export function Input({ className, ...props }: Readonly<Props>) {
  return (
    <input
      data-slot="input"
      className={fieldClassName(className, "input")}
      {...props}
    />
  );
}
