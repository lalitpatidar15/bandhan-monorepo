import type { ReactNode } from "react";

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  delta?: number;
  deltaLabel?: string;
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon, delta, deltaLabel = "vs last period", accent = false, className = "" }: StatCardProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className={["bhn-stat", accent ? "bhn-stat-accent" : "", className].filter(Boolean).join(" ")}>
      <div className="bhn-stat-label">
        <span>{label}</span>
        {icon ? <span className="bhn-stat-icon">{icon}</span> : null}
      </div>
      <div className="bhn-stat-value">{value}</div>
      {delta != null ? (
        <div className={["bhn-stat-delta", up ? "bhn-stat-delta-up" : "bhn-stat-delta-down"].join(" ")}>
          {up ? "▲" : "▼"} {Math.abs(delta)}% <span style={{ color: "var(--bhn-text-soft)", fontWeight: 500 }}>· {deltaLabel}</span>
        </div>
      ) : null}
    </div>
  );
}