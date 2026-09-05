'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { EmptyState, Skeleton, Badge, PriceDisplay, RatingDisplay } from '@bandhan/ui';
import { useGetLandingCatalogueQuery } from '@/store/api/publicApi';

export default function FeaturedServices() {
  const { data, isLoading, isError, refetch } = useGetLandingCatalogueQuery(6);
  const services = (data?.services || []).slice(0, 4);

  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-600)]">Verified professionals</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--bhn-text)] sm:text-3xl" style={{ fontFamily: 'var(--bhn-font-display)' }}>Featured services</h2>
          </div>
          <a href="/explore?type=services" className="hidden items-center gap-1 text-sm font-semibold text-[var(--bhn-brand-700)] transition hover:text-[var(--bhn-brand-800)] sm:flex">
            View all <ArrowRight size={15} />
          </a>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} height={300} />)}
          </div>
        ) : services.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <a key={service.id} href={`/listings/service/${service.id}`} className="bhn-listing-card group">
                <div className="bhn-listing-card-image relative overflow-hidden aspect-[4/3]">
                  <Image
                    src={service.image || '/invitation.png'}
                    alt={service.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {service.category && (
                    <Badge tone="brand" className="absolute left-3 top-3 text-xs">
                      {service.category}
                    </Badge>
                  )}
                </div>
                <div className="bhn-listing-card-body">
                  <h3 className="bhn-listing-card-title">{service.title}</h3>
                  <div className="bhn-listing-card-meta">
                    <RatingDisplay value={Number(service.rating || 0)} max={5} showValue={true} size="sm" />
                    {service.location && <span className="text-[var(--bhn-text-muted)]">· {service.location}</span>}
                  </div>
                </div>
                <div className="bhn-listing-card-footer">
                  <PriceDisplay current={service.price ?? 0} currency="₹" unit="+" size="sm" />
                  <span className="text-xs font-semibold text-[var(--bhn-brand-600)] ml-auto">Enquire →</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title={isError ? 'Services could not be loaded' : 'No services are available yet'}
              description={isError ? 'Check your connection and try again.' : 'Published services will appear here.'}
              action={isError ? <button type="button" className="bhn-btn bhn-btn-secondary" onClick={() => refetch()}>Try again</button> : undefined}
            />
          </div>
        )}
      </div>
    </section>
  );
}