"use client";

import React from "react";
import Image from "next/image";
import { ChevronRight, Heart } from "lucide-react";

export default function ProductPreview({
  images,
  productTitle,
  price,
  category,
  productType,
  rating = 0,
  reviewCount = 0,
}: {
  images: string[];
  productTitle: string;
  price: number;
  category?: string;
  productType?: "sale" | "rent" | "both";
  rating?: number;
  reviewCount?: number;
}) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const safeReviewCount = Math.max(0, Number(reviewCount) || 0);
  const heroImage = images[0] || "/product.png";
  const stars = Array.from({ length: 5 }, (_, index) => (index < Math.round(safeRating) ? "★" : "☆"));

  return (
    <>
      <div className="bg-[var(--bhn-surface-2)] border border-[var(--bhn-border)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] tracking-[2px] font-semibold text-[var(--bhn-text)]">LIVE PREVIEW</h3>
          <ChevronRight size={16} className="text-[var(--bhn-text-soft)]" />
        </div>

        <div className="bg-[var(--bhn-surface)] rounded-2xl p-4 shadow-sm">
          <div className="relative h-60 sm:h-65 rounded-2xl bg-[var(--bhn-surface-2)] overflow-hidden flex items-center justify-center">
            <Image
              src={heroImage}
              alt={productTitle || "Product preview"}
              fill
              className="object-cover"
            />

            <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--bhn-surface)] shadow flex items-center justify-center hover:scale-110 transition">
              <Heart size={16} />
            </button>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center text-[11px]">
              <span className="tracking-[2px] text-[var(--bhn-text)] font-semibold">{category || "CERAMIC"}</span>
              <span className="font-medium text-[var(--bhn-text)]">{`₹${price.toFixed(2)}`}</span>
            </div>

            <h4 className="mt-3 text-[16px] font-medium text-[var(--bhn-text)] wrap-break-word">{productTitle || "Product Title Preview"}</h4>

            <div className="text-[var(--bhn-text-soft)] text-sm mt-2">
              <span className="tracking-[1px]">{stars.join("")}</span>
              <span className="ml-2 text-[var(--bhn-text-muted)]">
                {safeReviewCount > 0 ? `${safeRating.toFixed(1)} · ${safeReviewCount} reviews` : "No reviews yet"}
              </span>
            </div>

            <button className="w-full h-11.5 bg-[var(--bhn-brand-600)] hover:bg-[var(--bhn-brand-600)] rounded-xl text-[var(--bhn-text-on-brand)] text-[12px] tracking-[1px] font-semibold mt-5 transition active:scale-95">ADD TO CART</button>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bhn-surface-2)] rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--bhn-surface-2)] flex items-center justify-center">
            <Image src="/image09.png" alt="tip" width={16} height={16} />
          </div>

          <h4 className="text-[var(--bhn-text)] font-semibold text-[17px]">Pro Tip</h4>
        </div>

        <p className="text-[14px] text-[var(--bhn-text)] leading-6 mt-2">Listings with detailed stories and 3+ high-quality images perform significantly better and receive higher engagement.</p>
      </div>
    </>
  );
}
