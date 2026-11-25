'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';

export default function CompareBar() {
  const { items, count, remove, clear } = useCompare();

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 lg:bottom-0">
      <div className="mx-auto max-w-7xl px-3">
        <div className="flex items-center gap-3 rounded-t-xl border border-[var(--bhn-border)] bg-[color-mix(in_srgb,var(--bhn-surface)_95%,transparent)] px-3 py-2 shadow-md backdrop-blur">
          <span className="hidden text-xs font-medium text-[var(--bhn-text-muted)] sm:block">
            Compare ({count}/4)
          </span>
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {items.map((i) => (
              <div
                key={i.id}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--bhn-surface-2)] py-1 pl-2 pr-1 text-xs"
              >
                <span className="max-w-[120px] truncate text-[var(--bhn-text)]">{i.title}</span>
                <button
                  onClick={() => remove(i.id)}
                  aria-label="Remove from compare"
                  className="rounded-full p-0.5 text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-surface)] hover:text-[var(--bhn-error-500)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={clear} className="text-xs text-[var(--bhn-text-muted)] hover:text-[var(--bhn-error-500)]">
            Clear
          </button>
          <Link
            href="/userdashboard/compare"
            className="rounded-lg bg-[var(--bhn-brand-600)] px-4 py-1.5 text-xs font-semibold text-[var(--bhn-text-on-brand)] transition hover:bg-[var(--bhn-brand-600)]"
          >
            Compare now
          </Link>
        </div>
      </div>
    </div>
  );
}
