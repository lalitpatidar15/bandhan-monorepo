import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={["bhn-empty", className].filter(Boolean).join(" ")}>
      {icon ? <div className="bhn-empty-icon">{icon}</div> : null}
      <h3 className="bhn-empty-title">{title}</h3>
      {description ? <p className="bhn-empty-desc">{description}</p> : null}
      {action ? <div style={{ marginTop: "var(--bhn-space-2)" }}>{action}</div> : null}
    </div>
  );
}