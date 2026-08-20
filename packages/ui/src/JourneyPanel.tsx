import type { ReactNode } from "react";

export interface JourneyPanelProps {
  eyebrow?: string;
  title: string;
  description?: string;
  completed: number;
  total: number;
  nextLabel: string;
  nextHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  help?: ReactNode;
  className?: string;
}

export function JourneyPanel({
  eyebrow = "Your Bandhan journey",
  title,
  description,
  completed,
  total,
  nextLabel,
  nextHref,
  actionLabel = "Continue",
  onAction,
  help,
  className = "",
}: JourneyPanelProps) {
  const safeTotal = Math.max(total, 1);
  const safeCompleted = Math.min(Math.max(completed, 0), safeTotal);
  const percent = Math.round((safeCompleted / safeTotal) * 100);

  const action = nextHref ? (
    <a className="bhn-btn bhn-btn-primary bhn-journey-action" href={nextHref}>{actionLabel}</a>
  ) : onAction ? (
    <button className="bhn-btn bhn-btn-primary bhn-journey-action" type="button" onClick={onAction}>{actionLabel}</button>
  ) : null;

  return (
    <section className={`bhn-journey ${className}`} aria-labelledby="bhn-journey-title">
      <div className="bhn-journey-copy">
        <p className="bhn-eyebrow">{eyebrow}</p>
        <h2 id="bhn-journey-title">{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className="bhn-journey-progress">
        <div className="bhn-journey-progress-label">
          <span>Progress</span><strong>{safeCompleted} of {safeTotal}</strong>
        </div>
        <div className="bhn-progress" role="progressbar" aria-valuemin={0} aria-valuemax={safeTotal} aria-valuenow={safeCompleted} aria-label={`${percent}% complete`}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <p><strong>Next:</strong> {nextLabel}</p>
        {help && <div className="bhn-journey-help">{help}</div>}
      </div>
      {action}
    </section>
  );
}
