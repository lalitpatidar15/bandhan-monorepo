import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={["bhn-pageheader", className].filter(Boolean).join(" ")}>
      <div>
        <h1 className="bhn-pageheader-title">{title}</h1>
        {subtitle ? <p className="bhn-pageheader-sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="bhn-pageheader-actions">{actions}</div> : null}
    </div>
  );
}