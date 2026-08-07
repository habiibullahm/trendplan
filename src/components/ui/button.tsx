import type { ButtonHTMLAttributes } from "react";
import {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
  type ButtonWidth,
} from "@/components/ui/button-styles";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
};

export function Button({
  variant = "primary",
  size = "md",
  width = "fit",
  className = "",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, width, className })}
      {...props}
    />
  );
}

export {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
  type ButtonWidth,
} from "@/components/ui/button-styles";
