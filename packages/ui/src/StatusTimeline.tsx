"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export interface StatusTimelineStep {
  title: ReactNode;
  description?: ReactNode;
  timestamp?: string | Date;
  status: "completed" | "current" | "pending" | "failed";
  icon?: ReactNode;
  meta?: ReactNode;
}

export interface StatusTimelineProps {
  steps: StatusTimelineStep[];
  vertical?: boolean;
  className?: string;
}

export function StatusTimeline({ steps, vertical = true, className = "" }: StatusTimelineProps) {
  const statusIcons: Record<StatusTimelineStep["status"], ReactNode> = {
    completed: <CheckCircle2 size={16} className="text-green-600" />,
    current: <div className="w-3 h-3 rounded-full bg-[var(--bhn-brand-500)] animate-pulse" />,
    pending: <Clock size={16} className="text-[var(--bhn-text-soft)]" />,
    failed: <XCircle size={16} className="text-red-600" />,
  };

  const statusClasses: Record<StatusTimelineStep["status"], string> = {
    completed: "border-l-green-500 bg-green-50",
    current: "border-l-[var(--bhn-brand-500)] bg-[var(--bhn-brand-50)]",
    pending: "border-l-[var(--bhn-border)] bg-transparent",
    failed: "border-l-red-500 bg-red-50",
  };

  if (!vertical) {
    return (
      <div className={["flex items-center gap-4 overflow-x-auto pb-2", className].filter(Boolean).join(" ")}>
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center min-w-[120px] relative">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step.status === "completed" ? "border-green-500 bg-green-500" :
                step.status === "current" ? "border-[var(--bhn-brand-500)] bg-[var(--bhn-brand-500)]" :
                step.status === "failed" ? "border-red-500 bg-red-500" :
                "border-[var(--bhn-border)] bg-[var(--bhn-surface)]"
              } z-10`}
            >
              {step.icon || statusIcons[step.status]}
            </div>
            {i < steps.length - 1 && (
              <div className={`absolute left-1/2 top-10 w-full h-1 -translate-x-1/2 ${i < steps.findIndex(s => s.status !== "completed") ? "bg-green-500" : "bg-[var(--bhn-border)]"}`} />
            )}
            <p className={`mt-2 text-sm text-center ${step.status === "current" ? "font-semibold text-[var(--bhn-brand-700)]" : "text-[var(--bhn-text-muted)]"}`}>
              {step.title}
            </p>
            {step.timestamp && (
              <p className="text-xs text-[var(--bhn-text-soft)] text-center">
                {step.timestamp instanceof Date ? step.timestamp.toLocaleString() : step.timestamp}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={["bhn-timeline", className].filter(Boolean).join(" ")}>
      {steps.map((step, i) => (
        <div
          key={i}
          className={`bhn-timeline-item ${step.status === "completed" ? "bhn-timeline-item-done" : step.status === "current" ? "bhn-timeline-item-active" : ""}`}
        >
          <div
            className={`bhn-timeline-dot flex items-center justify-center ${
              step.status === "completed" ? "border-green-500 bg-green-500 text-white" :
              step.status === "current" ? "border-[var(--bhn-brand-500)] bg-[var(--bhn-brand-500)] text-white animate-pulse" :
              step.status === "failed" ? "border-red-500 bg-red-500 text-white" :
              "border-[var(--bhn-border-strong)] bg-[var(--bhn-surface)] text-[var(--bhn-text-soft)]"
            }`}
          >
            {step.icon || statusIcons[step.status]}
          </div>
          <div className="bhn-timeline-content">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`bhn-timeline-title ${step.status === "current" ? "font-semibold text-[var(--bhn-brand-700)]" : ""}`}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="bhn-timeline-desc">{step.description}</p>
                )}
              </div>
              {step.meta && (
                <div className="flex-shrink-0 text-right">
                  {step.meta}
                </div>
              )}
            </div>
            {step.timestamp && (
              <p className="text-xs text-[var(--bhn-text-soft)] mt-1">
                {step.timestamp instanceof Date ? step.timestamp.toLocaleString() : step.timestamp}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}