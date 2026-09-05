'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
} from '@/store/api/cartApi';
import { useRequireAuth } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import type { CartItem } from '@/types/cart';
import { SectionHeader, Button, Card, EmptyState, PriceDisplay, Badge } from '@bandhan/ui';
import { Spinner, Skeleton } from '@bandhan/ui';
import { Trash2, Minus, Plus } from 'lucide-react';

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatDate(value?: string) {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-IN');
}

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object' || !('data' in error)) return 'Could not update your cart. Please try again.';
  const data = (error as { data?: unknown }).data;
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }
  return 'Could not update your cart. Please try again.';
}

function itemDetails(item: CartItem) {
  const details: string[] = [];
  if (item.variantName) details.push(item.variantName);
  if (item.rentalDays) details.push(`${item.rentalDays} rental day${item.rentalDays === 1 ? '' : 's'}`);
  const date = formatDate(item.bookingDate || item.eventDate || item.date);
  if (date) details.push(date);
  const guests = item.guestCount || item.guests;
  if (guests) details.push(`${guests} guest${guests === 1 ? '' : 's'}`);
  return details;
}

export default function CartPageClient() {
  const router = useRouter();
  const { gate } = useRequireAuth();
  const { isAuthenticated, isInitialized } = useAuth();
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const {
    data: cartData,
    isLoading: cartLoading,
    isFetching: cartFetching,
    error: cartError,
    refetch,
  } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) gate();
  }, [gate, isAuthenticated, isInitialized]);

  const items = cartData?.items || [];
  const summary = cartData?.summary;

  const handleQuantity = async (item: CartItem, quantity: number) => {
    if (quantity < 1 || pendingItemId || cartFetching) return;
    setPendingItemId(item.id);
    setActionError('');
    try {
      await updateCartItem({ itemId: item.id, itemType: item.itemType, quantity }).unwrap();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setPendingItemId(null);
    }
  };

  const handleRemove = async (item: CartItem) => {
    if (pendingItemId || cartFetching) return;
    setPendingItemId(item.id);
    setActionError('');
    try {
      await removeFromCart({ itemId: item.id, itemType: item.itemType }).unwrap();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setPendingItemId(null);
    }
  };

  const handleCheckout = () => {
    gate(() => router.push('/userdashboard/checkout'));
  };

  if (!isInitialized || !isAuthenticated || cartLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-[var(--bhn-bg)] px-4 py-6">
        <Card className="mx-auto max-w-xl rounded-xl p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-[var(--bhn-text)]">We could not load your cart</h1>
          <p className="mt-2 text-sm text-red-600">{getErrorMessage(cartError)}</p>
          <Button onClick={() => refetch()} className="mt-4">Try Again</Button>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bhn-bg)] px-4 py-6">
        <div className="mx-auto max-w-5xl text-center">
          <Card className="rounded-xl p-14 shadow-sm">
            <EmptyState
              icon={<svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4"><circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" className="text-[var(--bhn-brand-300)]"/><path d="M24 14v10M19 19h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--bhn-brand-500)]"/></svg>}
              title="Your cart is looking a little light."
              description="Browse products, services, and venues and add what you need for your event."
              action={<Button onClick={() => router.push('/products/explore')}>Explore Marketplace</Button>}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bhn-bg)] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Your Selection"
          subtitle="Review your items before continuing to checkout."
        />

        {actionError && (
          <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_0.8fr]">
          <div className="space-y-4" aria-busy={cartFetching}>
            {items.map((item) => {
              const details = itemDetails(item);
              const isPending = cartFetching || pendingItemId === item.id;

              return (
                <Card
                  key={`${item.itemType}-${item.id}`}
                  className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-3 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-24 w-24 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[var(--bhn-brand-50)] text-xs text-[var(--bhn-brand-600)]">
                        No image
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-600)]">
                        {item.itemType === 'rental' ? 'Rental product' : item.itemType}
                      </p>
                      <h2 className="truncate text-lg font-semibold text-[var(--bhn-text)]">{item.title}</h2>
                      {details.length > 0 && (
                        <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">{details.join(' • ')}</p>
                      )}

                      <div className="mt-3 flex w-fit items-center gap-3 rounded-full border border-[var(--bhn-border)] bg-white px-3 py-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Decrease ${item.title} quantity`}
                          onClick={() => handleQuantity(item, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isPending}
                        >
                          <Minus size={16} />
                        </Button>
                        <span aria-label={`Quantity ${item.quantity}`} className="text-sm font-medium text-[var(--bhn-text)]">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Increase ${item.title} quantity`}
                          onClick={() => handleQuantity(item, item.quantity + 1)}
                          disabled={isPending}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <PriceDisplay current={item.price * item.quantity} currency="₹" size="lg" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item)}
                      disabled={isPending}
                      icon={<Trash2 size={14} />}
                    >
                      {isPending ? 'Updating…' : 'Remove'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div>
            <Card className="sticky top-20 rounded-2xl bg-[var(--bhn-brand-50)] p-4">
              <h2 className="mb-4 text-lg font-semibold">Summary</h2>
              <div className="space-y-3 text-sm text-[var(--bhn-text-muted)]">
                <div className="flex justify-between gap-4">
                  <span>Subtotal</span>
                  <span>{formatCurrency(summary?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Service Fee</span>
                  <span>{formatCurrency(summary?.serviceFee || 0)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Tax</span>
                  <span>{formatCurrency(summary?.tax || 0)}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-[var(--bhn-border)] pt-4 font-semibold text-[var(--bhn-text)]">
                <span>Total</span>
                <PriceDisplay current={summary?.total || 0} currency="₹" size="lg" />
              </div>
              <Button onClick={handleCheckout} disabled={cartFetching || Boolean(pendingItemId)} className="mt-4 w-full" size="lg">
                Proceed to Checkout
              </Button>
              <Button
                onClick={() => router.push('/products/explore')}
                variant="outline"
                className="mt-3 w-full"
              >
                Continue Browsing
              </Button>
              <p className="mt-3 text-center text-[10px] text-[var(--bhn-text-muted)]">
                Prices, fees, and taxes are supplied by the server.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}