'use client';

import { Bell, ShieldCheck, UserRound } from 'lucide-react';
import { Logo } from '@bandhan/ui';

export default function AdminTopBar({ title }: { title: string }) {
  return (
    <header
      className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6"
      style={{ background: 'linear-gradient(90deg, var(--bhn-brand-800), var(--bhn-brand-600))' }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden sm:block">
          <Logo size="sm" onDark />
        </span>

        <div className="min-w-0 border-l pl-3" style={{ borderLeftColor: 'var(--bhn-text-on-brand-25)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[color-mix(in_srgb,var(--bhn-text-on-brand)_70%,transparent)]">
            Bandhan control centre
          </p>
          <h1 className="truncate text-lg font-semibold text-[var(--bhn-text-on-brand)]">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-[var(--bhn-text-on-brand)]">
        <button type="button" aria-label="Notifications" className="rounded-full p-2 transition hover:bg-[color-mix(in_srgb,var(--bhn-surface)_15%,transparent)]">
          <Bell size={18} />
        </button>

        <span className="hidden items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--bhn-surface)_15%,transparent)] px-3 py-1.5 font-medium text-[var(--bhn-text-on-brand)] sm:flex">
          <ShieldCheck size={16} />
          Admin
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: 'var(--bhn-text-on-brand-40)' }}>
          <UserRound size={17} />
        </span>
      </div>
    </header>
  );
}