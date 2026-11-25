'use client';

import Link from 'next/link';
import { HeartHandshake } from 'lucide-react';
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
  service?: { _id?: string; id?: string };
};

const referenceId = (reference?: BookingReference) =>
  typeof reference === 'string' ? reference : reference?._id || reference?.id || '';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  confirmed: 'bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]',
  completed: 'bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]',
  cancelled: 'bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]',
};

export default function ServiceBookingsPage() {
  const { data, isLoading } = useGetUserBookingsQuery();
  const bookings = (data?.bookings || []) as BookingView[];
  const serviceBookings = bookings.filter((booking) => booking.bookingType === 'service' || Boolean(booking.serviceId));

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-xl font-bold text-[var(--bhn-text)]">Service Bookings</h1>
        <p className="text-sm text-[var(--bhn-text-muted)]">Manage your booked photography, catering and other services.</p>

        {serviceBookings.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-10 text-center">
            <HeartHandshake className="mx-auto h-10 w-10 text-[var(--bhn-text-soft)]" />
            <p className="mt-3 text-[var(--bhn-text-muted)]">No service bookings found.</p>
            <Link href="/services" className="btn-brand mt-4 inline-flex">
              Explore services
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {serviceBookings.map((booking) => {
              const serviceId = referenceId(booking.serviceId) || booking.service?.id || booking.service?._id || '';
              const detailHref = serviceId ? `/products/Services/${serviceId}` : '/userdashboard/service-bookings';

              return (
                <div key={booking.id || serviceId || booking._id} className="surface flex flex-wrap items-center gap-4 p-4">
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-[var(--bhn-surface-2)]" />
                  <div className="min-w-0 flex-1">
                    <Link href={detailHref} className="truncate font-semibold text-[var(--bhn-text)] hover:underline">{booking.serviceName || 'Service Booking'}</Link>
                    <p className="flex items-center gap-1 text-xs text-[var(--bhn-text-muted)]">
                      {new Date(booking.eventDate).toLocaleDateString()} · {booking.guestCount} guests
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[booking.status] || 'bg-[var(--bhn-surface-3)] text-[var(--bhn-text)]'}`}>
                      {booking.status}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-[var(--bhn-text)]">₹{Number(booking.totalPrice || 0).toLocaleString()}</p>
                  </div>
                  {booking.status !== 'cancelled' && booking.paymentStatus !== 'paid' && booking.id && (
                    <BookingPayButton bookingId={booking.id} amount={Number(booking.totalPrice || 0)} />
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
