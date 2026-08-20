import React from "react";

type CardProps = {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function Card({
  title,
  children,
  footer,
  className = "",
}: CardProps) {
  return (
    <div className={`bhn-card ${className}`}>
      {title && (
        <h3 className="bhn-card-title p-5 pb-0">{title}</h3>
      )}

      <div>{children}</div>

      {footer && (
        <div className="px-5 pb-5 pt-3 border-t border-[var(--bhn-border)]">
          {footer}
        </div>
      )}
    </div>
  );
}