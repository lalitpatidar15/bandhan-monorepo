'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const collections = [
  { title: 'Wedding essentials', desc: 'Search live wedding products', image: '/image1.png', href: '/explore?type=products&q=wedding', color: 'var(--bhn-brand-800)' },
  { title: 'Festival decor', desc: 'Search live festival products', image: '/image2.png', href: '/explore?type=products&q=festival', color: 'var(--bhn-brand-700)' },
  { title: 'Birthday services', desc: 'Search services for a celebration', image: '/image3.png', href: '/explore?type=services&q=birthday', color: 'var(--bhn-info-600)' },
  { title: 'Corporate venues', desc: 'Search venues for business events', image: '/image4.png', href: '/explore?type=venues&q=corporate', color: 'var(--bhn-info-600)' },
];

export default function PromoCollections() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-600)]">Curated for you</p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--bhn-text)] sm:text-3xl" style={{ fontFamily: 'var(--bhn-font-display)' }}>Shop by collection</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {collections.map((c) => (
            <a key={c.title} href={c.href} className="group relative overflow-hidden rounded-2xl aspect-[4/5]">
              <Image src={c.image} alt={c.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${c.color}DD 0%, ${c.color}66 50%, transparent 100%)` }} />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <h3 className="text-lg font-bold text-white sm:text-xl">{c.title}</h3>
                <p className="mt-1 text-xs text-white/75">{c.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/90 transition group-hover:text-white">
                  View live results <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}