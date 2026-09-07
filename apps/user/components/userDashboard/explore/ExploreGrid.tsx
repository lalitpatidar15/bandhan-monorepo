"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "@bandhan/ui";
import { Check, Heart, MapPin, Scale, Star } from "lucide-react";
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

export function ExploreGrid({
  viewMode,
  items,
  filters,
  sortBy,
  setSortBy,
  onViewModeChange,
}: ExploreGridProps) {
  const router = useRouter();
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

  const handleWishlistToggle = () => {
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

  return (
    <div className="w-full min-w-0">
      <div className="mb-5 flex flex-col gap-2 border-b border-[var(--bhn-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--bhn-brand-600)]">
            Bandhan marketplace · {filteredData.length} {filteredData.length === 1 ? "result" : "results"}
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--bhn-text)] sm:text-3xl">{typeTitle[viewMode]}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--bhn-text-muted)] sm:text-base">{description[viewMode]}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-3 shadow-[var(--bhn-shadow-xs)] md:flex-row md:items-center md:justify-between">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--bhn-surface-3)] p-1" aria-label="Marketplace type">
            {(["services", "products", "venues"] as ExploreType[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setCurrentPage(1);
                  onViewModeChange(mode);
                }}
                className={`min-h-10 rounded-lg px-3 text-sm font-bold capitalize transition-colors ${viewMode === mode ? "bg-[var(--bhn-brand-600)] text-white shadow-sm" : "text-[var(--bhn-text-muted)] hover:bg-white hover:text-[var(--bhn-brand-700)]"}`}
                aria-pressed={viewMode === mode}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="explore-sort" className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-[var(--bhn-text-soft)]">Sort by</label>
            <select
              id="explore-sort"
              value={sortBy}
              onChange={(e) => {
                setCurrentPage(1);
                setSortBy(e.target.value);
              }}
              className="bhn-select min-w-0 flex-1 md:w-auto md:min-w-[210px]"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
            </select>
          </div>
        </div>

        {displayedItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {displayedItems.map((item) => {
              const isInCart = viewMode === "products" && cartItems.some(
                (cartItem) => cartItem.itemType === "product" && cartItem.productId === String(item.id),
              );
              const isInCompare = has(String(item.id));

              return (
                <article
                  key={item.id}
                  className="bhn-listing-card group cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--bhn-brand-300)]"
                  role="link"
                  tabIndex={0}
                  aria-label={`View ${item.title}`}
                  onClick={() => router.push(item.href)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") router.push(item.href);
                  }}
                >
                  <div className="bhn-listing-card-image relative overflow-hidden !aspect-[4/3]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className={`${viewMode === "products" ? "object-contain p-4" : "object-cover"} transition-transform duration-300 group-hover:scale-[1.03]`}
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
                        handleWishlistToggle();
                      }}
                      className="absolute top-2 right-2 bhn-btn bhn-btn-icon bhn-btn-ghost bg-white/90 shadow-sm"
                      aria-label="Add to wishlist"
                    >
                      <Heart size={16} className="text-[var(--bhn-brand-600)]" />
                    </button>
                  </div>

                  <div className="bhn-listing-card-body">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--bhn-brand-600)]">{item.category}</span>
                      {item.rating > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2 py-1 text-xs font-bold text-white" aria-label={`${item.rating} out of 5 stars`}>
                          {item.rating.toFixed(1)} <Star size={11} fill="currentColor" />
                        </span>
                      ) : null}
                    </div>
                    <h3 className="bhn-listing-card-title">{item.title}</h3>
                    {item.location && (
                      <p className="bhn-listing-card-meta">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
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
                    {isInCart ? (
                      <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        <Check size={13} /> Added to cart
                      </span>
                    ) : null}
                  </div>

                  <div className="bhn-listing-card-footer">
                    <div className="bhn-price">
                      <span className="bhn-price-current text-lg">{item.price}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompareToggle(item);
                        }}
                        className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-colors hover:bg-[var(--bhn-brand-50)] ${isInCompare ? "bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]" : "text-[var(--bhn-text-muted)]"}`}
                        aria-label={isInCompare ? "Remove from compare" : "Add to compare"}
                      >
                        <Scale size={15} /> {isInCompare ? "Comparing" : "Compare"}
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
