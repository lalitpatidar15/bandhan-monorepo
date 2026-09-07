"use client";

import { useState } from "react";
import type { ExploreType } from "@/components/userDashboard/explore/ExploreGrid";
import { FilterPanel, Button } from "@bandhan/ui";
import { Check, SlidersHorizontal, Star } from "lucide-react";

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

      <div className="hidden overflow-hidden rounded-xl border border-[#E2DBD4] bg-white shadow-[0_5px_18px_rgba(42,28,22,.04)] lg:block">
        <div className="flex items-center justify-between border-b border-[#ECE6E0] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={18} className="text-[#8B3A28]" />
            <h2 className="font-display text-lg font-bold tracking-tight text-[#1A1612]">Filters</h2>
          </div>
          {(filters.category || filters.price || filters.rating) && (
            <button type="button" onClick={onClear} className="text-xs font-bold text-[#8B3A28] hover:underline">Reset</button>
          )}
        </div>

        {categories.length > 0 && (
          <div className="border-b border-[#ECE6E0] px-5 py-5">
            <p className="mb-3 text-sm font-bold text-[#2C2520]">Category</p>
            <div className="space-y-1">
            {categories.map((item) => {
              const isActive = filters.category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onChange({ ...filters, category: filters.category === item ? "" : item })}
                  className={`flex min-h-9 w-full items-center justify-between rounded-md px-2 text-left text-sm transition ${isActive ? "bg-[#F8ECE7] font-bold text-[#7A3323]" : "text-[#5F5750] hover:bg-[#FAF7F4] hover:text-[#2C2520]"}`}
                >
                  <span>{item}</span>
                  {isActive ? <Check size={15} /> : null}
                </button>
              );
            })}
            </div>
          </div>
        )}

        <div className="border-b border-[#ECE6E0] px-5 py-5">
          <p className="mb-3 text-sm font-bold text-[#2C2520]">Price</p>

          <div className="space-y-1">
            {priceOptions.map((item) => (
              <label
                key={item.value}
                className="flex min-h-9 w-full cursor-pointer items-center gap-3 rounded-md px-2 text-sm text-[#5F5750] transition hover:bg-[#FAF7F4]"
              >
                <input
                  type="radio"
                  name="price"
                  checked={filters.price === item.value}
                  onChange={() => onChange({ ...filters, price: item.value })}
                  className="h-4 w-4 accent-[#8B3A28]"
                />
                <span className={filters.price === item.value ? "font-bold text-[#7A3323]" : ""}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="px-5 py-5">
          <p className="mb-3 text-sm font-bold text-[#2C2520]">Customer rating</p>

          <div className="space-y-1">
            {ratingOptions.map((item) => (
              <label
                key={item.value}
                className="flex min-h-9 w-full cursor-pointer items-center gap-3 rounded-md px-2 text-sm text-[#5F5750] transition hover:bg-[#FAF7F4]"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === item.value}
                  onChange={() => onChange({ ...filters, rating: item.value })}
                  className="h-4 w-4 accent-[#8B3A28]"
                />
                <Star size={14} className="fill-[#D68B28] text-[#D68B28]" />
                <span className={filters.rating === item.value ? "font-bold text-[#7A3323]" : ""}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
};

export default ExploreSidebar;
