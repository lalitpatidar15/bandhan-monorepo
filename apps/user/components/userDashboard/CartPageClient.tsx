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
import SectionHeading from '../ui/SectionHeading';
import Card from '../ui/Card';
import { Button } from '../ui/Button';
import Loader from '../ui/Loader';

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
        <Loader />
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-[#F8F4EF] px-4 py-6">
        <Card className="mx-auto max-w-xl rounded-xl p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-[#1C1A16]">We could not load your cart</h1>
          <p className="mt-2 text-sm text-red-700">{getErrorMessage(cartError)}</p>
          <Button onClick={() => refetch()} className="mt-4">Try Again</Button>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F4EF] px-4 py-6">
        <div className="mx-auto max-w-5xl text-center">
          <Card className="rounded-xl p-14 shadow-sm">
            <SectionHeading
              label="Empty Cart"
              title="Your cart is looking a little light."
              description="Browse products, services, and venues and add what you need for your event."
              className="mx-auto max-w-2xl"
            />
            <Button onClick={() => router.push('/products/explore')} className="mt-4">
              Explore Marketplace
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6F0] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="Your Selection"
          description="Review your items before continuing to checkout."
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
                      // API images can come from multiple seller-configured hosts.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-24 w-24 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[#F4ECE5] text-xs text-[#8B7E72]">
                        No image
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A6A4B]">
                        {item.itemType === 'rental' ? 'Rental product' : item.itemType}
                      </p>
                      <h2 className="truncate text-lg font-semibold text-[#1C1A16]">{item.title}</h2>
                      {details.length > 0 && (
                        <p className="mt-1 text-sm text-gray-500">{details.join(' • ')}</p>
                      )}

                      <div className="mt-3 flex w-fit items-center gap-3 rounded-full border px-3 py-1">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.title} quantity`}
                          onClick={() => handleQuantity(item, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isPending}
                          className="disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          −
                        </button>
                        <span aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.title} quantity`}
                          onClick={() => handleQuantity(item, item.quantity + 1)}
                          disabled={isPending}
                          className="disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-lg font-semibold text-[#C2652A]">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      disabled={isPending}
                      className="mt-4 text-xs text-gray-500 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isPending ? 'Updating…' : 'Remove'}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div>
            <Card className="sticky top-20 rounded-2xl bg-[#F6EDE6] p-4">
              <h2 className="mb-4 text-lg font-semibold">Summary</h2>
              <div className="space-y-3 text-sm text-gray-600">
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
              <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(summary?.total || 0)}</span>
              </div>
              <Button onClick={handleCheckout} disabled={cartFetching || Boolean(pendingItemId)} className="mt-4 w-full">
                Proceed to Checkout
              </Button>
              <Button
                onClick={() => router.push('/products/explore')}
                variant="outline"
                className="mt-3 w-full"
              >
                Continue Browsing
              </Button>
              <p className="mt-3 text-center text-[10px] text-gray-500">
                Prices, fees, and taxes are supplied by the server.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
