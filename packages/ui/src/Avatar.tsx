import type { HTMLAttributes } from "react";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClass = { sm: "bhn-avatar-sm", md: "bhn-avatar-md", lg: "bhn-avatar-lg", xl: "bhn-avatar-xl" };

export function Avatar({ src, name = "?", size = "md", className = "", ...rest }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span className={["bhn-avatar", sizeClass[size], className].filter(Boolean).join(" ")} {...rest}>
      {src ? <img src={src} alt={name} className="bhn-avatar-img" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} /> : (initials || "?")}
    </span>
  );
}