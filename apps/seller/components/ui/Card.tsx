import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div className={`rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] shadow-sm ${className}`}>
      {children}
    </div>
  );
}
