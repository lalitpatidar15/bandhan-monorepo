import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
}

export function Chip({ selected = false, className = "", children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      className={[
        "bhn-chip",
        selected ? "bhn-chip-active" : "",
        className,
      ].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
