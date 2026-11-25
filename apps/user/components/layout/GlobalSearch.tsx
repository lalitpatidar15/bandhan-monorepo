'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TABS = [
  { key: 'products', label: 'Products' },
  { key: 'rentals', label: 'Rentals' },
  { key: 'services', label: 'Services' },
  { key: 'venues', label: 'Venues' },
];

const TRENDING = ['Wedding decoration', 'Banquet hall', 'Photography', 'Mandap', 'Catering', 'Florist'];

export default function GlobalSearch({ variant = 'header' }: { variant?: 'header' | 'hero' }) {
  const router = useRouter();
  const [tab, setTab] = useState('products');
  const [query, setQuery] = useState('');

  const submit = () => {
    const params = new URLSearchParams();
    params.set('type', tab === 'rentals' ? 'products' : tab);
    if (query.trim()) params.set('q', query.trim());
    router.push(`/explore?${params.toString()}`);
  };

  if (variant === 'hero') {
    return (
      <div className="w-full max-w-3xl rounded-2xl bg-[color-mix(in_srgb,var(--bhn-surface)_95%,transparent)] p-2 shadow-xl backdrop-blur">
        <div className="flex flex-wrap gap-1 border-b border-[var(--bhn-border)] px-1 pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                tab === t.key ? 'bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)]' : 'text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-3)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="mt-2 flex items-center gap-2 px-2 py-1"
        >
          <Search className="h-5 w-5 text-[var(--bhn-text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search venues, services, products..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--bhn-text-muted)]"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear">
              <X className="h-4 w-4 text-[var(--bhn-text-muted)]" />
            </button>
          )}
          <button type="submit" className="rounded-lg bg-[var(--bhn-brand-600)] px-4 py-2 text-sm font-semibold text-[var(--bhn-text-on-brand)] hover:bg-[var(--bhn-brand-600)]">
            Search
          </button>
        </form>
        <div className="flex flex-wrap gap-2 px-3 pb-2 pt-1">
          {TRENDING.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setQuery(t);
                const params = new URLSearchParams();
                params.set('type', tab === 'rentals' ? 'products' : tab);
                params.set('q', t);
                router.push(`/explore?${params.toString()}`);
              }}
              className="rounded-full bg-[var(--bhn-surface-3)] px-2.5 py-1 text-xs text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-3)]"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="relative hidden flex-1 md:flex"
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bhn-text-muted)]" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, rentals, services, venues..."
        className="w-full rounded-full border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] py-2 pl-9 pr-3 text-xs outline-none focus:border-[var(--bhn-brand-600)]"
      />
    </form>
  );
}
