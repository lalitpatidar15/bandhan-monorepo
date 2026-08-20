"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Armchair,
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  LoaderCircle,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import {
  type PublicCatalogueItem,
  type PublicCatalogueType,
  useGetPublicCataloguePageQuery,
  useLazyGetPublicCataloguePageQuery,
} from "@/store/api/publicApi";

export type PublicDiscoveryKind = "courses" | "jobs" | "rentals";

type CatalogueConfig = {
  catalogueType: PublicCatalogueType;
  detailType: "course" | "job" | "rental";
  eyebrow: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  secondaryFilterLabel?: string;
};

const CONFIG: Record<PublicDiscoveryKind, CatalogueConfig> = {
  courses: {
    catalogueType: "courses",
    detailType: "course",
    eyebrow: "Bandhan Learning",
    title: "Learn skills that move you forward",
    description: "Browse published courses from Bandhan instructors before choosing what to learn.",
    searchPlaceholder: "Search by course, instructor or skill",
    emptyTitle: "No courses match these filters",
    emptyDescription: "Try another keyword, category or level.",
    secondaryFilterLabel: "Level",
  },
  jobs: {
    catalogueType: "jobs",
    detailType: "job",
    eyebrow: "Bandhan Careers",
    title: "Find your next opportunity",
    description: "Explore active jobs from Bandhan partners. Sign in only when you are ready to apply.",
    searchPlaceholder: "Search by job, company, location or skill",
    emptyTitle: "No jobs match these filters",
    emptyDescription: "Try another keyword, category or experience level.",
    secondaryFilterLabel: "Experience level",
  },
  rentals: {
    catalogueType: "products",
    detailType: "rental",
    eyebrow: "Bandhan Rentals",
    title: "Rent what your celebration needs",
    description: "Browse approved rental products and review the details before you sign in.",
    searchPlaceholder: "Search rental products or sellers",
    emptyTitle: "No rentals match these filters",
    emptyDescription: "Clear a filter or load more approved listings.",
  },
};

const PAGE_SIZE = 24;

