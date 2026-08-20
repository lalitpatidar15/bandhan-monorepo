"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge, Card, Chip, EmptyState, Spinner } from "@bandhan/ui";
import SiteHeader from "@/components/ui/SiteHeader";
import Footer from "@/components/ui/Footer";
import {
  useGetBlogsQuery,
  useGetCategoriesQuery,
  type Blog,
} from "@/store/api/blogApi";

function BlogsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || "1");
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(search);

  const {
    data: blogsResponse,
    isLoading,
    isFetching,
  } = useGetBlogsQuery(
    { page, limit: 9, category: category || undefined, search: search || undefined },
    { skip: false }
  );

  const { data: categories = [] } = useGetCategoriesQuery();

  const blogs: Blog[] = useMemo(
    () => blogsResponse?.data || [],
    [blogsResponse?.data]
  );
  const pagination = blogsResponse?.pagination || {
    total: 0,
    page,
    limit: 9,
    totalPages: 1,
  };

  const isLoadingState = isLoading || isFetching;

  const featuredBlog = useMemo(
    () => blogs.find((b) => b.featured) || blogs[0] || null,
    [blogs]
  );

  const handleCategoryClick = (cat: string) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (cat) params.set("category", cat);
    if (search) params.set("search", search);
    router.replace(`/blogs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("page", "1");
    if (category) params.set("category", category);
    if (searchInput.trim()) params.set("search", searchInput.trim());
    router.replace(`/blogs?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    router.replace(`/blogs?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const allCategories = ["All", ...categories.filter(Boolean)];
  const selectedCategoryLabel = category || "All";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bhn-bg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--bhn-border)] bg-[var(--bhn-bg)]">
        <SiteHeader />
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        <div className="mb-8">
          <h1 className="bhn-pageheader-title text-3xl font-bold text-[var(--bhn-text)]">
            Love Stories & Wedding Inspiration
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--bhn-text-muted)]">
            Real weddings, planning guides, and trend forecasts to inspire every
            moment of your celebration.
          </p>
        </div>

        {isLoadingState && blogs.length === 0 && (
          <div className="py-12">
            <Spinner center size="lg" />
          </div>
        )}

        {/* Featured Hero Blog */}
        {!isLoadingState && featuredBlog ? (
          <Link href={`/blogs/${featuredBlog.slug}`}>
            <Card
              hover
              className="mb-10 overflow-hidden bhn-card-hover"
            >
              <div className="flex flex-col lg:flex-row">
                {featuredBlog.coverImage ? (
                  <div className="relative h-64 w-full lg:h-full lg:w-5/12 lg:min-w-[280px] flex-shrink-0">
                    <img
                      src={featuredBlog.coverImage}
                      alt={featuredBlog.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex-1 p-6 sm:p-8 lg:p-10">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {featuredBlog.featured ? (
                      <Badge tone="brand" className="uppercase">
                        Featured
                      </Badge>
                    ) : null}
                    <Badge tone="neutral">{featuredBlog.category}</Badge>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[var(--bhn-text)] leading-tight sm:text-3xl">
                    {featuredBlog.title}
                  </h2>
                  {featuredBlog.excerpt ? (
                    <p className="mt-3 line-clamp-3 text-sm text-[var(--bhn-text-muted)] leading-relaxed">
                      {featuredBlog.excerpt}
                    </p>
                  ) : null}
                  <div className="mt-4 flex items-center gap-2 text-xs text-[var(--bhn-text-soft)]">
                    <span>{featuredBlog.authorName || "Bandhan Editorial"}</span>
                    <span>•</span>
                    <time dateTime={featuredBlog.createdAt}>
                      {new Date(featuredBlog.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ) : null}

        {/* Category Chips */}
        <div className="mb-6 overflow-x-auto">
          <form
            onSubmit={handleSearch}
            className="mb-4 flex items-center gap-2"
          >
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bhn-text-muted)]"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search blogs..."
                className="w-full rounded-full border border-[var(--bhn-border)] bg-[var(--bhn-surface)] py-2 pl-10 pr-4 text-xs outline-none placeholder:text-[var(--bhn-text-soft)] focus:border-[var(--bhn-brand-600)]"
              />
            </div>
          </form>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <Chip
                key={cat}
                selected={cat === selectedCategoryLabel}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </Chip>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        {!isLoadingState && blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog._id} href={`/blogs/${blog.slug}`}>
                <Card
                  hover
                  className="bhn-card-hover overflow-hidden h-full flex flex-col"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--bhn-surface-3)]">
                    {blog.coverImage ? (
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--bhn-text-soft)]">
                        No image
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge tone="brand" className="uppercase">
                        {blog.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-serif text-base font-semibold text-[var(--bhn-text)] line-clamp-2 leading-tight">
                      {blog.title}
                    </h3>
                    {blog.excerpt ? (
                      <p className="mt-2 line-clamp-3 text-xs text-[var(--bhn-text-muted)] leading-relaxed">
                        {blog.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-3 mt-auto flex items-center gap-2 text-xs text-[var(--bhn-text-soft)]">
                      <span>{blog.authorName || "Bandhan Editorial"}</span>
                      <span>•</span>
                      <time dateTime={blog.createdAt}>
                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : !isLoadingState && blogs.length === 0 ? (
          <EmptyState
            icon={<Search size={32} className="text-[var(--bhn-text-soft)]" />}
            title="No blogs found"
            description={
              category
                ? `No blogs in "${category}". Try a different category or search term.`
                : "We're working on fresh content. Check back soon!"
            }
          />
        ) : null}

        {/* Pagination */}
        {!isLoadingState && blogs.length > 0 && pagination.totalPages > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="bhn-btn bhn-btn-icon bhn-btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from(
              { length: pagination.totalPages },
              (_, i) => i + 1
            ).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePageChange(p)}
                className={`bhn-chip ${p === page ? "bhn-chip-active" : ""}`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pagination.totalPages}
              className="bhn-btn bhn-btn-icon bhn-btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}

        {/* Footer text */}
        {!isLoadingState && blogs.length > 0 ? (
          <p className="mt-6 text-center text-xs text-[var(--bhn-text-soft)]">
            Showing {blogs.length} of {pagination.total} posts
          </p>
        ) : null}
      </main>

      <Footer variant="simple" />
    </div>
  );
}

export default function BlogsPage() {
  return <Suspense fallback={<div className="min-h-screen" />}><BlogsPageContent /></Suspense>;
}
