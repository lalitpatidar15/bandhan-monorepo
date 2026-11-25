"use client";

import React from "react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export default function ProductIdentity({
  productTitle,
  setProductTitle,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  price,
  setPrice,
  productType,
  setProductType,
  catalogCategories,
  readOnly,
  showPricingFields = true,
}: {
  productTitle: string;
  setProductTitle: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  subcategory: string;
  setSubcategory: (v: string) => void;
  price: number;
  setPrice: (v: number) => void;
  productType: "sale" | "rent" | "both";
  setProductType: (v: "sale" | "rent" | "both") => void;
  catalogCategories: Category[];
  readOnly?: boolean;
  showPricingFields?: boolean;
}) {
  return (
    <div className="bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-2xl p-4 sm:p-7">

      <div className="flex items-center gap-3 mb-7">

        <div className="w-6 h-6 rounded-md border border-[var(--bhn-brand-600)] flex items-center justify-center bg-[var(--bhn-surface-2)] overflow-hidden">

          <Image
            src="/image05.png"
            alt="icon"
            width={14}
            height={14}
          />
        </div>

        <h2 className="font-serif text-[22px] sm:text-[25px] text-[var(--bhn-text)] font-semibold">
          Product Identity
        </h2>
      </div>

      <div>
        <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">
          PRODUCT TITLE
        </label>

        <input
          type="text"
          value={productTitle}
          onChange={(e) => setProductTitle(e.target.value)}
          placeholder="e.g. Hand-Woven Terracotta Vase"
          disabled={readOnly}
          className="w-full h-[52px] border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
        />

        <p className="text-[11px] text-[var(--bhn-text-soft)] mt-2">
          Keep title descriptive and under 80 characters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <div>
          <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">
            CATEGORY
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={readOnly}
            className="w-full h-[52px] border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none bg-[var(--bhn-surface)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
          >
            <option>Select Category</option>
            {catalogCategories.map((item) => (
              <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">
            SUBCATEGORY
          </label>

          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            disabled={readOnly}
            className="w-full h-[52px] border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none bg-[var(--bhn-surface)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
          >
            <option>Select Subcategory</option>
            {(catalogCategories.find((item) => item.name === category)?.subcategories || []).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      {showPricingFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <div>
            <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">PRICE</label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              disabled={readOnly}
              className="w-full h-[52px] border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">AVAILABILITY</label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value as "sale" | "rent" | "both")}
              disabled={readOnly}
              className="w-full h-[52px] border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none bg-[var(--bhn-surface)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
            >
              <option value="sale">Buy Only</option>
              <option value="rent">Rent Only</option>
              <option value="both">Buy + Rent</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
