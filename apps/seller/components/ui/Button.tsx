"use client";
import Link from "next/link";
import React from "react";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "custom";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  onClick?: () => void;
}

export const Button = ({
  children,
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  type = "button",
  icon,
  iconPosition = "left",
  className = "",
  onClick,
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-3xl font-medium transition-all duration-200";

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  const variants = {
    primary:
      "bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] hover:bg-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)]",
    secondary:
      "bg-[var(--bhn-surface-2)] text-[var(--bhn-text)] border border-[var(--bhn-brand-600)] hover:bg-[var(--bhn-surface-2)] disabled:bg-[var(--bhn-surface-2)]",
    outline:
      "border border-[var(--bhn-border)] text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)] disabled:border-[var(--bhn-border-strong)]",
    custom: "",
  };

  const classes = cn(
    base,
    sizes[size],
    variants[variant],
    fullWidth && "w-full",
    disabled && "cursor-not-allowed opacity-70",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {loading ? (
          <span className="animate-pulse">Loading...</span>
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            {children}
            {icon && iconPosition === "right" && icon}
          </>
        )}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? (
        <span className="animate-pulse">Loading...</span>
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  );
};
