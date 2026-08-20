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
      <div className="w-full max-w-3xl rounded-2xl bg-white/95 p-2 shadow-xl backdrop-blur">
        <div className="flex flex-wrap gap-1 border-b border-gray-100 px-1 pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                tab === t.key ? 'bg-[#924C2B] text-white' : 'text-gray-600 hover:bg-gray-100'
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
          <Search className="h-5 w-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search venues, services, products..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          <button type="submit" className="rounded-lg bg-[#924C2B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7a3d23]">
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
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200"
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
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, rentals, services, venues..."
        className="w-full rounded-full border border-[#E7E1D8] bg-[#F3ECE4] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#924C2B]"
      />
    </form>
  );
}