const formatMoney = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Price on request";
  if (value === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatSalary = (item: PublicCatalogueItem) => {
  const currency = item.currency || "₹";
  const minimum = typeof item.salaryMin === "number" ? item.salaryMin.toLocaleString("en-IN") : "";
  const maximum = typeof item.salaryMax === "number" ? item.salaryMax.toLocaleString("en-IN") : "";

  if (minimum && maximum) return `${currency}${minimum} – ${currency}${maximum}`;
  if (minimum) return `From ${currency}${minimum}`;
  if (maximum) return `Up to ${currency}${maximum}`;
  return "Salary not disclosed";
};

const readableLabel = (value?: string) =>
  value
    ? value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "";

function KindIcon({ kind, className }: { kind: PublicDiscoveryKind; className?: string }) {
  if (kind === "courses") return <GraduationCap aria-hidden="true" className={className} />;
  if (kind === "jobs") return <BriefcaseBusiness aria-hidden="true" className={className} />;
  return <Armchair aria-hidden="true" className={className} />;
}

function secondaryValue(kind: PublicDiscoveryKind, item: PublicCatalogueItem) {
  if (kind === "jobs") return item.level || item.type || "";
  if (kind === "courses") return item.level || "";
  return "";
}

function cardPrice(kind: PublicDiscoveryKind, item: PublicCatalogueItem) {
  if (kind === "jobs") return formatSalary(item);
  if (kind === "rentals") return formatMoney(item.rentalPrice || item.price);
  return formatMoney(item.price);
}

function cardProvider(kind: PublicDiscoveryKind, item: PublicCatalogueItem) {
  if (kind === "courses") return item.instructor || "Bandhan instructor";
  return item.company || (kind === "jobs" ? "Bandhan partner" : "Bandhan seller");
}

function isRental(item: PublicCatalogueItem) {
  const availability = String(item.productType || "").toLowerCase();
  return availability === "rental" || availability === "rent" || availability === "both";
}

function ListingArtwork({ item, kind }: { item: PublicCatalogueItem; kind: PublicDiscoveryKind }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[var(--bhn-brand-50)] to-[var(--bhn-surface-3)]">
      <KindIcon
        kind={kind}
        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-[var(--bhn-brand-300)]"
      />
      {item.image ? (
        // Public sellers and instructors may host media on different approved CDNs.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--bhn-brand-800)] backdrop-blur">
        {kind === "rentals" ? "For rent" : readableLabel(item.category) || readableLabel(kind.slice(0, -1))}
      </span>
    </div>
  );
}

function CatalogueCard({ item, kind, detailType }: { item: PublicCatalogueItem; kind: PublicDiscoveryKind; detailType: CatalogueConfig["detailType"] }) {
  const href = `/listings/${detailType}/${encodeURIComponent(item.id)}`;
  const context = kind === "courses"
    ? readableLabel(item.level) || "All levels"
    : kind === "jobs"
      ? readableLabel(item.type) || readableLabel(item.level) || "Job opportunity"
      : readableLabel(item.stockStatus) || "Availability on request";

  return (
    <Link
      href={href}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--bhn-brand-300)] hover:shadow-[var(--bhn-shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bhn-brand-500)]"
    >
      <ListingArtwork item={item} kind={kind} />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[var(--bhn-text-muted)]">{cardProvider(kind, item)}</p>
            <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-[var(--bhn-text)]">{item.title}</h2>
          </div>
          {typeof item.rating === "number" && item.rating > 0 ? (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
              <Star aria-hidden="true" className="h-3.5 w-3.5 fill-current" /> {item.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        {item.description ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--bhn-text-muted)]">{item.description}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            <p className="truncate text-xs text-[var(--bhn-text-soft)]">{context}</p>
            {item.location ? (
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-[var(--bhn-text-muted)]">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /> {item.location}
              </p>
            ) : null}
            <p className="mt-1.5 text-sm font-bold text-[var(--bhn-brand-800)]">{cardPrice(kind, item)}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--bhn-brand-700)]">
            View details <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PublicCataloguePage({ kind }: { kind: PublicDiscoveryKind }) {
  const config = CONFIG[kind];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [secondaryFilter, setSecondaryFilter] = useState("");
  const [extraItems, setExtraItems] = useState<PublicCatalogueItem[]>([]);
  const [loadedPage, setLoadedPage] = useState(1);
  const [loadMoreError, setLoadMoreError] = useState("");

  const queryArgs = {
    type: config.catalogueType,
    page: 1,
    limit: PAGE_SIZE,
    productType: kind === "rentals" ? "rent" as const : undefined,
  };
  const { data, isLoading, isFetching, isError, refetch } = useGetPublicCataloguePageQuery(queryArgs);
  const [loadMore, { isFetching: isLoadingMore }] = useLazyGetPublicCataloguePageQuery();

  const allLoadedItems = useMemo(() => {
    const byId = new Map<string, PublicCatalogueItem>();
    [...(data?.items || []), ...extraItems].forEach((item) => {
      if (item?.id) byId.set(item.id, item);
    });
    return Array.from(byId.values());
  }, [data?.items, extraItems]);

  const availableItems = useMemo(
    () => kind === "rentals" ? allLoadedItems.filter(isRental) : allLoadedItems,
    [allLoadedItems, kind],
  );

  const categories = useMemo(
    () => Array.from(new Set(availableItems.map((item) => item.category).filter((value): value is string => Boolean(value)))).sort(),
    [availableItems],
  );

  const secondaryOptions = useMemo(
    () => Array.from(new Set(availableItems.map((item) => secondaryValue(kind, item)).filter(Boolean))).sort(),
    [availableItems, kind],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return availableItems.filter((item) => {
      const matchesCategory = !category || item.category === category;
      const matchesSecondary = !secondaryFilter || secondaryValue(kind, item) === secondaryFilter;
      const searchable = [
        item.title,
        item.category,
        item.company,
        item.instructor,
        item.location,
        item.description,
        ...(item.skills || []),
      ].filter(Boolean).join(" ").toLowerCase();
      return matchesCategory && matchesSecondary && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [availableItems, category, kind, query, secondaryFilter]);

  const totalPages = data?.pagination.totalPages || 1;
  const hasMore = loadedPage < totalPages;
  const hasActiveFilters = Boolean(query || category || secondaryFilter);

  const handleLoadMore = async () => {
    const nextPage = loadedPage + 1;
    setLoadMoreError("");
    try {
      const next = await loadMore({
        type: config.catalogueType,
        page: nextPage,
        limit: PAGE_SIZE,
        productType: kind === "rentals" ? "rent" : undefined,
      }, true).unwrap();
      setExtraItems((current) => [...current, ...next.items]);
      setLoadedPage(next.pagination.page);
    } catch {
      setLoadMoreError("We could not load more listings. Please try again.");
    }
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setSecondaryFilter("");
  };

  return (
    <AppShell>
      <section className="border-b border-[var(--bhn-border)] bg-gradient-to-b from-[var(--bhn-brand-50)] to-[var(--bhn-bg)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--bhn-brand-700)]">{config.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-[var(--bhn-text)] sm:text-5xl">{config.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--bhn-text-muted)] sm:text-lg">{config.description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="catalogue-results-heading">
        <div className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4 shadow-[var(--bhn-shadow-sm)] sm:p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--bhn-text)]">
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-[var(--bhn-brand-700)]" />
            Find the right match
          </div>
          <div className={`mt-4 grid gap-3 ${config.secondaryFilterLabel ? "md:grid-cols-[minmax(0,1fr)_220px_220px]" : "md:grid-cols-[minmax(0,1fr)_260px]"}`}>
            <label className="relative block">
              <span className="sr-only">Search</span>
              <Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bhn-text-soft)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={config.searchPlaceholder}
                className="h-11 w-full rounded-xl border border-[var(--bhn-border-strong)] bg-[var(--bhn-bg)] pl-10 pr-4 text-sm text-[var(--bhn-text)] outline-none transition placeholder:text-[var(--bhn-text-soft)] focus:border-[var(--bhn-brand-500)] focus:ring-2 focus:ring-[var(--bhn-brand-100)]"
              />
            </label>
            <label>
              <span className="sr-only">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--bhn-border-strong)] bg-[var(--bhn-bg)] px-3 text-sm text-[var(--bhn-text)] outline-none focus:border-[var(--bhn-brand-500)] focus:ring-2 focus:ring-[var(--bhn-brand-100)]"
              >
                <option value="">All categories</option>
                {categories.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            {config.secondaryFilterLabel ? (
              <label>
                <span className="sr-only">{config.secondaryFilterLabel}</span>
                <select
                  value={secondaryFilter}
                  onChange={(event) => setSecondaryFilter(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--bhn-border-strong)] bg-[var(--bhn-bg)] px-3 text-sm text-[var(--bhn-text)] outline-none focus:border-[var(--bhn-brand-500)] focus:ring-2 focus:ring-[var(--bhn-brand-100)]"
                >
                  <option value="">All {config.secondaryFilterLabel.toLowerCase()}s</option>
                  {secondaryOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="catalogue-results-heading" className="text-2xl font-bold text-[var(--bhn-text)]">
              {kind === "courses" ? "Available courses" : kind === "jobs" ? "Open opportunities" : "Available rentals"}
            </h2>
            <p className="mt-1 text-sm text-[var(--bhn-text-muted)]" aria-live="polite">
              {filteredItems.length} {filteredItems.length === 1 ? "listing" : "listings"} shown
              {hasMore ? " · more are available" : ""}
            </p>
          </div>
          {hasActiveFilters ? (
            <button type="button" onClick={clearFilters} className="text-sm font-bold text-[var(--bhn-brand-700)] hover:text-[var(--bhn-brand-800)] hover:underline">
              Clear filters
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3" role="status">
            <LoaderCircle aria-hidden="true" className="h-7 w-7 animate-spin text-[var(--bhn-brand-600)]" />
            <p className="text-sm text-[var(--bhn-text-muted)]">Loading approved listings…</p>
          </div>
        ) : isError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h3 className="text-lg font-bold text-red-900">We could not load these listings</h3>
            <p className="mt-2 text-sm text-red-700">Check your connection and try again.</p>
            <button type="button" onClick={() => refetch()} className="mt-5 rounded-xl bg-[var(--bhn-brand-700)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--bhn-brand-800)]">
              Try again
            </button>
          </div>
        ) : filteredItems.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <CatalogueCard key={item.id} item={item} kind={kind} detailType={config.detailType} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--bhn-border-strong)] bg-[var(--bhn-surface-2)] px-5 py-12 text-center">
            <Search aria-hidden="true" className="mx-auto h-8 w-8 text-[var(--bhn-brand-400)]" />
            <h3 className="mt-4 text-lg font-bold text-[var(--bhn-text)]">{config.emptyTitle}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--bhn-text-muted)]">{config.emptyDescription}</p>
            {hasActiveFilters ? (
              <button type="button" onClick={clearFilters} className="mt-5 rounded-xl border border-[var(--bhn-border-strong)] bg-white px-5 py-2.5 text-sm font-bold text-[var(--bhn-brand-800)] hover:bg-[var(--bhn-brand-50)]">
                Clear filters
              </button>
            ) : null}
          </div>
        )}

        {hasMore ? (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--bhn-brand-300)] bg-[var(--bhn-surface)] px-6 py-2.5 text-sm font-bold text-[var(--bhn-brand-800)] transition hover:bg-[var(--bhn-brand-50)] disabled:cursor-wait disabled:opacity-60"
            >
              {isLoadingMore ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
              {isLoadingMore ? "Loading…" : "Load more"}
            </button>
            {loadMoreError ? <p className="mt-2 text-sm text-red-700" role="alert">{loadMoreError}</p> : null}
          </div>
        ) : null}

        {isFetching && !isLoading ? <p className="sr-only" role="status">Refreshing listings</p> : null}
      </section>
    </AppShell>
  );
}
