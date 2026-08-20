import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary: "bhn-btn-primary",
  secondary: "bhn-btn-secondary",
  outline: "bhn-btn-outline",
  ghost: "bhn-btn-ghost",
  danger: "bhn-btn-danger",
  soft: "bhn-btn-soft",
};

const sizeClass: Record<Size, string> = {
  sm: "bhn-btn-sm",
  md: "",
  lg: "bhn-btn-lg",
  icon: "bhn-btn-icon",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, block = false, icon, iconRight, disabled, children, className = "", type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={[
        "bhn-btn",
        variantClass[variant],
        sizeClass[size],
        block ? "bhn-btn-block" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading ? <Spinner className="bhn-btn-spinner" /> : icon}
      {children}
      {iconRight}
    </button>
  );
});