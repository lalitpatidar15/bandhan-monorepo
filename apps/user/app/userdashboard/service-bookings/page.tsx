'use client';

import Link from 'next/link';
import { HeartHandshake } from 'lucide-react';
import DashboardLayout from '@/components/userDashboard/Dashboardlayout';
import { useGetUserBookingsQuery } from '@/store/api/bookingApi';
import Loader from '@/components/ui/Loader';
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
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
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
        <h1 className="text-xl font-bold text-[#1C1A16]">Service Bookings</h1>
        <p className="text-sm text-gray-500">Manage your booked photography, catering and other services.</p>

        {serviceBookings.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[#E7E1D8] bg-white p-10 text-center">
            <HeartHandshake className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-gray-500">No service bookings found.</p>
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
                <Link key={booking.id || serviceId || booking._id} href={detailHref} className="surface flex items-center gap-4 p-4 transition hover:bg-[#FCF7F1]">
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-[#F3ECE4]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#1C1A16]">{booking.serviceName || 'Service Booking'}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      {new Date(booking.eventDate).toLocaleDateString()} · {booking.guestCount} guests
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                      {booking.status}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-[#1C1A16]">₹{Number(booking.totalPrice || 0).toLocaleString()}</p>
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
