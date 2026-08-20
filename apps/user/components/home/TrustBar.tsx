'use client';

import { ShieldCheck, Truck, RotateCcw, CreditCard, Headphones, Sparkles } from 'lucide-react';

const features = [
  { icon: Truck, text: 'Delivery terms shown at checkout' },
  { icon: ShieldCheck, text: 'Secure payment processing' },
  { icon: RotateCcw, text: 'Listing-specific return terms' },
  { icon: CreditCard, text: 'Payment options shown at checkout' },
  { icon: Headphones, text: 'Support from your dashboard' },
  { icon: Sparkles, text: 'Seller status shown on listings' },
];

export default function TrustBar() {
  return (
    <section className="border-b border-[var(--bhn-border)] bg-[var(--bhn-surface)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 px-4 py-3 sm:px-6 sm:gap-6 md:gap-8">
        {features.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-xs text-[var(--bhn-text-muted)] sm:text-sm">
            <Icon size={15} className="text-[var(--bhn-brand-600)]" />
            <span className="whitespace-nowrap">{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
