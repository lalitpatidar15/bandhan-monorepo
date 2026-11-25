'use client';

import Link from 'next/link';
import { CalendarDays, Package, Loader, MapPin, Clock } from 'lucide-react';
import DashboardLayout from '@/components/userDashboard/Dashboardlayout';
import { useGetUserRentalOrdersQuery } from '@/store/api/rentalOrderApi';
import Image from 'next/image';

const statusColors: Record<string, string> = {
  pending_deposit: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  deposit_paid: 'bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]',
  confirmed: 'bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]',
  shipped: 'bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]',
  delivered: 'bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]',
  active: 'bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]',
  return_initiated: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  return_shipped: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  return_received: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  completed: 'bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]',
  cancelled: 'bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]',
  overdue: 'bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]',
};

export default function RentalsPage() {
  const { data: response, isLoading } = useGetUserRentalOrdersQuery();
  const rentals = response?.data || [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-xl font-bold text-[var(--bhn-text)]">My Rentals</h1>
        <p className="text-sm text-[var(--bhn-text-muted)]">Track active and past rental orders.</p>

        {isLoading ? (
          <div className="mt-8 flex justify-center py-10">
            <Loader className="animate-spin text-[var(--bhn-text)]" size={24} />
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
            {rentals.map((rental) => (
              <div key={rental._id} className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4 shadow-sm">
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

                <div className="flex gap-4 mt-3 pt-3 border-t border-[var(--bhn-border)] text-[10px] text-[var(--bhn-text-muted)]">
                  <span>Start: {rental.rentalStart ? new Date(rental.rentalStart).toLocaleDateString() : '—'}</span>
                  <span>End: {rental.rentalEnd ? new Date(rental.rentalEnd).toLocaleDateString() : '—'}</span>
                  <span>Deposit: ₹{rental.securityDeposit?.toLocaleString()}</span>
                  {rental.trackingNumber && <span>Tracking: {rental.trackingNumber}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
