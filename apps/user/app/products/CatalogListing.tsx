"use client";

import SiteHeader from "@/components/ui/SiteHeader";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useRequireAuth } from "@/lib/auth";
import { useAddToWishlistMutation } from "@/store/api/wishlistApi";
import { ArrowUpDown, Heart, Search, ShoppingBag, SlidersHorizontal, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CatalogItem } from "./catalogData";

type CatalogListingProps = {
  title: string;
  eyebrow: string;
  description: string;
  items: CatalogItem[];
  mode: "products" | "services" | "venues";
};

const priceSorters = {
  recommended: "Recommended",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  rating: "Rating",
};

export default function CatalogListing({
  title,
  eyebrow,
  description,
  items,
  mode,
}: CatalogListingProps) {
  const { addToCart } = useCart();
  const { gate } = useRequireAuth();
  const [addToWishlist] = useAddToWishlistMutation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<keyof typeof priceSorters>("recommended");
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.category)))],
    [items],
  );

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.category, item.description, item.location]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });

    if (sortBy === "price-low") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    if (sortBy === "rating") {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [category, items, query, sortBy]);

  const handleAddToCart = (item: CatalogItem) => {
    // Login required (spec Section 1)
    gate(() => {
      addToCart({
        title: item.title,
        price: item.price,
        img: item.image,
        date: new Date().toISOString().slice(0, 10),
        guests: 1,
        location: item.location,
        itemType: "product",
      });
    });
  };

  const handleWishlist = (item: CatalogItem) => {
    // Login required (spec Section 1)
    gate(() => {
      const entityType = mode === "products" ? "product" : mode === "services" ? "service" : "venue";
      addToWishlist({ entityType, entityId: item.id, title: item.title, image: item.image, price: item.price });
      setFavorites((cur) => (cur.includes(item.id) ? cur.filter((i) => i !== item.id) : [...cur, item.id]));
    });
  };

  return (
    <main className="min-h-screen bg-[var(--bhn-surface-2)]">
      <SiteHeader />

      <section className="border-b border-[var(--bhn-border)] bg-[var(--bhn-surface-2)]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--bhn-text)]">
              {eyebrow}
            </p>
            <h1 className="mt-2 max-w-3xl text-xl font-semibold leading-tight text-[var(--bhn-text)] sm:text-lg">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-[var(--bhn-text-muted)] sm:text-sm">
              {description}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button href={mode === "products" ? "/products/service-listing" : "/products"} variant="primary">
                {mode === "products" ? "Browse Services" : "Browse Products"}
              </Button>
              <Button href={mode === "venues" ? "/products/service-listing" : "/products/Venue"} variant="secondary">
                {mode === "venues" ? "Explore Services" : "Explore Venues"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-2.5 shadow-sm">
            {[
              ["Items", items.length.toString()],
              ["Avg rating", "4.7"],
              ["Verified", "100%"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-[var(--bhn-surface-2)] p-2">
                <p className="text-base font-semibold text-[var(--bhn-text)]">{value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--bhn-text-muted)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-4 grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${mode}...`}
              className="h-10 w-full rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] pl-11 pr-4 text-sm text-[var(--bhn-text)] outline-none transition focus:border-[var(--bhn-brand-600)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--bhn-brand-600)_15%,transparent)]"
            />
          </label>

          <label className="relative block">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]" size={17} />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] pl-11 pr-4 text-sm text-[var(--bhn-text)] outline-none transition focus:border-[var(--bhn-brand-600)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--bhn-brand-600)_15%,transparent)]"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="relative block">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]" size={17} />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as keyof typeof priceSorters)}
              className="h-10 w-full appearance-none rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] pl-11 pr-4 text-sm text-[var(--bhn-text)] outline-none transition focus:border-[var(--bhn-brand-600)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--bhn-brand-600)_15%,transparent)]"
            >
              {Object.entries(priceSorters).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--bhn-text-muted)]">
            Showing <span className="font-semibold text-[var(--bhn-text)]">{visibleItems.length}</span>{" "}
            {mode === "venues" ? "venues" : mode}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
              setSortBy("recommended");
            }}
            className="text-xs font-semibold text-[var(--bhn-text)] hover:underline"
          >
            Reset filters
          </button>
        </div>

        {visibleItems.length ? (
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => {
              const isFavorite = favorites.includes(item.id);

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Link href={item.href} className="group block">
                    <div className="relative h-36 overflow-hidden bg-[var(--bhn-surface-2)]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-[color-mix(in_srgb,var(--bhn-brand-900)_85%,transparent)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--bhn-text-on-brand)]">
                        {item.badge}
                      </span>
                    </div>
                  </Link>

                  <div className="p-2.5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-text)]">
                          {item.category}
                        </p>
                        <Link href={item.href}>
                          <h2 className="mt-1 text-base font-semibold text-[var(--bhn-text)] hover:text-[var(--bhn-text)]">
                            {item.title}
                          </h2>
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleWishlist(item)}
                        aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
                        className="rounded-full border border-[var(--bhn-border)] p-1.5 text-[var(--bhn-text-muted)] transition hover:border-[var(--bhn-brand-600)] hover:text-[var(--bhn-text)]"
                      >
                        <Heart size={18} className={isFavorite ? "fill-[var(--bhn-brand-600)] text-[var(--bhn-text)]" : ""} />
                      </button>
                    </div>

                    <p className="mt-2 min-h-[36px] text-xs leading-5 text-[var(--bhn-text-muted)]">
                      {item.description}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--bhn-text-muted)]">
                      <span>{item.location}</span>
                      <span className="h-1 w-1 rounded-full bg-[var(--bhn-surface-2)]" />
                      <span>{item.meta}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--bhn-border)] pt-2">
                      <div>
                        <p className="text-xs font-semibold text-[var(--bhn-text)]">{item.priceLabel}</p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-[var(--bhn-text-muted)]">
                          <Star size={14} className="fill-[var(--bhn-brand-600)] text-[var(--bhn-text)]" />
                          {item.rating} ({item.reviews})
                        </p>
                      </div>

                      {mode === "products" ? (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--bhn-brand-600)] px-3 text-xs font-semibold text-[var(--bhn-text-on-brand)] transition hover:bg-[var(--bhn-brand-600)]"
                        >
                          <ShoppingBag size={16} />
                          Add
                        </button>
                      ) : (
                        <Button href={item.href} variant="primary" size="sm" className="rounded-lg">
                          View
                        </Button>
                      )}

                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4 text-center">
            <p className="text-lg font-semibold text-[var(--bhn-text)]">No matches found</p>
            <p className="mt-2 text-sm text-[var(--bhn-text-muted)]">Try another search term or category.</p>
          </div>
        )}
      </section>
    </main>
  );
}
