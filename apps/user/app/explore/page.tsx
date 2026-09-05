"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyState, Spinner } from "@bandhan/ui";
import { SearchX } from "lucide-react";
import Footer from "@/components/ui/Footer";
import SiteHeader from "@/components/ui/SiteHeader";
import CompareBar from "@/components/layout/CompareBar";
import ExploreSidebar from "@/components/userDashboard/explore/ExploreSidebar";
import { ExploreGrid, type ExploreItem, type ExploreType } from "@/components/userDashboard/explore/ExploreGrid";
import MarketplaceDetailLayout from "@/components/ui/MarketplaceDetailLayout";
import ProductDetailLayout from "@/components/ui/ProductDetailLayout";
import { adaptProductDetail, useGetProductByIdQuery, useGetProductsQuery, useGetProductCategoriesQuery } from "@/store/api/productApi";
import { useGetServiceByIdQuery, useGetServicesQuery } from "@/store/api/serviceApi";
import { useGetVenueByIdQuery, useGetVenuesQuery } from "@/store/api/venueApi";

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

const getStringRecordValue = (value: Record<string, unknown>, key: string): string | undefined => {
  const item = value[key];
  return typeof item === "string" ? item : typeof item === "number" ? String(item) : undefined;
};

const resolveItemId = (item: { _id?: string | number; id?: string | number }): string | number =>
  item._id ?? item.id ?? "";

const normalizeProductItems = (items: ProductLike[] = []): ExploreItem[] =>
  items.map((item) => {
    const resolvedId = resolveItemId(item);
    return {
      id: resolvedId,
      title: item.title || "Untitled product",
      category: item.category || "Product",
      location: item.location || "",
      price: typeof item.price === "number" ? `₹${item.price.toLocaleString()}` : item.price ? `₹${Number(item.price).toLocaleString()}` : "Price on request",
      rating: Number(item.rating || 0),
      tag: item.isFeatured ? "Featured" : undefined,
      image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image || "/invitation.png",
      guests: item.stockStatus ? String(item.stockStatus) : undefined,
      href: `/listings/product/${String(resolvedId)}`,
    };
  });

const normalizeServiceItems = (items: ServiceLike[] = []): ExploreItem[] =>
  items.map((item) => {
    const resolvedId = resolveItemId(item);
    return {
      id: resolvedId,
      title: item.title || "Untitled service",
      category: item.category || "Service",
      location: item.location || "",
      price: typeof item.price === "number" ? `₹${item.price.toLocaleString()}` : item.price ? `₹${Number(item.price).toLocaleString()}` : "Price on request",
      rating: Number(item.rating || 0),
      tag: item.isFeatured ? "Featured" : undefined,
      image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image || "/invitation.png",
      guests: item.maxGuests ? `Up to ${item.maxGuests} guests` : item.guests ? `Up to ${item.guests} guests` : undefined,
      href: `/listings/service/${String(resolvedId)}`,
    };
  });

const normalizeVenueItems = (items: VenueLike[] = []): ExploreItem[] =>
  items.map((item) => {
    const resolvedId = resolveItemId(item);
    return {
      id: resolvedId,
      title: item.name || "Untitled venue",
      category: item.category || "Venue",
      location: item.location || "",
      price: typeof item.pricePerDay === "number" ? `₹${item.pricePerDay.toLocaleString()} / day` : item.pricePerDay ? `₹${Number(item.pricePerDay).toLocaleString()} / day` : "Price on request",
      rating: Number(item.rating || 0),
      tag: item.isFeatured ? "Featured" : undefined,
      image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image || "/invitation.png",
      guests: item.guests ? `Up to ${item.guests} guests` : undefined,
      href: `/listings/venue/${String(resolvedId)}`,
    };
  });

const normalizeListingType = (value: string) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "services") return "service";
  if (normalized === "venues") return "venue";
  if (normalized === "products") return "product";
  return normalized;
};

const parseExploreType = (rawType: string | null): { mode: ExploreType; id?: string } => {
  const value = rawType || "services";
  const [mode, id] = value.split("/");

  if (mode === "products" || mode === "venues") {
    return { mode, id };
  }

  return { mode: "services", id: mode === "services" ? id : undefined };
};

