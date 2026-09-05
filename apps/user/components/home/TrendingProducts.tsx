'use client';

import { ArrowRight, PackageSearch } from 'lucide-react';
import Image from 'next/image';
import { EmptyState, Skeleton } from '@bandhan/ui';
import { useGetLandingCatalogueQuery } from '@/store/api/publicApi';
import { PriceDisplay, RatingDisplay } from '@bandhan/ui';

export default function TrendingProducts() {
  const { data, isLoading, isError, refetch } = useGetLandingCatalogueQuery(6);
  const products = data?.products || [];

  return (
    <section className="bg-[var(--bhn-surface-2)] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-600)]">What's hot right now</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--bhn-text)] sm:text-3xl" style={{ fontFamily: 'var(--bhn-font-display)' }}>Trending products</h2>
          </div>
          <a href="/explore?type=products" className="hidden items-center gap-1 text-sm font-semibold text-[var(--bhn-brand-700)] transition hover:text-[var(--bhn-brand-800)] sm:flex">
            View all <ArrowRight size={15} />
          </a>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} height={270} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-6">
            {products.map((product) => (
              <a key={product.id} href={`/listings/product/${product.id}`} className="bhn-listing-card group">
                <div className="bhn-listing-card-image relative overflow-hidden aspect-square">
                  <Image
                    src={product.image || '/invitation.png'}
                    alt={product.title}
                    fill
                    sizes="(min-width: 1024px) 17vw, (min-width: 640px) 33vw, 50vw"
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.productType && (
                    <span className="absolute left-2 top-2 bhn-badge bhn-badge-brand text-xs">
                      {product.productType}
                    </span>
                  )}
                </div>
                <div className="bhn-listing-card-body">
                  <span className="bhn-listing-card-meta">
                    <RatingDisplay value={Number(product.rating || 0)} max={5} showValue={true} size="sm" />
                    <span className="text-[var(--bhn-text-muted)]">· {product.category || 'Product'}</span>
                  </span>
                  <h3 className="bhn-listing-card-title">{product.title}</h3>
                </div>
                <div className="bhn-listing-card-footer">
                  <PriceDisplay current={product.price ?? 0} currency="₹" size="sm" />
                  <span className="text-xs font-semibold text-[var(--bhn-brand-700)] ml-auto">View details →</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={<PackageSearch size={24} />}
              title={isError ? 'Products could not be loaded' : 'No products are available yet'}
              description={isError ? 'Check your connection and try again.' : 'Published products will appear here.'}
              action={isError ? <button type="button" className="bhn-btn bhn-btn-secondary" onClick={() => refetch()}>Try again</button> : undefined}
            />
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <a href="/explore?type=products" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--bhn-brand-700)]">
            View all products <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}