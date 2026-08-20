'use client';

import { ShoppingBag, PartyPopper, MapPin, GraduationCap, Briefcase, Palette } from 'lucide-react';

const categories = [
  { icon: ShoppingBag, label: 'Products', desc: 'Shop decor, gifts & essentials', href: '/explore?type=products', color: '#ea5d1a' },
  { icon: PartyPopper, label: 'Rentals', desc: 'Rent premium items & save', href: '/rentals', color: '#7c3017' },
  { icon: MapPin, label: 'Venues', desc: 'Banquets, lawns & halls', href: '/venues', color: '#b91c1c' },
  { icon: Palette, label: 'Services', desc: 'Photography, catering & more', href: '/explore?type=services', color: '#6d28d9' },
  { icon: GraduationCap, label: 'Courses', desc: 'Learn event & career skills', href: '/courses', color: '#0369a1' },
  { icon: Briefcase, label: 'Careers', desc: 'Find current opportunities', href: '/jobs', color: '#047857' },
];

export default function CategoryGrid() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-600)]">Browse by category</p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--bhn-text)] sm:text-3xl" style={{ fontFamily: 'var(--bhn-font-display)' }}>Top categories</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {categories.map(({ icon: Icon, label, desc, href, color }) => (
            <a key={label} href={href} className="group relative flex flex-col items-center rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5 text-center transition-all hover:border-[var(--bhn-brand-300)] hover:shadow-lg hover:shadow-[var(--bhn-brand-100)] hover:-translate-y-0.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full transition-colors group-hover:scale-110" style={{ backgroundColor: `${color}12` }}>
                <Icon size={24} style={{ color }} />
              </div>
              <span className="mt-3 text-sm font-semibold text-[var(--bhn-text)]">{label}</span>
              <span className="mt-1 text-xs text-[var(--bhn-text-muted)] leading-snug">{desc}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
