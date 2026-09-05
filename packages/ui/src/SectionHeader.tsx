import type { ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";

export interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  actionButtons?: Array<{
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
    icon?: ReactNode;
    iconRight?: ReactNode;
  }>;
  className?: string;
}

export function SectionHeader({ title, subtitle, actions, actionButtons, className = "" }: SectionHeaderProps) {
  const actionElements = actionButtons?.map((btn, i) =>
    btn.href ? (
      <a key={i} href={btn.href} className="bhn-btn bhn-btn-primary">
        {btn.label}
      </a>
    ) : (
      <Button
        key={i}
        variant={btn.variant || "primary"}
        size={btn.size || "sm"}
        onClick={btn.onClick}
        icon={btn.icon}
        iconRight={btn.iconRight}
      >
        {btn.label}
      </Button>
    )
  );

  return (
    <div className={["bhn-section-header", className].filter(Boolean).join(" ")}>
      <div>
        <h2 className="bhn-section-header-title">{title}</h2>
        {subtitle ? <p className="bhn-section-header-sub">{subtitle}</p> : null}
      </div>
      <div className="bhn-section-header-actions">
        {actionElements}
        {actions}
      </div>
    </div>
  );
}