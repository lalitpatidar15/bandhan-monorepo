"use client";

import { Star, Heart, Scale } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "./Card";
import Image from "next/image";

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
  variant = "default", // 🔥 key part
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
      <Card
        onClick={cardOnClick}
        className={`rounded-lg border border-[#E7E1D8] bg-white shadow-sm transition overflow-hidden group ${cardOnClick ? "cursor-pointer hover:shadow-lg" : ""} ${className}`}
      >
        {/* IMAGE */}
        <div className="relative overflow-hidden h-64 bg-gray-200">
          <Image
            src={img}
            alt={name || title || "Marketplace listing"}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {tag && (
            <span className="absolute left-3 top-3 bg-black/80 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-wide">
              {tag}
            </span>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow"
          >
            <Heart
              size={18}
              className={
                isFavorite ? "fill-[#C2652A] text-[#C2652A]" : "text-[#6B625A]"
              }
            />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold truncate">{name || title}</h3>

            <div className="flex items-center gap-1 text-sm">
              <Star className="text-[#C2652A] fill-[#C2652A]" size={14} />
              {rating}
            </div>
          </div>

          {location && (
            <p className="text-xs text-[#6B625A] mt-1">{location}</p>
          )}
          {guests && <p className="text-xs text-[#6B625A]">{guests}</p>}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-lg font-semibold text-[#C2652A]">{price}</p>
            {onCompare && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  handleCompareToggle();
                }}
                className={`bhn-chip inline-flex items-center gap-1 ${
                  compared ? "bhn-chip-active" : ""
                }`}
                aria-label={compared ? "Remove from compare" : "Add to compare"}
              >
                <Scale
                  size={14}
                  className={compared ? "text-[#C25E2B]" : "text-[#6B625A]"}
                />
                <span className="text-xs">{compared ? "Comparing" : "Compare"}</span>
              </button>
            )}
          </div>

          {primaryLabel && onPrimary && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPrimary();
              }}
              disabled={primaryDisabled}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#B65B2D] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#98461F] disabled:cursor-default disabled:bg-[#287D3C]"
            >
              {primaryLabel}
            </button>
          )}
        </div>
      </Card>
    );
  }

  const cardOnClick = onDetailsClick ?? (href ? () => router.push(href) : undefined);

  return (
    <Card
      onClick={cardOnClick}
      className={`rounded-2xl border border-[#E7E1D8] bg-white shadow-sm transition ${cardOnClick ? "cursor-pointer hover:shadow-md" : "hover:shadow-md"} ${className}`}
    >
      <div className="relative h-52 rounded-2xl overflow-hidden">
        <Image src={img} alt={title || name || "Marketplace listing"} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" unoptimized className="object-cover" />

        {category && <div className="absolute top-3 right-3 bg-[#C2652A] text-white text-[10px] px-3 py-1 rounded-2xl uppercase tracking-wide">
          {category}
        </div>}
      </div>

      <h3 className="mt-2 px-3 text-lg font-semibold">{title || name}</h3>

      {subtitle && <p className="px-3 text-sm text-[#6B625A]">{subtitle}</p>}

      <p className="mt-2 px-3 text-sm text-[#7A6E66] line-clamp-2">
        {description}
      </p>

      <div className="mt-4 px-3 pb-3 flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold">{price}</p>
          {status && <p className="text-xs text-[#C2652A]">{status}</p>}
        </div>

        <div className="flex items-center gap-1 text-sm">
          <Star size={14} className="text-[#C2652A]" />
          {rating}
        </div>
      </div>
    </Card>
  );
}
