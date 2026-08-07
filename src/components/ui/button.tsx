import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
  type ButtonWidth,
} from "@/components/ui/button-styles";
import { Spinner } from "@/components/ui/spinner";

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
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner className="size-3.5 shrink-0" />
          {loadingText ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
  type ButtonWidth,
} from "@/components/ui/button-styles";
