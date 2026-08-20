'use client';

import { MapPin, Star, Users, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { EmptyState, Skeleton } from '@bandhan/ui';
import { useGetLandingCatalogueQuery } from '@/store/api/publicApi';

export default function FeaturedVenues() {
  const { data, isLoading, isError, refetch } = useGetLandingCatalogueQuery(6);
  const venues = (data?.venues || []).slice(0, 4);
  return (
    <section className="bg-[var(--bhn-surface-2)] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-600)]">Handpicked venues</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--bhn-text)] sm:text-3xl" style={{ fontFamily: 'var(--bhn-font-display)' }}>Featured venues</h2>
          </div>
          <a href="/venues" className="hidden items-center gap-1 text-sm font-semibold text-[var(--bhn-brand-700)] transition hover:text-[var(--bhn-brand-800)] sm:flex">
            View all <ArrowRight size={15} />
          </a>
        </div>

        {isLoading ? <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} height={300} />)}</div> : null}
        {!isLoading && venues.length ? <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {venues.map((venue) => (
            <a key={venue.id} href={`/listings/venue/${venue.id}`} className="group overflow-hidden rounded-2xl border border-[var(--bhn-border)] bg-white transition-all hover:shadow-xl hover:shadow-[var(--bhn-brand-100)] hover:-translate-y-0.5">
              <div className="relative h-44 overflow-hidden sm:h-48">
                <Image
                  src={venue.image || '/venue.png'}
                  alt={venue.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-[var(--bhn-text)] line-clamp-1">{venue.title}</h3>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--bhn-text-muted)]">
                  <span className="flex min-w-0 items-center gap-0.5 truncate"><MapPin size={11} /> {venue.location || 'Location on request'}</span>
                  {venue.guests ? <span className="flex shrink-0 items-center gap-0.5"><Users size={11} /> Up to {venue.guests}</span> : null}
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <Star size={12} className="fill-amber-400 text-amber-400" /> {Number(venue.rating || 0).toFixed(1)}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--bhn-brand-700)]">{venue.price ? `₹${venue.price.toLocaleString('en-IN')} / day` : 'Price on request'}</span>
                  <span className="text-xs font-semibold text-[var(--bhn-brand-600)] transition group-hover:text-[var(--bhn-brand-700)]">View details →</span>
                </div>
              </div>
            </a>
          ))}
        </div> : null}
        {!isLoading && !venues.length ? <div className="mt-8"><EmptyState title={isError ? 'Venues could not be loaded' : 'No venues are available yet'} description={isError ? 'Check your connection and try again.' : 'Published venues will appear here.'} action={isError ? <button type="button" className="bhn-btn bhn-btn-secondary" onClick={() => refetch()}>Try again</button> : undefined} /></div> : null}
      </div>
    </section>
  );
}
