'use client';

import Link from 'next/link';
import { Wallet, MapPin } from 'lucide-react';
import DashboardLayout from '@/components/userDashboard/Dashboardlayout';
import { useGetUserBookingsQuery } from '@/store/api/bookingApi';
import Loader from '@/components/ui/Loader';
import BookingPayButton from '@/components/BookingPayButton';
import type { Booking } from '@/types/booking';

type BookingReference = string | { _id?: string; id?: string };
type BookingView = Omit<Booking, 'serviceId' | 'venueId'> & {
  _id?: string;
  serviceId?: BookingReference;
  venueId?: BookingReference;
  venue?: { _id?: string; id?: string };
};

const referenceId = (reference?: BookingReference) =>
  typeof reference === 'string' ? reference : reference?._id || reference?.id || '';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  confirmed: 'bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]',
  completed: 'bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]',
  cancelled: 'bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]',
};

export default function VenueBookingsPage() {
  const { data, isLoading } = useGetUserBookingsQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader />
        </div>
      </DashboardLayout>
    );
  }

  const allBookings = (data?.bookings || []) as BookingView[];
  const bookings = allBookings.filter((booking) => booking.bookingType === 'venue' || Boolean(booking.venueId));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-xl font-bold text-[var(--bhn-text)]">Venue Bookings</h1>
        <p className="text-sm text-[var(--bhn-text-muted)]">Track your venue reservations and advances.</p>

        {bookings.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-10 text-center">
            <Wallet className="mx-auto h-10 w-10 text-[var(--bhn-text-soft)]" />
            <p className="mt-3 text-[var(--bhn-text-muted)]">No venue bookings yet.</p>
            <Link href="/venues" className="btn-brand mt-4 inline-flex">
              Find a venue
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {bookings.map((b) => {
              const venueId = referenceId(b.venueId) || b.venue?.id || b.venue?._id || '';
              const detailHref = venueId ? `/products/Venue/${venueId}` : '/venue-bookings';

              return (
                <div key={b.id || venueId || b._id} className="surface flex flex-wrap items-center gap-4 p-4">
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-[var(--bhn-surface-2)]" />
                  <div className="min-w-0 flex-1">
                    <Link href={detailHref} className="truncate font-semibold text-[var(--bhn-text)] hover:underline">
                      {b.venueName || 'Venue Booking'}
                    </Link>
                    <p className="flex items-center gap-1 text-xs text-[var(--bhn-text-muted)]">
                      <MapPin className="h-3.5 w-3.5" />
                      {new Date(b.eventDate).toLocaleDateString()} · {b.guestCount} guests
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        STATUS_STYLES[b.status] || 'bg-[var(--bhn-surface-3)] text-[var(--bhn-text)]'
                      }`}
                    >
                      {b.status}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-[var(--bhn-text)]">
                      ₹{Number(b.totalPrice || 0).toLocaleString()}
                    </p>
                  </div>
                  {b.status !== 'cancelled' && b.paymentStatus !== 'paid' && b.id && (
                    <BookingPayButton bookingId={b.id} amount={Number(b.totalPrice || 0)} />
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
