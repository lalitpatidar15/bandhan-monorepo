'use client';

import Link from 'next/link';
import { Wallet, MapPin } from 'lucide-react';
import DashboardLayout from '@/components/userDashboard/Dashboardlayout';
import { useGetUserBookingsQuery } from '@/store/api/bookingApi';
import Loader from '@/components/ui/Loader';
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
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
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
        <h1 className="text-xl font-bold text-[#1C1A16]">Venue Bookings</h1>
        <p className="text-sm text-gray-500">Track your venue reservations and advances.</p>

        {bookings.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[#E7E1D8] bg-white p-10 text-center">
            <Wallet className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-gray-500">No venue bookings yet.</p>
            <Link href="/venues" className="btn-brand mt-4 inline-flex">
              Find a venue
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {bookings.map((b) => {
              const venueId = referenceId(b.venueId) || b.venue?.id || b.venue?._id || '';
              const detailHref = venueId ? `/products/Venue/${venueId}` : '/userdashboard/venue-bookings';

              return (
                <Link key={b.id || venueId || b._id} href={detailHref} className="surface flex items-center gap-4 p-4 transition hover:bg-[#FCF7F1]">
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-[#F3ECE4]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#1C1A16]">
                      {b.venueName || 'Venue Booking'}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {new Date(b.eventDate).toLocaleDateString()} · {b.guestCount} guests
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {b.status}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-[#1C1A16]">
                      ₹{Number(b.totalPrice || 0).toLocaleString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
