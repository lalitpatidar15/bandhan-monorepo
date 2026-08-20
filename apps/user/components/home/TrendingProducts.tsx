'use client';

import { ArrowRight, PackageSearch, Star } from 'lucide-react';
import Image from 'next/image';
import { EmptyState, Skeleton } from '@bandhan/ui';
import { useGetLandingCatalogueQuery } from '@/store/api/publicApi';

export default function TrendingProducts() {
  const { data, isLoading, isError, refetch } = useGetLandingCatalogueQuery(6);
  const products = data?.products || [];

  return (
    <section className="bg-[var(--bhn-surface-2)] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-600)]">What&apos;s hot right now</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--bhn-text)] sm:text-3xl" style={{ fontFamily: 'var(--bhn-font-display)' }}>Trending products</h2>
          </div>
          <a href="/explore?type=products" className="hidden items-center gap-1 text-sm font-semibold text-[var(--bhn-brand-700)] transition hover:text-[var(--bhn-brand-800)] sm:flex">
            View all <ArrowRight size={15} />
          </a>
        </div>

        {isLoading ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} height={270} />)}</div> : null}
        {!isLoading && products.length > 0 ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-6">
          {products.map((product) => (
            <a key={product.id} href={`/listings/product/${product.id}`} className="group relative flex flex-col rounded-2xl border border-[var(--bhn-border)] bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--bhn-brand-100)]">
              <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-[var(--bhn-surface)]">
                <Image
                  src={product.image || '/invitation.png'}
                  alt={product.title}
                  fill
                  sizes="(min-width: 1024px) 17vw, (min-width: 640px) 33vw, 50vw"
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.productType ? <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--bhn-brand-700)]">{product.productType}</span> : null}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <span className="line-clamp-1 text-xs text-[var(--bhn-text-muted)]"><Star size={11} className="inline -translate-y-px fill-amber-400 text-amber-400" /> {Number(product.rating || 0).toFixed(1)} · {product.category || 'Product'}</span>
                <span className="mt-1 line-clamp-2 text-sm font-medium text-[var(--bhn-text)]">{product.title}</span>
                <span className="mt-auto pt-2 text-base font-bold text-[var(--bhn-brand-700)]">{product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Price on request'}</span>
                <span className="mt-2 text-xs font-semibold text-[var(--bhn-brand-700)]">View details →</span>
              </div>
            </a>
          ))}
        </div> : null}
        {!isLoading && !products.length ? <div className="mt-8"><EmptyState icon={<PackageSearch size={24} />} title={isError ? 'Products could not be loaded' : 'No products are available yet'} description={isError ? 'Check your connection and try again.' : 'Published products will appear here.'} action={isError ? <button type="button" className="bhn-btn bhn-btn-secondary" onClick={() => refetch()}>Try again</button> : undefined} /></div> : null}

        <div className="mt-6 text-center sm:hidden">
          <a href="/explore?type=products" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--bhn-brand-700)]">
            View all products <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
