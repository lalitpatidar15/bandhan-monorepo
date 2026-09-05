"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, Pagination, FilterBar, SearchInput, SectionHeader, Button } from "@bandhan/ui";
import { ChevronLeft, ChevronRight, Scale, Heart, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCompare, CompareType } from "@/context/CompareContext";
import { toast } from "react-hot-toast";
import Image from "next/image";

export type ExploreType = "services" | "products" | "venues";

const exploreTypeToCompareType: Record<ExploreType, CompareType> = {
  products: "product",
  services: "service",
  venues: "venue",
};

export interface ExploreItem {
  id: string | number;
  title: string;
  category: string;
  location: string;
  price: string | number;
  rating: number;
  tag?: string;
  image: string;
  guests?: string;
  href: string;
}

interface FilterState {
  category: string;
  price: string;
  rating: string;
}

interface ExploreGridProps {
  viewMode: ExploreType;
  items: ExploreItem[];
  filters: FilterState;
  sortBy: string;
  setSortBy: (value: string) => void;
  categories: string[];
  onViewModeChange: (mode: ExploreType) => void;
  onFiltersChange?: (filters: FilterState) => void;
  onClearFilters?: () => void;
}

const emptyStateText: Record<ExploreType, string> = {
  services: "No services found",
  products: "No products found",
  venues: "No venues found",
};

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

const categoryOptions = (categories: string[]) => [
  { value: "", label: "All Categories" },
  ...categories.map((c) => ({ value: c, label: c })),
];

