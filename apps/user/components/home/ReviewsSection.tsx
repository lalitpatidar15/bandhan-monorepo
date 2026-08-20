'use client';

import { Star } from 'lucide-react';
import { EmptyState, Skeleton } from '@bandhan/ui';
import { useGetFeaturedReviewsQuery } from '@/store/api/publicApi';

export default function ReviewsSection() {
  const { data, isLoading, isError, refetch } = useGetFeaturedReviewsQuery(5);
  const reviews = data?.reviews || [];
  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-600)]">What our customers say</p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--bhn-text)] sm:text-3xl" style={{ fontFamily: 'var(--bhn-font-display)' }}>Customer reviews</h2>
        {data?.total ? <div className="mx-auto mt-2 flex items-center justify-center gap-1.5 text-sm text-[var(--bhn-text-muted)]">
          <Star size={16} className="fill-amber-400 text-amber-400" /> <strong className="text-[var(--bhn-text)]">{data.averageRating.toFixed(1)}</strong> average from {data.total.toLocaleString('en-IN')} verified {data.total === 1 ? 'review' : 'reviews'}
        </div> : null}

        {isLoading ? <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} height={220} />)}</div> : null}
        {!isLoading && reviews.length ? <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {reviews.map((review) => (
            <article key={review.id} className="flex flex-col rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5 text-left">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
                ))}
              </div>
              {review.title ? <h3 className="mt-3 text-sm font-bold text-[var(--bhn-text)]">{review.title}</h3> : null}
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--bhn-text)]">&ldquo;{review.comment}&rdquo;</p>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--bhn-border)] pt-3">
                <span className="text-xs font-semibold text-[var(--bhn-text)]">{review.customerName}</span>
                <span className="max-w-[55%] truncate rounded-full bg-[var(--bhn-brand-50)] px-2 py-0.5 text-[10px] font-bold text-[var(--bhn-brand-700)]">{review.productName}</span>
              </div>
            </article>
          ))}
        </div> : null}
        {!isLoading && !reviews.length ? <div className="mx-auto mt-8 max-w-xl"><EmptyState title={isError ? 'Reviews could not be loaded' : 'No customer reviews yet'} description={isError ? 'Check your connection and try again.' : 'Verified customer reviews will appear here.'} action={isError ? <button type="button" className="bhn-btn bhn-btn-secondary" onClick={() => refetch()}>Try again</button> : undefined} /></div> : null}
      </div>
    </section>
  );
}
