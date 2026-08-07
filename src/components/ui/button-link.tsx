import Link from "next/link";
import type { ComponentProps } from "react";
import {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
  type ButtonWidth,
} from "@/components/ui/button-styles";

type Props = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  className?: string;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  width = "fit",
  className = "",
  ...props
}: Props) {
  return (
    <Link
      className={buttonClassName({ variant, size, width, className })}
      {...props}
    />
  );
}
