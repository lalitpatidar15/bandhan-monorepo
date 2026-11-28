'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { AlertCircle, CalendarDays, CheckCircle2, Clock, MapPin, Package, RotateCcw } from 'lucide-react';
import { Button, EmptyState } from '@bandhan/ui';
import DashboardLayout from '@/components/userDashboard/Dashboardlayout';
import {
  useGetUserRentalOrdersQuery,
  useConfirmRentalDeliveryMutation,
  useInitiateRentalReturnMutation,
  useCompleteRentalOrderMutation,
  type RentalOrder,
} from '@/store/api/rentalOrderApi';

const statusColors: Record<string, string> = {
  pending_deposit: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  deposit_paid: 'bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]',
  reserved: 'bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]',
  confirmed: 'bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]',
  shipped: 'bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]',
  delivered: 'bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]',
  active: 'bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]',
  in_use: 'bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]',
  return_initiated: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  return_shipped: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  return_received: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  returned: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  inspection: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  completed: 'bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]',
  cancelled: 'bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]',
  overdue: 'bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]',
};

type RentalAction = 'confirm' | 'return' | 'complete';

const successMessages: Record<RentalAction, string> = {
  confirm: 'Delivery confirmed.',
  return: 'Return initiated.',
  complete: 'Rental completed.',
};

function getApiMessage(error: unknown, fallback: string) {
  const apiError = error as { data?: { message?: string } | string; error?: string };
  const dataMessage = typeof apiError?.data === 'string' ? apiError.data : apiError?.data?.message;
  return dataMessage || apiError?.error || fallback;
}

export default function RentalsPage() {
  const { data: response, isLoading, isError, refetch } = useGetUserRentalOrdersQuery();
  const [confirmDelivery, { isLoading: isConfirming }] = useConfirmRentalDeliveryMutation();
  const [initiateReturn, { isLoading: isInitiating }] = useInitiateRentalReturnMutation();
  const [completeRental, { isLoading: isCompleting }] = useCompleteRentalOrderMutation();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const rentals = response?.data || [];

  const runAction = async (rental: RentalOrder, action: RentalAction) => {
    const rentalId = rental.rentalId || rental._id;
    if (!rentalId || busyKey) return;

    const key = `${rentalId}:${action}`;
    setBusyKey(key);

    try {
      if (action === 'confirm') await confirmDelivery({ rentalId }).unwrap();
      if (action === 'return') await initiateReturn({ rentalId }).unwrap();
      if (action === 'complete') await completeRental({ rentalId }).unwrap();

      toast.success(successMessages[action]);
      await refetch();
    } catch (err: unknown) {
      toast.error(getApiMessage(err, 'Could not update this rental. Please try again.'));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-xl font-bold text-[var(--bhn-text)]">My Rentals</h1>
        <p className="text-sm text-[var(--bhn-text-muted)]">Track active and past rental orders.</p>

        {isLoading ? (
          <div className="mt-8 flex justify-center py-10">
            <span className="bhn-skeleton h-24 w-full max-w-2xl" aria-label="Loading rentals" />
          </div>
        ) : isError ? (
          <div className="mt-8">
            <EmptyState
              icon={<AlertCircle className="text-[var(--bhn-error-600)]" size={34} />}
              title="Rentals unavailable"
              description="We could not load your rental orders. Please try again."
              action={<Button onClick={() => void refetch()}>Try again</Button>}
            />
          </div>
        ) : rentals.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-10 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-[var(--bhn-text-soft)]" />
            <p className="mt-3 text-[var(--bhn-text-muted)]">You have no active rentals yet.</p>
            <Link href="/products/explore?mode=rentals" className="btn-brand mt-4 inline-flex">
              Browse rental products
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {rentals.map((rental) => {
              const canConfirm = ['shipped', 'return_shipped'].includes(rental.rentalStatus);
              const canReturn = rental.rentalStatus === 'in_use';
              const canComplete = rental.rentalStatus === 'inspection';
              const hasActions = Boolean(rental.rentalId || rental._id) && (canConfirm || canReturn || canComplete);
              const actionBusy = busyKey !== null;

              return (
                <div key={rental._id || rental.rentalId} className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 min-w-0 flex-1">
                      {rental.productImage ? (
                        <Image src={rental.productImage} alt={rental.productTitle} width={64} height={64} unoptimized className="h-16 w-16 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-[var(--bhn-surface-3)] flex items-center justify-center shrink-0">
                          <Package className="text-[var(--bhn-text-muted)]" size={20} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-[var(--bhn-text)] truncate">{rental.productTitle}</h3>
                        {rental.variantName && <p className="text-xs text-[var(--bhn-text-muted)]">{rental.variantName}</p>}
                        <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-[var(--bhn-text-muted)]">
                          <span className="flex items-center gap-1"><Clock size={10} /> {rental.rentalDurationDays} days</span>
                          <span>₹{rental.dailyRate}/day</span>
                          {rental.shippingAddress?.city && (
                            <span className="flex items-center gap-1"><MapPin size={10} /> {rental.shippingAddress.city}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[rental.rentalStatus] || 'bg-[var(--bhn-surface-3)] text-[var(--bhn-text)]'}`}>
                        {rental.rentalStatus?.replace(/_/g, ' ')}
                      </span>
                      <p className="text-sm font-bold text-[var(--bhn-text)] mt-1">₹{rental.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-[var(--bhn-border)] text-[10px] text-[var(--bhn-text-muted)]">
                    <span>Start: {rental.rentalStart ? new Date(rental.rentalStart).toLocaleDateString() : '—'}</span>
                    <span>End: {rental.rentalEnd ? new Date(rental.rentalEnd).toLocaleDateString() : '—'}</span>
                    <span>Deposit: ₹{rental.securityDeposit?.toLocaleString()}</span>
                    {rental.trackingNumber && <span>Tracking: {rental.trackingNumber}</span>}
                  </div>

                  {hasActions && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--bhn-border)] pt-3">
                      {canConfirm && (
                        <Button
                          type="button"
                          size="sm"
                          loading={busyKey === `${rental.rentalId || rental._id}:confirm`}
                          disabled={actionBusy || isConfirming}
                          onClick={() => void runAction(rental, 'confirm')}
                        >
                          <CheckCircle2 size={14} />
                          Confirm delivery
                        </Button>
                      )}
                      {canReturn && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          loading={busyKey === `${rental.rentalId || rental._id}:return`}
                          disabled={actionBusy || isInitiating}
                          onClick={() => void runAction(rental, 'return')}
                        >
                          <RotateCcw size={14} />
                          Initiate return
                        </Button>
                      )}
                      {canComplete && (
                        <Button
                          type="button"
                          size="sm"
                          variant="soft"
                          loading={busyKey === `${rental.rentalId || rental._id}:complete`}
                          disabled={actionBusy || isCompleting}
                          onClick={() => void runAction(rental, 'complete')}
                        >
                          <CheckCircle2 size={14} />
                          Complete rental
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
