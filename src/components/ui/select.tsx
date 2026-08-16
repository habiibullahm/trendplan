import type { SelectHTMLAttributes } from "react";
import { fieldClassName } from "@/components/ui/field-styles";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

/**
 * Native select with shared field chrome.
 * Not the shadcn popup Select — keeps planner day pickers unchanged.
 */
export function Select({ className, children, ...props }: Readonly<Props>) {
  return (
    <select
      data-slot="select"
      className={fieldClassName(className, "select")}
      {...props}
    >
      {children}
    </select>
  );
}
