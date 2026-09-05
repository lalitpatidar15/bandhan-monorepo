import type { ReactNode } from "react";

export type StatusBadgeTone = "success" | "warning" | "danger" | "info" | "brand" | "neutral";

export interface StatusBadgeProps {
  children: ReactNode;
  tone?: StatusBadgeTone;
  dot?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const toneClasses: Record<StatusBadgeTone, string> = {
  success: "bhn-status-badge-success",
  warning: "bhn-status-badge-warning",
  danger: "bhn-status-badge-danger",
  info: "bhn-status-badge-info",
  brand: "bhn-status-badge-brand",
  neutral: "bhn-status-badge-neutral",
};

export function StatusBadge({
  children,
  tone = "neutral",
  dot = false,
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const sizeStyles = {
    sm: { padding: "0.125rem 0.375rem", fontSize: "0.625rem" },
    md: { padding: "0.25rem 0.625rem", fontSize: "var(--bhn-text-xs)" },
    lg: { padding: "0.375rem 0.875rem", fontSize: "var(--bhn-text-sm)" },
  };

  return (
    <span
      className={["bhn-status-badge", toneClasses[tone], className].filter(Boolean).join(" ")}
      style={sizeStyles[size]}
    >
      {dot && <span className="bhn-status-badge-dot" />}
      {children}
    </span>
  );
}

export const statusTone = (status = ""): StatusBadgeTone => {
  const s = status.toLowerCase();
  if (["active", "approved", "verified", "completed", "paid", "delivered", "success", "published", "hired", "accepted", "confirmed", "in-stock", "open", "in stock"].some((k) => s.includes(k))) return "success";
  if (["pending", "in-review", "reviewed", "in_review", "in review", "processing", "shipped", "draft", "in_transit", "transit", "awaiting"].some((k) => s.includes(k))) return "warning";
  if (["rejected", "failed", "cancelled", "closed", "blocked", "suspended", "banned", "refunded", "overdue", "out-of-stock", "out of stock"].some((k) => s.includes(k))) return "danger";
  if (["featured", "premium", "verified"].some((k) => s.includes(k))) return "brand";
  if (["interview", "shortlisted", "offer", "assigned"].some((k) => s.includes(k))) return "info";
  return "neutral";
};