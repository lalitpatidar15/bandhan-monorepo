'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';

export type CompareType = 'product' | 'service' | 'venue';

export interface CompareItem {
  id: string;
  type: CompareType;
  title: string;
  image?: string;
  priceLabel?: string;
  meta?: string;
  rating?: number;
  seller?: string;
}

const MAX_ITEMS = 4;
const STORAGE_KEY = 'bandhanCompare';

interface CompareContextType {
  items: CompareItem[];
  count: number;
  has: (id: string) => boolean;
  canAdd: (type: CompareType) => boolean;
  toggle: (item: CompareItem) => { ok: boolean; reason?: string };
  remove: (id: string) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

function isCompareItem(value: unknown): value is CompareItem {
  if (!value || typeof value !== 'object') return false;

  const item = value as Partial<CompareItem>;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    (item.type === 'product' || item.type === 'service' || item.type === 'venue')
  );
}

function readStoredItems(): CompareItem[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isCompareItem).slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const hydratedRef = useRef(false);

  useEffect(() => {
    // Read after the initial render so the server and first client render agree.
    const hydrateTimer = window.setTimeout(() => {
      setItems(readStoredItems());
      hydratedRef.current = true;
    }, 0);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setItems(readStoredItems());
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.clearTimeout(hydrateTimer);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (hydratedRef.current) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const canAdd = useCallback(
    (type: CompareType) => {
      if (items.length === 0) return true;
      return items[0].type === type && items.length < MAX_ITEMS;
    },
    [items],
  );

  const toggle = useCallback(
    (item: CompareItem): { ok: boolean; reason?: string } => {
      if (items.some((i) => i.id === item.id)) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        return { ok: true };
      }
      if (items.length >= MAX_ITEMS) {
        return { ok: false, reason: `You can compare up to ${MAX_ITEMS} items.` };
      }
      if (items.length > 0 && items[0].type !== item.type) {
        return { ok: false, reason: 'Compare only the same listing type.' };
      }
      setItems((prev) => [...prev, item]);
      return { ok: true };
    },
    [items],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider
      value={{ items, count: items.length, has, canAdd, toggle, remove, clear }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
