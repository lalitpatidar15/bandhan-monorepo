import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

export type AlertTone = "brand" | "success" | "warning" | "danger" | "info";

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const icons: Record<AlertTone, ReactNode> = {
  brand: <Info size={16} />,
  success: <CheckCircle2 size={16} />,
  warning: <TriangleAlert size={16} />,
  danger: <AlertCircle size={16} />,
  info: <Info size={16} />,
};

export function Alert({ tone = "info", title, children, icon, className = "" }: AlertProps) {
  return (
    <div className={["bhn-alert", `bhn-alert-${tone}`, className].filter(Boolean).join(" ")}>
      <span className="bhn-alert-icon">{icon ?? icons[tone]}</span>
      <div>
        {title ? <p className="bhn-alert-title">{title}</p> : null}
        {children ? <div className="bhn-alert-body">{children}</div> : null}
      </div>
    </div>
  );
}