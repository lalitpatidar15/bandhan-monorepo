"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ExploreSidebar from "@/components/userDashboard/explore/ExploreSidebar";
import { ExploreGrid, type ExploreItem, type ExploreType } from "@/components/userDashboard/explore/ExploreGrid";
import { useGetProductsQuery, useGetProductCategoriesQuery } from "@/store/api/productApi";
import { useGetServicesQuery } from "@/store/api/serviceApi";
import { useGetVenuesQuery } from "@/store/api/venueApi";

interface FilterState {
  category: string;
  price: string;
  rating: string;
}

const emptyFilterState = (): FilterState => ({ category: "", price: "", rating: "" });

type ProductLike = {
  _id?: string | number;
  id?: string | number;
  title?: string;
  category?: string;
  location?: string;
  price?: number | string;
  rating?: number | string;
  isFeatured?: boolean;
  images?: string[];
  image?: string;
  stockStatus?: string | number;
};

const getStringRecordValue = (value: object, key: string): string | undefined => {
  const item = (value as Record<string, unknown>)[key];
  return typeof item === "string" ? item : typeof item === "number" ? String(item) : undefined;
};

type ServiceLike = {
  _id?: string | number;
  id?: string | number;
  title?: string;
  category?: string;
  location?: string;
  price?: number | string;
  rating?: number | string;
  isFeatured?: boolean;
  images?: string[];
  image?: string;
  maxGuests?: number | string;
  guests?: number | string;
};

type VenueLike = {
  _id?: string | number;
  id?: string | number;
  name?: string;
  category?: string;
  type?: string;
  location?: string;
  pricePerDay?: number | string;
  rating?: number | string;
  isFeatured?: boolean;
  images?: string[];
  image?: string;
  guests?: number | string;
};

const normalizeProductItems = (items: ProductLike[] = []): ExploreItem[] =>
  items
    .map((item) => ({ ...item, resolvedId: item._id || item.id }))
    .filter((item): item is ProductLike & { resolvedId: string | number } => Boolean(item.resolvedId))
    .map((item) => ({
    id: item.resolvedId,
    title: item.title || "Untitled product",
    category: item.category || "Product",
    location: item.location || "",
    price: typeof item.price === "number" ? `₹${item.price.toLocaleString()}` : item.price ? `₹${Number(item.price).toLocaleString()}` : "Price on request",
    rating: Number(item.rating || 0),
    tag: item.isFeatured ? "Featured" : undefined,
    image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image || "/invitation.png",
    guests: item.stockStatus ? String(item.stockStatus) : undefined,
    href: `/products/${item.resolvedId}`,
  }));

const normalizeServiceItems = (items: ServiceLike[] = []): ExploreItem[] =>
  items
    .map((item) => ({ ...item, resolvedId: item._id || item.id }))
    .filter((item): item is ServiceLike & { resolvedId: string | number } => Boolean(item.resolvedId))
    .map((item) => ({
    id: item.resolvedId,
    title: item.title || "Untitled service",
    category: item.category || "Service",
    location: item.location || "",
    price: typeof item.price === "number" ? `₹${item.price.toLocaleString()}` : item.price ? `₹${Number(item.price).toLocaleString()}` : "Price on request",
    rating: Number(item.rating || 0),
    tag: item.isFeatured ? "Featured" : undefined,
    image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image || "/invitation.png",
    guests: item.maxGuests ? `Up to ${item.maxGuests} guests` : item.guests ? `Up to ${item.guests} guests` : undefined,
    href: `/products/Services/${item.resolvedId}`,
  }));

