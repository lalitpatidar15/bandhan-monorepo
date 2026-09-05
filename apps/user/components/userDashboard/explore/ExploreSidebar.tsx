"use client";

import { useState } from "react";
import type { ExploreType } from "@/components/userDashboard/explore/ExploreGrid";
import { FilterPanel, Button } from "@bandhan/ui";

interface FilterState {
  category: string;
  price: string;
  rating: string;
}

interface ExploreSidebarProps {
  viewMode: ExploreType;
  filters: FilterState;
  categories: string[];
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

const ExploreSidebar = ({ viewMode, filters, categories, onChange, onClear }: ExploreSidebarProps) => {
  const title = viewMode === "services" ? "Service Filters" : viewMode === "products" ? "Product Filters" : "Venue Filters";
  const [panelOpen, setPanelOpen] = useState(false);

  const priceOptions = [
    { value: "₹0 - ₹3,000", label: "₹0 - ₹3,000" },
    { value: "₹3,000 - ₹6,000", label: "₹3,000 - ₹6,000" },
    { value: "₹6,000+", label: "₹6,000+" },
  ];

  const ratingOptions = [
    { value: "4.5+ Stars", label: "4.5+ Stars" },
    { value: "4.0+ Stars", label: "4.0+ Stars" },
    { value: "3.5+ Stars", label: "3.5+ Stars" },
  ];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <aside className="lg:w-72 shrink-0">
      <Button
        variant="secondary"
        size="sm"
        className="w-full lg:hidden mb-4"
        onClick={() => setPanelOpen(true)}
      >
        Filters {(filters.category ? 1 : 0) + (filters.price ? 1 : 0) + (filters.rating ? 1 : 0) > 0 && (
          <span className="bhn-badge bhn-badge-brand ml-2">
            {(filters.category ? 1 : 0) + (filters.price ? 1 : 0) + (filters.rating ? 1 : 0)}
          </span>
        )}
      </Button>

      <FilterPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={title}
        filters={[
          {
            key: "category",
            label: "Category",
            type: "select",
            options: categoryOptions,
            value: filters.category,
            onChange: (value) => onChange({ ...filters, category: value as string }),
          },
          {
            key: "price",
            label: "Price Range",
            type: "select",
            options: priceOptions,
            value: filters.price,
            onChange: (value) => onChange({ ...filters, price: value as string }),
          },
          {
            key: "rating",
            label: "Rating",
            type: "select",
            options: ratingOptions,
            value: filters.rating,
            onChange: (value) => onChange({ ...filters, rating: value as string }),
          },
        ]}
        onFilterChange={(key, value) => onChange({ ...filters, [key]: value as string })}
        onClearAll={onClear}
        onApply={() => setPanelOpen(false)}
      />

      <div className="hidden lg:block bhn-card p-5">
        <div className="space-y-1 mb-6">
          <h2 className="text-lg font-semibold text-[var(--bhn-text)]">{title}</h2>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--bhn-text-soft)]">Filter by category</p>
        </div>

        {categories.length > 0 && (
          <div className="space-y-3">
            {categories.map((item) => {
              const isActive = filters.category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onChange({ ...filters, category: filters.category === item ? "" : item })}
                  className={`bhn-chip w-full justify-start ${isActive ? "bhn-chip-active" : ""}`}
                >
                  <span className="text-sm">{item}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs font-medium text-[var(--bhn-text-muted)] mb-3">Price Range</p>

          <div className="space-y-2">
            {priceOptions.map((item) => (
              <label
                key={item.value}
                className={`bhn-chip w-full justify-start ${filters.price === item.value ? "bhn-chip-active" : ""}`}
              >
                <input
                  type="radio"
                  name="price"
                  checked={filters.price === item.value}
                  onChange={() => onChange({ ...filters, price: item.value })}
                  className="hidden"
                />
                <span className="text-[var(--bhn-text)]">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium text-[var(--bhn-text-muted)] mb-3">Rating</p>

          <div className="space-y-2">
            {ratingOptions.map((item) => (
              <label
                key={item.value}
                className={`bhn-chip w-full justify-start ${filters.rating === item.value ? "bhn-chip-active" : ""}`}
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === item.value}
                  onChange={() => onChange({ ...filters, rating: item.value })}
                  className="hidden"
                />
                <span className="text-[var(--bhn-text)]">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-6 w-full"
          onClick={onClear}
        >
          Clear All
        </Button>
      </div>
    </aside>
  );
};

export default ExploreSidebar;