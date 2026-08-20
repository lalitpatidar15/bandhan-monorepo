import type { HTMLAttributes, ReactNode } from "react";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}

const toneClass: Record<Tone, string> = {
  neutral: "bhn-badge-neutral",
  brand: "bhn-badge-brand",
  success: "bhn-badge-success",
  warning: "bhn-badge-warning",
  danger: "bhn-badge-danger",
  info: "bhn-badge-info",
};

export function Badge({ tone = "neutral", dot = false, children, className = "", ...rest }: BadgeProps) {
  return (
    <span className={["bhn-badge", toneClass[tone], dot ? "bhn-badge-dot" : "", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </span>
  );
}

export const statusTone = (status = ""): Tone => {
  const s = status.toLowerCase();
  if (["active", "approved", "verified", "completed", "paid", "delivered", "success", "published", "hired", "accepted", "confirmed", "in-stock", "open"].some((k) => s.includes(k))) return "success";
  if (["pending", "in-review", "reviewed", "in_review", "in review", "processing", "shipped", "draft", "in_transit", "transit"].some((k) => s.includes(k))) return "warning";
  if (["rejected", "failed", "cancelled", "cancelled", "closed", "blocked", "suspended", "banned", "refunded", "overdue", "out-of-stock"].some((k) => s.includes(k))) return "danger";
  if (["featured", "premium"].some((k) => s.includes(k))) return "brand";
  if (["interview", "shortlisted", "offer"].some((k) => s.includes(k))) return "info";
  return "neutral";
};