const normalizeVenueItems = (items: VenueLike[] = []): ExploreItem[] =>
  items.map((item, index) => ({
    id: item._id ?? item.id ?? `venue-${index}`,
    title: item.name || "Untitled venue",
    category: item.category || "Venue",
    location: item.location || "",
    price: typeof item.pricePerDay === "number" ? `₹${item.pricePerDay.toLocaleString()} / day` : item.pricePerDay ? `₹${Number(item.pricePerDay).toLocaleString()} / day` : "Price on request",
    rating: Number(item.rating || 0),
    tag: item.isFeatured ? "Featured" : undefined,
    image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image || "/invitation.png",
    guests: item.guests ? `Up to ${item.guests} guests` : undefined,
    href: `/products/Venue/${item._id ?? item.id ?? `venue-${index}`}`,
  }));

const normalizeType = (value: string | null): ExploreType => {
  if (value === "products" || value === "venues") return value;
  return "services";
};

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") || "";
  const viewMode = normalizeType(searchParams.get("type"));
  const [filters, setFilters] = useState<FilterState>(emptyFilterState());
  const [sortBy, setSortBy] = useState("recommended");

  const { data: productCategoriesResponse } = useGetProductCategoriesQuery();

  const serviceQuery = useGetServicesQuery({
    page: 1,
    limit: 50,
    category: viewMode === "services" && filters.category ? filters.category : undefined,
    q: viewMode === "services" ? initialSearch : undefined,
  }, { skip: viewMode !== "services" });

  const productQuery = useGetProductsQuery({
    page: 1,
    limit: 50,
    category: viewMode === "products" && filters.category ? filters.category : undefined,
    q: viewMode === "products" ? initialSearch : undefined,
  }, { skip: viewMode !== "products" });

  const venueQuery = useGetVenuesQuery({
    page: 1,
    limit: 50,
    q: viewMode === "venues" ? initialSearch : undefined,
    category: viewMode === "venues" && filters.category ? filters.category : undefined,
    sort: sortBy === "price-low" ? "price-low" : sortBy === "price-high" ? "price-high" : sortBy === "rating" ? "rating" : undefined,
  }, { skip: viewMode !== "venues" });

  const categories = useMemo(() => {
    if (viewMode === "products") {
      return ["All", ...(productCategoriesResponse?.data || [])];
    }

    if (viewMode === "services") {
      const serviceCategories =
        (serviceQuery.data?.data || [])
          .map((item) => getStringRecordValue(item, "category"))
          .filter((category): category is string => Boolean(category));
      return ["All", ...Array.from(new Set(serviceCategories))];
    }

    const venueCategories =
      (venueQuery.data?.data || [])
        .map((item) => getStringRecordValue(item, "category") || getStringRecordValue(item, "type"))
        .filter((category): category is string => Boolean(category));
    return ["All", ...Array.from(new Set(venueCategories))];
  }, [viewMode, productCategoriesResponse, serviceQuery.data, venueQuery.data]);

  const items = useMemo<ExploreItem[]>(() => {
    if (viewMode === "products") return normalizeProductItems(productQuery.data?.data || []);
    if (viewMode === "venues") return normalizeVenueItems(venueQuery.data?.data || []);
    return normalizeServiceItems(serviceQuery.data?.data || []);
  }, [viewMode, productQuery.data, serviceQuery.data, venueQuery.data]);

  const handleViewModeChange = (mode: ExploreType) => {
    setFilters(emptyFilterState());
    setSortBy("recommended");

    const params = new URLSearchParams(searchParams.toString());
    params.set("type", mode);
    if (!initialSearch) params.delete("q");
    else params.set("q", initialSearch);
    router.replace(`/explore?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters(emptyFilterState());
    setSortBy("recommended");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <ExploreSidebar
          viewMode={viewMode}
          filters={filters}
          categories={categories.filter((category) => category !== "All")}
          onChange={setFilters}
          onClear={handleClearFilters}
        />
      </aside>

      <ExploreGrid
        viewMode={viewMode}
        items={items}
        filters={filters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onViewModeChange={handleViewModeChange}
        categories={categories.filter((category) => category !== "All")}
      />
    </div>
  );
}

export default function ExplorePage() {
  return <Suspense fallback={<div className="min-h-screen" />}><ExplorePageContent /></Suspense>;
}
