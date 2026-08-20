'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  useAddToCartMutation,
  useClearCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
} from '@/store/api/cartApi';
import type { AddToCartRequest, CartItem as ApiCartItem, CartSummary } from '@/types/cart';

const GUEST_CART_KEY = 'bandhanGuestCart';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  img: string;
  quantity: number;
  date: string;
  guests: number;
  location?: string;
  itemType: 'service' | 'product' | 'venue' | 'rental';
  productId?: string;
  serviceId?: string;
  venueId?: string;
  eventDate?: string;
  packageType?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  guestCount?: number;
  variantName?: string;
  rentalStart?: string;
  rentalEnd?: string;
  rentalDays?: number;
  rentalDurationDays?: number;
  dailyRate?: number;
  securityDeposit?: number;
  sellerId?: string;
  sellerName?: string;
  shippingCost?: number;
  freeShipping?: boolean;
  inStock?: boolean;
  maxQty?: number;
}

type NewCartItem = Omit<CartItem, 'id' | 'quantity'> & { quantity?: number };

interface CartTotals {
  subtotal: number;
  itemsDiscount: number;
  shippingTotal: number;
  taxTotal: number;
  couponDiscount: number;
  securityDepositTotal: number;
  grandTotal: number;
  totalItems: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: NewCartItem) => Promise<boolean>;
  removeFromCart: (id: string) => Promise<boolean>;
  updateQuantity: (id: string, quantity: number) => Promise<boolean>;
  increaseQty: (id: string) => Promise<boolean>;
  decreaseQty: (id: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  getTotalItems: () => number;
  totals: CartTotals;
  getSaleItems: () => CartItem[];
  getRentalItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function toContextItem(item: ApiCartItem): CartItem {
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    img: item.img || item.image,
    quantity: item.quantity,
    date: item.date || item.eventDate || item.bookingDate || '',
    guests: item.guests || item.guestCount || 0,
    location: item.location,
    itemType: item.itemType,
    productId: item.productId,
    serviceId: item.serviceId,
    venueId: item.venueId,
    eventDate: item.eventDate,
    packageType: item.packageType,
    bookingDate: item.bookingDate,
    startTime: item.startTime,
    endTime: item.endTime,
    guestCount: item.guestCount,
    variantName: item.variantName,
    rentalDays: item.rentalDays,
  };
}

function readGuestItem(value: unknown): CartItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<CartItem>;
  if (typeof item.id !== 'string' || typeof item.title !== 'string') return null;
  if (!['service', 'product', 'venue', 'rental'].includes(String(item.itemType))) return null;

  return {
    ...item,
    id: item.id,
    title: item.title,
    price: Number(item.price) || 0,
    img: typeof item.img === 'string' ? item.img : '',
    quantity: Math.max(1, Number(item.quantity) || 1),
    date: typeof item.date === 'string' ? item.date : '',
    guests: Number(item.guests) || 0,
    itemType: item.itemType as CartItem['itemType'],
  };
}

function getItemIdentity(item: Pick<CartItem, 'itemType' | 'productId' | 'serviceId' | 'venueId'>) {
  if (item.itemType === 'venue' && item.venueId) return item.venueId;
  if (item.itemType === 'service' && item.serviceId) return item.serviceId;
  if ((item.itemType === 'product' || item.itemType === 'rental') && item.productId) return item.productId;
  return null;
}

function requestedQuantity(item: NewCartItem | CartItem) {
  if (item.quantity) return item.quantity;
  if ((item.itemType === 'product' || item.itemType === 'rental') && item.guests > 0) return item.guests;
  return 1;
}

function toAddRequest(item: NewCartItem | CartItem): AddToCartRequest | null {
  const itemId = getItemIdentity(item);
  if (!itemId) return null;

  return {
    itemId,
    itemType: item.itemType,
    quantity: requestedQuantity(item),
    eventDate: item.eventDate || (item.itemType === 'service' ? item.date : undefined),
    guests: item.guests,
    packageType: item.packageType,
    variantName: item.variantName,
    rentalDays: item.rentalDays || item.rentalDurationDays,
    bookingDate: item.bookingDate || (item.itemType === 'venue' ? item.date : undefined),
    startTime: item.startTime,
    endTime: item.endTime,
    guestCount: item.guestCount || (item.itemType === 'venue' ? item.guests : undefined),
  };
}

