"use client";

import { Star, Heart, Scale } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@bandhan/ui";
import Image from "next/image";
import { RatingDisplay, PriceDisplay, Badge, StatusBadge } from "@bandhan/ui";

interface ArtisanCardProps {
  category?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  price?: string | number;
  rating?: number;
  status?: string;
  img: string;
  name?: string;
  location?: string;
  guests?: string;
  onCompare?: (compared: boolean) => void;
  tag?: string;
  variant?: "default" | "explore";
  onDetailsClick?: () => void;
  href?: string;
  onPrimary?: () => void;
  primaryLabel?: string;
  primaryDisabled?: boolean;
  id?: string;
  isCompared?: boolean;
  className?: string;
}

export function ArtisanCard(props: ArtisanCardProps) {
  const {
    category,
    title,
    subtitle,
    description,
    price,
    rating,
    status,
    img,
    name,
    location,
    guests,
    onCompare,
    tag,
    variant = "default",
    onDetailsClick,
    href,
    onPrimary,
    primaryLabel,
    primaryDisabled = false,
    isCompared,
    className = "",
  } = props;
  const [localCompared, setLocalCompared] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const compared = typeof isCompared === "boolean" ? isCompared : localCompared;
  const router = useRouter();

  const handleCompareToggle = () => {
    setLocalCompared(!compared);
    onCompare?.(!compared);
  };

  /* ================== EXPLORE CARD ================== */
  if (variant === "explore") {
    const cardOnClick = onDetailsClick ?? (href ? () => router.push(href) : undefined);

    return (
      <article
        onClick={cardOnClick}
        className={`bhn-listing-card ${cardOnClick ? "" : "pointer-events-none"} ${className}`}
      >
        {/* IMAGE */}
        <div className="bhn-listing-card-image relative overflow-hidden aspect-square">
          <Image
            src={img}
            alt={name || title || "Marketplace listing"}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {tag && (
            <Badge tone="brand" className="absolute left-2 top-2 text-xs">
              {tag}
            </Badge>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-2 right-2 bhn-btn bhn-btn-icon bhn-btn-ghost bg-white/90 shadow-sm"
            aria-label="Add to wishlist"
          >
            <Heart size={16} className="text-[var(--bhn-brand-600)]" />
          </button>

          {onCompare && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                handleCompareToggle();
              }}
              className={`bhn-btn bhn-btn-icon bhn-btn-ghost bg-white/90 shadow-sm absolute bottom-2 right-2 ${compared ? "text-[var(--bhn-brand-600)]" : ""}`}
              aria-label={compared ? "Remove from compare" : "Add to compare"}
            >
              <Scale size={16} />
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div className="bhn-listing-card-body">
          <h3 className="bhn-listing-card-title">{name || title}</h3>
          {location && (
            <p className="bhn-listing-card-meta">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--bhn-text-soft)]">
                  <path d="M6 0C2.686 0 0 2.686 0 6c0 3.314 6 6 6 6s6-2.686 6-6C12 2.686 9.314 0 6 0z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {location}
              </span>
              {guests && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--bhn-text-soft)]">
                    <path d="M6 12c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  {guests}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="bhn-listing-card-footer">
          <PriceDisplay current={price ?? 0} currency="₹" size="sm" />
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                // Wishlist toggle would be handled by parent
              }}
              className="bhn-btn bhn-btn-icon bhn-btn-ghost"
              aria-label="Add to wishlist"
            >
              <Heart size={16} className="text-[var(--bhn-brand-600)]" />
            </button>
            {onCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompareToggle();
                }}
                className={`bhn-btn bhn-btn-icon bhn-btn-ghost ${compared ? "text-[var(--bhn-brand-600)]" : ""}`}
                aria-label={compared ? "Remove from compare" : "Add to compare"}
              >
                <Scale size={16} />
              </button>
            )}
          </div>
        </div>

        {primaryLabel && onPrimary && (
          <Button
            variant={primaryDisabled ? "secondary" : "primary"}
            size="sm"
            className="w-full mt-4"
            onClick={(event) => {
              event.stopPropagation();
              onPrimary();
            }}
            disabled={primaryDisabled}
          >
            {primaryLabel}
          </Button>
        )}
      </article>
    );
  }

  const cardOnClick = onDetailsClick ?? (href ? () => router.push(href) : undefined);

  return (
    <Card
      onClick={cardOnClick}
      className={`bhn-card-hover ${cardOnClick ? "" : "pointer-events-none"} ${className}`}
      padded
      padding="md"
    >
      <div className="relative h-52 rounded-xl overflow-hidden">
        <Image src={img} alt={title || name || "Marketplace listing"} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" unoptimized className="object-cover" />

        {category && (
          <Badge tone="brand" className="absolute top-3 right-3 text-[10px]">
            {category}
          </Badge>
        )}
      </div>

      <h3 className="mt-2 text-lg font-semibold">{title || name}</h3>

      {subtitle && <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">{subtitle}</p>}

      <p className="mt-2 text-sm text-[var(--bhn-text-muted)] line-clamp-2">
        {description}
      </p>

      <div className="mt-4 flex justify-between items-center">
        <div>
          <PriceDisplay current={price ?? 0} currency="₹" size="sm" />
          {status && <StatusBadge tone="warning" size="sm" className="mt-1">{status}</StatusBadge>}
        </div>

        <div className="flex items-center gap-1 text-sm">
          <RatingDisplay value={rating ?? 0} max={5} showValue={false} size="sm" />
          <span className="text-[var(--bhn-text-muted)]">{rating ?? 0}</span>
        </div>
      </div>
    </Card>
  );
}