export function ExploreGrid({
  viewMode,
  items,
  filters,
  sortBy,
  setSortBy,
  onViewModeChange,
  categories,
  onFiltersChange,
  onClearFilters,
}: ExploreGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems } = useCart();
  const { toggle, has } = useCompare();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleCompareToggle = (item: ExploreItem) => {
    const compareType = exploreTypeToCompareType[viewMode];
    const itemId = String(item.id);
    const currentlyInCompare = has(itemId);
    const result = toggle({
      id: itemId,
      type: compareType,
      title: item.title,
      image: item.image,
      priceLabel: String(item.price),
      meta: item.category,
      rating: item.rating,
      seller: item.category,
    });
    if (result.ok) {
      toast.success(currentlyInCompare ? "Removed from compare" : "Added to compare");
    } else {
      toast.error(result.reason || "Could not add to compare");
    }
  };

  const handleWishlistToggle = (item: ExploreItem) => {
    // Wishlist toggle would be implemented with a context or API call
    toast.success("Added to wishlist");
  };

  const sortedData = useMemo(() => {
    const sorted = [...items];

    if (sortBy === "price-low") {
      sorted.sort((a, b) => {
        const aValue = Number(String(a.price).replace(/[^\d.]/g, "")) || 0;
        const bValue = Number(String(b.price).replace(/[^\d.]/g, "")) || 0;
        return aValue - bValue;
      });
    } else if (sortBy === "price-high") {
      sorted.sort((a, b) => {
        const aValue = Number(String(a.price).replace(/[^\d.]/g, "")) || 0;
        const bValue = Number(String(b.price).replace(/[^\d.]/g, "")) || 0;
        return bValue - aValue;
      });
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
    }

    return sorted;
  }, [items, sortBy]);

  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      // Category Filter Handling
      if (
        filters.category &&
        filters.category !== "All" &&
        filters.category !== "" &&
        item.category !== filters.category
      ) {
        return false;
      }

      // Price Filter Handling
      if (filters.price) {
        const priceNumber = Number(String(item.price).replace(/[^\d.]/g, "")) || 0;
        if (filters.price === "₹0 - ₹3,000" && priceNumber > 3000) return false;
        if (
          filters.price === "₹3,000 - ₹6,000" &&
          (priceNumber < 3000 || priceNumber > 6000)
        )
          return false;
        if (filters.price === "₹6,000+" && priceNumber < 6000) return false;
      }

      // Rating Filter Handling
      if (filters.rating) {
        const threshold =
          filters.rating === "4.5+ Stars"
            ? 4.5
            : filters.rating === "4.0+ Stars"
            ? 4.0
            : 3.5;
        if (Number(item.rating) < threshold) return false;
      }

      return true;
    });
  }, [sortedData, filters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, viewMode]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * itemsPerPage;
  const displayedItems = filteredData.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const typeTitle: Record<ExploreType, string> = {
    services: "Explore Services",
    products: "Explore Products",
    venues: "Explore Venues",
  };

  const description: Record<ExploreType, string> = {
    services:
      "Discover trusted service providers and event specialists curated for your celebration.",
    products:
      "Browse useful products and essentials tailored to your event and everyday needs.",
    venues:
      "Browse elegant venues and spaces that suit your celebration, guest count, and budget.",
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <FilterBar
        filters={[
          {
            key: "category",
            label: "Category",
            type: "select",
            options: categoryOptions(categories),
            value: filters.category || "",
            onChange: (value) => onFiltersChange?.({ ...filters, category: value as string }),
          },
          {
            key: "price",
            label: "Price",
            type: "select",
            options: priceOptions,
            value: filters.price || "",
            onChange: (value) => onFiltersChange?.({ ...filters, price: value as string }),
          },
          {
            key: "rating",
            label: "Rating",
            type: "select",
            options: ratingOptions,
            value: filters.rating || "",
            onChange: (value) => onFiltersChange?.({ ...filters, rating: value as string }),
          },
        ]}
        activeCount={(filters.category ? 1 : 0) + (filters.price ? 1 : 0) + (filters.rating ? 1 : 0)}
        onClearAll={onClearFilters}
        showMobileToggle={true}
        mobileOpen={sidebarOpen}
        onMobileToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <SectionHeader
        title={typeTitle[viewMode]}
        subtitle={description[viewMode]}
        actionButtons={[
          {
            label: "Services",
            onClick: () => onViewModeChange("services"),
            variant: viewMode === "services" ? "primary" : "ghost",
            size: "sm",
          },
          {
            label: "Products",
            onClick: () => onViewModeChange("products"),
            variant: viewMode === "products" ? "primary" : "ghost",
            size: "sm",
          },
          {
            label: "Venues",
            onClick: () => onViewModeChange("venues"),
            variant: viewMode === "venues" ? "primary" : "ghost",
            size: "sm",
          },
        ]}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <label className="text-xs text-[var(--bhn-text-muted)] uppercase tracking-[0.22em]">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bhn-select w-auto min-w-[200px]"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating: High to Low</option>
          </select>
        </div>

        {displayedItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedItems.map((item) => {
              const isInCart = viewMode === "products" && cartItems.some(
                (cartItem) => cartItem.itemType === "product" && cartItem.productId === String(item.id),
              );
              const isInCompare = has(String(item.id));

              return (
                <article
                  key={item.id}
                  className="bhn-listing-card group"
                >
                  <div className="bhn-listing-card-image relative overflow-hidden aspect-square">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.tag && (
                      <span className="absolute left-2 top-2 bhn-badge bhn-badge-brand text-xs">
                        {item.tag}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // Wishlist toggle
                      }}
                      className="absolute top-2 right-2 bhn-btn bhn-btn-icon bhn-btn-ghost bg-white/90 shadow-sm"
                      aria-label="Add to wishlist"
                    >
                      <Heart size={16} className="text-[var(--bhn-brand-600)]" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleCompareToggle(item);
                      }}
                      className={`absolute bottom-2 right-2 bhn-btn bhn-btn-icon bhn-btn-ghost bg-white/90 shadow-sm ${isInCompare ? "text-[var(--bhn-brand-600)]" : ""}`}
                      aria-label={isInCompare ? "Remove from compare" : "Add to compare"}
                    >
                      <Scale size={16} />
                    </button>
                  </div>

                  <div className="bhn-listing-card-body">
                    <h3 className="bhn-listing-card-title">{item.title}</h3>
                    {item.location && (
                      <p className="bhn-listing-card-meta">
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--bhn-text-soft)]">
                            <path d="M6 0C2.686 0 0 2.686 0 6c0 3.314 6 6 6 6s6-2.686 6-6C12 2.686 9.314 0 6 0z" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                          {item.location}
                        </span>
                        {item.guests && (
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--bhn-text-soft)]">
                              <path d="M6 12c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6" stroke="currentColor" strokeWidth="1.5"/>
                              <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                            {item.guests}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="bhn-listing-card-footer">
                    <div className="bhn-price">
                      <span className="bhn-price-current text-lg">{item.price}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlistToggle(item);
                        }}
                        className="bhn-btn bhn-btn-icon bhn-btn-ghost"
                        aria-label="Add to wishlist"
                      >
                        <Heart size={16} className="text-[var(--bhn-brand-600)]" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompareToggle(item);
                        }}
                        className={`bhn-btn bhn-btn-icon bhn-btn-ghost ${isInCompare ? "text-[var(--bhn-brand-600)]" : ""}`}
                        aria-label={isInCompare ? "Remove from compare" : "Add to compare"}
                      >
                        <Scale size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredData.length > itemsPerPage && (
            <Pagination
              page={safeCurrentPage}
              pageSize={itemsPerPage}
              total={filteredData.length}
              onPageChange={handlePageChange}
              showPageSizeSelector={false}
            />
          )}
          </>
        ) : (
          <div className="bhn-empty" style={{ padding: "var(--bhn-space-12)" }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="bhn-empty-icon mx-auto mb-4">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" className="text-[var(--bhn-brand-300)]"/>
              <path d="M24 14v10M19 19h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--bhn-brand-500)]"/>
            </svg>
            <h3 className="bhn-empty-title">{emptyStateText[viewMode]}</h3>
            <p className="bhn-empty-desc">Try adjusting your filters or search to see more results.</p>
          </div>
        )}
      </div>
    </div>
  );
}