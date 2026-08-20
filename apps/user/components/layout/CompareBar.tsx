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
        <div className="flex items-center gap-3 rounded-t-xl border border-[#E7E1D8] bg-white/95 px-3 py-2 shadow-md backdrop-blur">
          <span className="hidden text-xs font-medium text-gray-500 sm:block">
            Compare ({count}/4)
          </span>
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {items.map((i) => (
              <div
                key={i.id}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#FAF5EE] py-1 pl-2 pr-1 text-xs"
              >
                <span className="max-w-[120px] truncate text-[#1C1A16]">{i.title}</span>
                <button
                  onClick={() => remove(i.id)}
                  aria-label="Remove from compare"
                  className="rounded-full p-0.5 text-gray-400 hover:bg-white hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={clear} className="text-xs text-gray-400 hover:text-red-500">
            Clear
          </button>
          <Link
            href="/userdashboard/compare"
            className="rounded-lg bg-[#924C2B] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#7a3d23]"
          >
            Compare now
          </Link>
        </div>
      </div>
    </div>
  );
}
