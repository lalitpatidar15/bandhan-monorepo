import type { ReactNode } from "react";
import { Star } from "lucide-react";

export interface RatingDisplayProps {
  value: number;
  max?: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  showCount?: boolean;
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function RatingDisplay({
  value,
  max = 5,
  count,
  size = "md",
  showValue = true,
  showCount = true,
  interactive = false,
  onChange,
  className = "",
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const renderStars = (val: number, clickable = false) => (
    <div className="bhn-rating-stars" role={clickable ? "radiogroup" : "img"} aria-label={`${val} out of ${max} stars`}>
      {stars.map((star) => (
        <Star
          key={star}
          size={size === "sm" ? 14 : size === "md" ? 18 : 22}
          className={`transition-colors ${clickable ? "cursor-pointer" : ""}`}
          fill={star <= val ? "currentColor" : "none"}
          strokeWidth={star <= val ? 0 : 1.5}
          onClick={clickable ? () => onChange?.(star) : undefined}
          onMouseEnter={clickable ? () => onChange?.(star) : undefined}
        />
      ))}
    </div>
  );

  if (count !== undefined && (showValue || showCount)) {
    return (
      <div className={["bhn-rating-summary", className].filter(Boolean).join(" ")}>
        <div className="bhn-rating-summary-main">
          {showValue && (
            <div>
              <div className="bhn-rating-summary-score">{value.toFixed(1)}</div>
              {renderStars(Math.round(value))}
            </div>
          )}
          <div className="bhn-rating-summary-bars">
            {stars.map((star) => (
              <div key={star} className="bhn-rating-bar">
                <span className="bhn-rating-bar-label">{star}★</span>
                <div className="bhn-rating-bar-track">
                  <div
                    className="bhn-rating-bar-fill"
                    style={{ width: `${Math.max(0, (count / max) * (1 - (star - 1) / max) * 100)}%` }}
                  />
                </div>
                <span className="bhn-rating-bar-count">
                  {Math.round((count / max) * (1 - (star - 1) / max) * count)}
                </span>
              </div>
            ))}
          </div>
        </div>
        {showCount && <p className="text-sm text-[var(--bhn-text-muted)]">{count} reviews</p>}
      </div>
    );
  }

  return (
    <div className={["bhn-rating", className].filter(Boolean).join(" ")}>
      {renderStars(value, interactive)}
      {showValue && <span className="bhn-rating-value">{value.toFixed(1)}</span>}
      {showCount && count !== undefined && <span className="bhn-rating-count">({count})</span>}
    </div>
  );
}