function ExploreDetailView({ mode, id }: { mode: ExploreType; id: string }) {
  const router = useRouter();

  const productQuery = useGetProductByIdQuery(id, { skip: mode !== "products" });
  const serviceQuery = useGetServiceByIdQuery(id, { skip: mode !== "services" });
  const venueQuery = useGetVenueByIdQuery(id, { skip: mode !== "venues" });

  const product = productQuery.data?.data ?? null;
  const service = serviceQuery.data?.data ?? null;
  const venue = venueQuery.data?.data ?? null;

  const detailTitle = mode === "products" ? product?.title : mode === "services" ? service?.title : venue?.name;
  const detailDescription = mode === "products" ? product?.description : mode === "services" ? service?.description : venue?.description;
  const detailImages = mode === "products"
    ? (product?.images?.length ? product.images : product?.image ? [product.image] : [])
    : mode === "services"
    ? (service?.images?.length ? service.images : service?.image ? [service.image] : [])
    : (venue?.images?.length ? venue.images : venue?.gallery?.length ? venue.gallery : venue?.img ? [venue.img] : venue?.image ? [venue.image] : []);
  const detailLocation = mode === "products" ? product?.location : mode === "services" ? service?.location : venue?.location;
  const detailRating = Number(mode === "products" ? product?.rating ?? 0 : mode === "services" ? service?.rating ?? 0 : venue?.rating ?? 0);
  const detailPrice = mode === "products" ? Number(product?.price ?? 0) : mode === "services" ? Number(service?.price ?? 0) : Number(venue?.pricePerDay ?? 0);
  const detailGuests = mode === "products" ? 0 : mode === "services" ? Number(service?.maxGuests ?? 0) : Number(venue?.guests ? Number(venue.guests) : 0);

  const isLoading = mode === "products" ? productQuery.isLoading : mode === "services" ? serviceQuery.isLoading : venueQuery.isLoading;
  const isNotFound = mode === "products" ? !product : mode === "services" ? !service : !venue;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--bhn-bg)]">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Spinner center />
          <p className="text-center text-sm text-[var(--bhn-text-muted)]">Loading {mode.slice(0, -1)} details...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (isNotFound) {
    return (
      <main className="min-h-screen bg-[var(--bhn-bg)]">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-20">
          <EmptyState
            icon={<SearchX size={24} />}
            title={`${mode.slice(0, -1).replace(/^./, (char) => char.toUpperCase())} not found.`}
            action={
              <a href={`/explore?type=${mode}`} className="bhn-btn bhn-btn-primary">
                Back to {mode}
              </a>
            }
          />
        </div>
        <Footer />
      </main>
    );
  }

  if (mode === "products" && product) {
    return (
      <main className="min-h-screen bg-[var(--bhn-bg)]">
        <SiteHeader />
        <ProductDetailLayout {...adaptProductDetail(product, id)} />
        <Footer />
      </main>
    );
  }

  const details = [
    { label: "Category", value: mode === "services" ? service?.category || "Service" : "Venue" },
    { label: "Location", value: detailLocation || "Location on request" },
    { label: "Guests", value: detailGuests ? `Up to ${detailGuests} guests` : "Contact for guest count" },
  ];

  return (
    <main className="min-h-screen bg-[var(--bhn-bg)]">
      <SiteHeader />
       <MarketplaceDetailLayout
         id={String(id)}
         kind={mode === "services" ? "Service" : "Venue"}
        title={detailTitle || "Untitled item"}
        description={detailDescription || "No description available."}
        images={detailImages}
        rating={detailRating}
        location={detailLocation}
        guests={detailGuests}
        price={detailPrice}
        priceLabel={mode === "venues" ? "Per day" : "Starting price"}
        primaryLabel={mode === "venues" ? "Book venue" : "Book now"}
        secondaryLabel="Request quote"
        onPrimary={() => {
  const currentMode = String(mode);
  const listingType = normalizeListingType(currentMode);
  const targetId = id || product?._id || product?.id;
  if (targetId) {
    router.push(`/userdashboard/booking?listingType=${listingType}&listingId=${targetId}`);
  }
}}
onSecondary={() => {
  const currentMode = String(mode);
  const listingType = normalizeListingType(currentMode);
  const targetId = id || product?._id || product?.id;
  if (targetId) {
    router.push(`/userdashboard/quote/request?listingType=${listingType}&listingId=${targetId}`);
  }
}}
        details={details}
        providerName={mode === "services" ? service?.sellerName : undefined}
        reviewCount={Number(mode === "services" ? service?.reviewCount ?? 0 : 0)}
      />
      <Footer />
    </main>
  );
}

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") || "";
  const { mode, id } = parseExploreType(searchParams.get("type"));
  const [filters, setFilters] = useState<FilterState>(emptyFilterState());
  const [sortBy, setSortBy] = useState("recommended");

  const { data: productCategoriesResponse } = useGetProductCategoriesQuery();

  const serviceQuery = useGetServicesQuery({
    page: 1,
    limit: 50,
    category: mode === "services" && filters.category ? filters.category : undefined,
    q: mode === "services" ? initialSearch : undefined,
  }, { skip: mode !== "services" || Boolean(id) });

  const productQuery = useGetProductsQuery({
    page: 1,
    limit: 50,
    category: mode === "products" && filters.category ? filters.category : undefined,
    q: mode === "products" ? initialSearch : undefined,
  }, { skip: mode !== "products" || Boolean(id) });

  const venueQuery = useGetVenuesQuery({
    page: 1,
    limit: 50,
    q: mode === "venues" ? initialSearch : undefined,
    category: mode === "venues" && filters.category ? filters.category : undefined,
    sort: sortBy === "price-low" ? "price-low" : sortBy === "price-high" ? "price-high" : sortBy === "rating" ? "rating" : undefined,
  }, { skip: mode !== "venues" || Boolean(id) });

  const categories = useMemo(() => {
    if (mode === "products") {
      return ["All", ...(productCategoriesResponse?.data || [])];
    }

    if (mode === "services") {
      const serviceCategories =
        (serviceQuery.data?.data || [])
          .map((item) => item.category)
          .filter((category): category is string => Boolean(category));
      return ["All", ...Array.from(new Set(serviceCategories))];
    }

    const venueCategories =
      ((venueQuery.data?.data || []) as unknown as Array<Record<string, unknown>>)
        .map((item) => getStringRecordValue(item, "category") || getStringRecordValue(item, "type") || getStringRecordValue(item, "tag"))
        .filter((category): category is string => Boolean(category));
    return ["All", ...Array.from(new Set(venueCategories))];
  }, [mode, productCategoriesResponse, serviceQuery.data, venueQuery.data]);

  const items = useMemo<ExploreItem[]>(() => {
    if (mode === "products") return normalizeProductItems(productQuery.data?.data || []);
    if (mode === "venues") return normalizeVenueItems(venueQuery.data?.data || []);
    return normalizeServiceItems(serviceQuery.data?.data || []);
  }, [mode, productQuery.data, serviceQuery.data, venueQuery.data]);

  if (id) {
    return (
      <>
        <CompareBar />
        <ExploreDetailView mode={mode} id={id} />
      </>
    );
  }

  const handleViewModeChange = (nextMode: ExploreType) => {
    setFilters(emptyFilterState());
    setSortBy("recommended");

    const params = new URLSearchParams(searchParams.toString());
    params.set("type", nextMode);
    if (!initialSearch) params.delete("q");
    else params.set("q", initialSearch);
    router.replace(`/explore?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters(emptyFilterState());
    setSortBy("recommended");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--bhn-border)] bg-[var(--bhn-bg)]">
        <SiteHeader />
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ExploreSidebar
              viewMode={mode}
              filters={filters}
              categories={categories.filter((category) => category !== "All")}
              onChange={setFilters}
              onClear={handleClearFilters}
            />
          </aside>

          <ExploreGrid
            viewMode={mode}
            items={items}
            filters={filters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onViewModeChange={handleViewModeChange}
            categories={categories.filter((category) => category !== "All")}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function ExplorePage() {
  return <Suspense fallback={<div className="min-h-screen" />}><ExplorePageContent /></Suspense>;
}
