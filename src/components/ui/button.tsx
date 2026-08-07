import type { ButtonHTMLAttributes, ReactNode } from "react";
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
  loading?: boolean;
  loadingText?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  width = "fit",
  className = "",
  type = "button",
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: Props) {
  const isDisabled = Boolean(disabled) || loading;
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, width, className })}
      {...props}
      disabled={isDisabled}
      aria-busy={loading || undefined}
    >
      {loading ? (loadingText ?? children) : children}
    </button>
  );
}

export {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
  type ButtonWidth,
} from "@/components/ui/button-styles";
