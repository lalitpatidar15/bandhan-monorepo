'use client';

import { SearchInput } from '@bandhan/ui';
import { usePathname } from 'next/navigation';
import { Bell, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SellerHeader() {
  const pathname = usePathname();
  const [userName, setUserName] = useState('Seller');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || 'Seller');
  }, [pathname]);

  const section = pathname.split('/').filter(Boolean)[0] || 'sellerDashboard';
  const title = section === 'sellerDashboard' ? 'Overview' : section.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <header className="sticky top-0 z-30 flex min-h-[64px] items-center justify-between gap-4 border-b border-[var(--bhn-border)] bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--bhn-text-soft)]">Seller workspace</p>
        <h2 className="truncate text-base font-bold text-[var(--bhn-text)]">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden w-[min(32vw,360px)] lg:block">
          <SearchInput placeholder="Search orders, products, customers…" value={search} onChange={setSearch} />
        </div>
        <a href="/chat" aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-lg text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-surface-2)]"><Bell size={18} /></a>
        <a href="/settings" aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-lg text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-surface-2)]"><Settings size={18} /></a>
        <a href="/settings" className="hidden items-center gap-2 border-l border-[var(--bhn-border)] pl-3 sm:flex">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--bhn-brand-700)] text-sm font-bold text-white">{userName.charAt(0).toUpperCase()}</span>
          <span className="max-w-28 truncate text-sm font-semibold text-[var(--bhn-text)]">{userName}</span>
        </a>
      </div>
    </header>
  );
}