function guestSummary(items: CartItem[]): CartSummary {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { subtotal, serviceFee: 0, tax: 0, total: subtotal };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, user, isInitialized } = useAppSelector((state) => state.auth);
  const isAuthenticated = Boolean(token && user);
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);
  const [isGuestHydrated, setIsGuestHydrated] = useState(false);
  const migrationInFlight = useRef(false);

  const { data: serverCart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [addServerItem] = useAddToCartMutation();
  const [updateServerItem] = useUpdateCartItemMutation();
  const [removeServerItem] = useRemoveFromCartMutation();
  const [clearServerCart] = useClearCartMutation();

  useEffect(() => {
    let cancelled = false;
    const hydrateTimer = window.setTimeout(() => {
      try {
        const savedCart = localStorage.getItem(GUEST_CART_KEY);
        const parsed: unknown = savedCart ? JSON.parse(savedCart) : [];
        if (!cancelled && Array.isArray(parsed)) {
          setGuestItems(parsed.map(readGuestItem).filter((item): item is CartItem => item !== null));
        }
      } catch {
        localStorage.removeItem(GUEST_CART_KEY);
      } finally {
        if (!cancelled) setIsGuestHydrated(true);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(hydrateTimer);
    };
  }, []);

  useEffect(() => {
    if (!isGuestHydrated) return;
    if (guestItems.length > 0) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems));
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  }, [guestItems, isGuestHydrated]);

  // Move valid guest selections into the account once, then remove only the
  // successfully synced entries. Authenticated rendering never reads them.
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !isGuestHydrated || migrationInFlight.current) return;

    const candidates = guestItems
      .map((item) => ({ item, request: toAddRequest(item) }))
      .filter((entry): entry is { item: CartItem; request: AddToCartRequest } => entry.request !== null);
    if (candidates.length === 0) return;

    migrationInFlight.current = true;
    void Promise.allSettled(candidates.map(({ request }) => addServerItem(request).unwrap()))
      .then((results) => {
        const syncedIds = new Set(
          results.flatMap((result, index) => (result.status === 'fulfilled' ? [candidates[index].item.id] : [])),
        );
        if (syncedIds.size > 0) {
          setGuestItems((current) => current.filter((item) => !syncedIds.has(item.id)));
        }
      })
      .finally(() => {
        migrationInFlight.current = false;
      });
  }, [addServerItem, guestItems, isAuthenticated, isGuestHydrated, isInitialized]);

  const cartItems = useMemo(
    () => (isAuthenticated ? (serverCart?.items || []).map(toContextItem) : guestItems),
    [guestItems, isAuthenticated, serverCart?.items],
  );

  const addToCart = useCallback(async (item: NewCartItem) => {
    if (isAuthenticated) {
      const request = toAddRequest(item);
      if (!request) return false;
      try {
        await addServerItem(request).unwrap();
        return true;
      } catch {
        return false;
      }
    }

    setGuestItems((current) => {
      const identity = getItemIdentity(item);
      const existing = current.find((entry) =>
        identity
          ? entry.itemType === item.itemType && getItemIdentity(entry) === identity
          : entry.title === item.title && entry.date === item.date && entry.itemType === item.itemType,
      );
      if (existing) {
        const nextQuantity = existing.quantity + requestedQuantity(item);
        const cappedQuantity = existing.maxQty ? Math.min(nextQuantity, existing.maxQty) : nextQuantity;
        return current.map((entry) => entry.id === existing.id ? { ...entry, quantity: cappedQuantity } : entry);
      }

      return [
        ...current,
        {
          ...item,
          id: `guest-${item.itemType}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          quantity: requestedQuantity(item),
        },
      ];
    });
    return true;
  }, [addServerItem, isAuthenticated]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity < 1) return false;
    const item = cartItems.find((entry) => entry.id === id);
    if (!item) return false;

    if (isAuthenticated) {
      const itemId = getItemIdentity(item);
      if (!itemId) return false;
      try {
        await updateServerItem({ itemId, itemType: item.itemType, quantity }).unwrap();
        return true;
      } catch {
        return false;
      }
    }

    setGuestItems((current) => current.map((entry) => {
      if (entry.id !== id) return entry;
      const max = entry.maxQty || 99;
      return { ...entry, quantity: Math.min(quantity, max) };
    }));
    return true;
  }, [cartItems, isAuthenticated, updateServerItem]);

  const removeFromCart = useCallback(async (id: string) => {
    const item = cartItems.find((entry) => entry.id === id);
    if (!item) return false;

    if (isAuthenticated) {
      const itemId = getItemIdentity(item);
      if (!itemId) return false;
      try {
        await removeServerItem({ itemId, itemType: item.itemType }).unwrap();
        return true;
      } catch {
        return false;
      }
    }

    setGuestItems((current) => current.filter((entry) => entry.id !== id));
    return true;
  }, [cartItems, isAuthenticated, removeServerItem]);

  const increaseQty = useCallback(async (id: string) => {
    const item = cartItems.find((entry) => entry.id === id);
    if (!item || (item.maxQty && item.quantity >= item.maxQty)) return false;
    return updateQuantity(id, item.quantity + 1);
  }, [cartItems, updateQuantity]);

  const decreaseQty = useCallback(async (id: string) => {
    const item = cartItems.find((entry) => entry.id === id);
    if (!item || item.quantity <= 1) return false;
    return updateQuantity(id, item.quantity - 1);
  }, [cartItems, updateQuantity]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await clearServerCart().unwrap();
        return true;
      } catch {
        return false;
      }
    }
    setGuestItems([]);
    return true;
  }, [clearServerCart, isAuthenticated]);

  const totals = useMemo<CartTotals>(() => {
    const summary = isAuthenticated
      ? serverCart?.summary || { subtotal: 0, serviceFee: 0, tax: 0, total: 0 }
      : guestSummary(guestItems);
    return {
      subtotal: summary.subtotal,
      itemsDiscount: 0,
      shippingTotal: 0,
      taxTotal: summary.tax,
      couponDiscount: 0,
      securityDepositTotal: 0,
      grandTotal: summary.total,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cartItems, guestItems, isAuthenticated, serverCart?.summary]);

  const getTotalItems = useCallback(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const getSaleItems = useCallback(
    () => cartItems.filter((item) => item.itemType === 'product' || item.itemType === 'service'),
    [cartItems],
  );
  const getRentalItems = useCallback(
    () => cartItems.filter((item) => item.itemType === 'rental'),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQty,
        decreaseQty,
        clearCart,
        getTotalItems,
        totals,
        getSaleItems,
        getRentalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
