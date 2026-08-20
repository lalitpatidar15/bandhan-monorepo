'use client';

import { ArrowRight, Clock } from 'lucide-react';
import { useGetActiveCouponsQuery } from '@/store/api/couponApi';

export default function PromoStrip() {
  const { data, isLoading, isError } = useGetActiveCouponsQuery();
  const promotion = data?.data?.[0];

  // Promotions are optional CMS data. Never manufacture a coupon when the API
  // has no currently valid campaign.
  if (isLoading || isError || !promotion) return null;

  const offer = promotion.discountType === 'percentage'
    ? `${promotion.discountValue}% off`
    : `₹${promotion.discountValue.toLocaleString('en-IN')} off`;

  return (
    <section className="bg-[var(--bhn-brand-800)] px-4 py-8 sm:px-6 md:py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <Clock size={15} className="text-[var(--bhn-brand-200)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--bhn-brand-200)]">Limited time</span>
          </div>
          <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl" style={{ fontFamily: 'var(--bhn-font-display)' }}>
            {promotion.description || `${offer} on eligible marketplace products`}
          </h3>
          <p className="mt-1 text-sm text-white/65">
            Use code <strong className="text-white">{promotion.code}</strong> at checkout
            {promotion.minOrderAmount ? ` on orders above ₹${promotion.minOrderAmount.toLocaleString('en-IN')}` : ''}.
          </p>
        </div>
        <a href="/explore?type=products" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--bhn-brand-800)] shadow-lg transition hover:shadow-xl hover:scale-[1.02] shrink-0">
          Shop eligible products <ArrowRight size={15} />
        </a>
      </div>
    </section>
  );
}
