"use client";

import type { ExploreType } from "@/components/userDashboard/explore/ExploreGrid";

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
  const prices = ["₹0 - ₹3,000", "₹3,000 - ₹6,000", "₹6,000+"];

  const updateCategory = (category: string) => {
    onChange({
      ...filters,
      category: filters.category === category ? "" : category,
    });
  };

  return (
    <aside className="bhn-card w-full p-5">
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
                onClick={() => updateCategory(item)}
                className={`bhn-chip w-full justify-start ${isActive ? "bhn-chip-active" : ""}`}
              >
                <span className="text-sm">{item}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-medium text-[var(--bhn-text-muted)] mb-3">Price Range</p>

        <div className="space-y-2">
          {prices.map((item) => (
            <label
              key={item}
              className={`bhn-chip w-full justify-start ${filters.price === item ? "bhn-chip-active" : ""}`}
            >
              <input
                type="radio"
                name="price"
                checked={filters.price === item}
                onChange={() => onChange({ ...filters, price: item })}
                className="hidden"
              />
              <span className="text-[var(--bhn-text)]">{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium text-[var(--bhn-text-muted)] mb-3">Rating</p>

        <div className="space-y-2">
          {['4.5+ Stars', '4.0+ Stars', '3.5+ Stars'].map((item) => (
            <label
              key={item}
              className={`bhn-chip w-full justify-start ${filters.rating === item ? "bhn-chip-active" : ""}`}
            >
              <input
                type="radio"
                name="rating"
                checked={filters.rating === item}
                onChange={() => onChange({ ...filters, rating: item })}
                className="hidden"
              />
              <span className="text-[var(--bhn-text)]">{item}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mt-6 text-sm font-semibold text-[var(--bhn-brand-700)] hover:underline"
      >
        CLEAR ALL
      </button>
    </aside>
  );
};

export default ExploreSidebar;