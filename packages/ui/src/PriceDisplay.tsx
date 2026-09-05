import type { ReactNode } from "react";

export interface PriceDisplayProps {
  current: number | string;
  original?: number | string;
  discountPercent?: number;
  currency?: string;
  unit?: string;
  rental?: {
    price: number | string;
    period: string;
    deposit?: number | string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({
  current,
  original,
  discountPercent,
  currency = "₹",
  unit,
  rental,
  size = "md",
  className = "",
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const formatPrice = (price: number | string) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return num.toLocaleString("en-IN");
  };

  const currentStr = typeof current === "number" ? formatPrice(current) : current;
  const originalStr = original ? (typeof original === "number" ? formatPrice(original) : original) : null;

  return (
    <div className={["bhn-price", className].filter(Boolean).join(" ")}>
      <span className={["bhn-price-current", sizeClasses[size]].filter(Boolean).join(" ")}>{currency}{currentStr}</span>
      {unit && <span className="bhn-price-unit">/{unit}</span>}

      {originalStr && (
        <span className="bhn-price-original">{currency}{originalStr}</span>
      )}

      {discountPercent && (
        <span className="bhn-price-discount">{discountPercent}% OFF</span>
      )}

      {rental && (
        <span className="bhn-price-rental">
          <span className="bhn-price-current text-sm">{currency}{typeof rental.price === "number" ? formatPrice(rental.price) : rental.price}</span>
          <span className="bhn-price-rental-period">/{rental.period}</span>
        </span>
      )}
    </div>
  );
}