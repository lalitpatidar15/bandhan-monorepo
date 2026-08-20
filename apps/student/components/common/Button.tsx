import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  loading = false,
  className = "",
}: ButtonProps) {
  const variants = {
    primary: "bhn-btn-primary",
    secondary: "bhn-btn-secondary",
    outline: "bhn-btn-outline",
    ghost: "bhn-btn-ghost",
  };

  const sizes = {
    sm: "bhn-btn-sm",
    md: "",
    lg: "bhn-btn-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        "bhn-btn",
        variants[variant],
        sizes[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}