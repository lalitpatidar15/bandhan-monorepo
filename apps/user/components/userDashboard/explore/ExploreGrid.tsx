"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArtisanCard } from "@/components/ui/articiancard";
import { useCart } from "@/context/CartContext";
import { useCompare, CompareType } from "@/context/CompareContext";
import { useRequireAuth } from "@/lib/auth";
import { EmptyState, Tabs } from "@bandhan/ui";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import toast from "react-hot-toast";

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
  const { addToCart } = useCart();
  const { gate } = useRequireAuth();
  const itemsPerPage = 6;
  const { toggle, has } = useCompare();
  const paginationKey = `${viewMode}:${filters.category}:${filters.price}:${filters.rating}:${sortBy}`;
  const [pagination, setPagination] = useState({ key: paginationKey, page: 1 });
  const currentPage = pagination.key === paginationKey ? pagination.page : 1;

  const handleAddToCart = (item: ExploreItem) => {
    gate(() => {
      const price = Number(String(item.price).replace(/[^\d.]/g, "")) || 0;
      addToCart({
        title: item.title,
        price,
        img: item.image,
        date: new Date().toISOString().slice(0, 10),
        guests: 1,
        location: item.location,
        itemType: "product",
        productId: String(item.id),
      });
    });
  };

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
      setPagination({ key: paginationKey, page });
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
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-5 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bhn-pageheader-title">
              {typeTitle[viewMode]}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--bhn-text-muted)] leading-relaxed">
              {description[viewMode]}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-4">
            <Tabs
              items={[
                { id: "services", label: "Services" },
                { id: "products", label: "Products" },
                { id: "venues", label: "Venues" },
              ]}
              active={viewMode}
              onChange={(id) => onViewModeChange(id as ExploreType)}
            />

            <div className="flex flex-col gap-2 text-right">
              <label className="text-xs text-[var(--bhn-text-muted)] uppercase tracking-[0.22em]">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bhn-select rounded-full"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {displayedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {displayedItems.map((item) => (
             <ArtisanCard
               key={item.id}
               variant="explore"
               img={item.image}
               name={item.title}
               location={item.location}
               guests={item.guests}
               price={item.price}
               rating={item.rating}
               tag={item.tag}
               id={String(item.id)}
               isCompared={has(String(item.id))}
               onCompare={() => handleCompareToggle(item)}
               className="bhn-card-hover"
               onDetailsClick={() => router.push(item.href)}
               primaryLabel={viewMode === "products" ? "Add" : undefined}
               onPrimary={
                 viewMode === "products" ? () => handleAddToCart(item) : undefined
               }
             />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<SearchX size={24} />}
          title={emptyStateText[viewMode]}
          description="Try adjusting your filters or search to see more results."
          className="bhn-card"
        />
      )}

      {filteredData.length > itemsPerPage && (
        <div className="flex items-center justify-center gap-2 my-12">
          <button
            type="button"
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="bhn-btn bhn-btn-icon bhn-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              className={`bhn-chip ${safeCurrentPage === page ? "bhn-chip-active" : ""}`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className="bhn-btn bhn-btn-icon bhn-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
