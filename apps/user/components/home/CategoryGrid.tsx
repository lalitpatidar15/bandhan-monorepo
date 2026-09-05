'use client';

import { ShoppingBag, PartyPopper, MapPin, GraduationCap, Briefcase, Palette } from 'lucide-react';
import { Card, Chip, Badge } from '@bandhan/ui';
import Link from 'next/link';

const categories = [
  { icon: ShoppingBag, label: 'Products', desc: 'Shop decor, gifts & essentials', href: '/explore?type=products', color: 'var(--bhn-brand-500)' },
  { icon: PartyPopper, label: 'Rentals', desc: 'Rent premium items & save', href: '/rentals', color: 'var(--bhn-brand-800)' },
  { icon: MapPin, label: 'Venues', desc: 'Banquets, lawns & halls', href: '/venues', color: 'var(--bhn-error-600)' },
  { icon: Palette, label: 'Services', desc: 'Photography, catering & more', href: '/explore?type=services', color: 'var(--bhn-info-600)' },
  { icon: GraduationCap, label: 'Courses', desc: 'Learn event & career skills', href: '/courses', color: 'var(--bhn-info-600)' },
  { icon: Briefcase, label: 'Careers', desc: 'Find current opportunities', href: '/jobs', color: 'var(--bhn-success-600)' },
];

export default function CategoryGrid() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-600)]">Browse by category</p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--bhn-text)] sm:text-3xl" style={{ fontFamily: 'var(--bhn-font-display)' }}>Top categories</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {categories.map(({ icon: Icon, label, desc, href, color }) => (
            <Link key={label} href={href} className="group relative flex flex-col items-center rounded-2xl border border-[var(--bhn-border)] bg-white p-5 text-center transition-all hover:border-[var(--bhn-brand-300)] hover:shadow-lg hover:shadow-[var(--bhn-brand-100)] hover:-translate-y-0.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full transition-colors group-hover:scale-110" style={{ backgroundColor: `${color}1A` }}>
                <Icon size={24} style={{ color }} />
              </div>
              <span className="mt-3 text-sm font-semibold text-[var(--bhn-text)]">{label}</span>
              <span className="mt-1 text-xs text-[var(--bhn-text-muted)] leading-snug">{desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}