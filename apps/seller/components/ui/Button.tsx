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
      "bg-[#6D2D09] text-white hover:bg-[#8B4512] disabled:bg-[#c8a79a]",
    secondary:
      "bg-[#fdf3f1] text-[#4d2016] border border-[#7a3323] hover:bg-[#fce7e3] disabled:bg-[#fdf3f1]",
    outline:
      "border border-[#E7E1D8] text-[#1C1A16] hover:bg-[#F8F4EF] disabled:border-gray-300",
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
