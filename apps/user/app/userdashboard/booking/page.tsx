'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/userDashboard/Dashboardlayout';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRequireAuth } from '@/lib/auth';
import { useCreateBookingMutation } from '@/store/api/bookingApi';

export default function BookingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { isAuthed } = useRequireAuth();
  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const [form, setForm] = useState({
    eventType: 'wedding',
    eventDate: '',
    startTime: '18:00',
    endTime: '23:59',
    guestCount: '',
    packageId: '',
    decorationPackageId: '',
    roomsRequired: '',
    requirements: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const listingType = params.get('listingType') || 'venue';
  const listingId = params.get('listingId') || '';

  const submit = async () => {
    if (!listingId || !form.eventDate) {
      return;
    }

    try {
      await createBooking({
        listingType: listingType === 'service' ? 'service' : 'venue',
        listingId,
        eventDate: form.eventDate,
        eventType: form.eventType,
        startTime: form.startTime,
        endTime: form.endTime,
        guestCount: Number(form.guestCount || 0),
        packageId: form.packageId,
        requirements: form.requirements,
        roomsRequired: form.roomsRequired,
      }).unwrap();

      router.push(listingType === 'service' ? '/userdashboard/service-bookings?booked=1' : '/userdashboard/venue-bookings?booked=1');
    } catch (error) {
      console.error('Failed to create booking', error);
    }
  };

  if (!isAuthed) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl px-4 py-10 text-center">
          <p className="text-gray-500">Please log in to book a {listingType === 'service' ? 'service' : 'venue'}.</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push(`/login?next=/userdashboard/booking?listingType=${listingType}&listingId=${listingId}`)}>
            Login
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!listingId) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl px-4 py-10 text-center">
          <p className="text-gray-500">No booking target selected. Please choose a venue or service before booking.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-xl font-bold text-[#1C1A16]">{listingType === 'service' ? 'Book Service' : 'Book Venue'}</h1>
        <p className="text-sm text-gray-500">{listingType === 'service' ? 'Complete the details to confirm your service booking.' : 'Select date, space and preferences to reserve.'}</p>

        <div className="surface mt-4 space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-gray-500">Event type</span>
              <select value={form.eventType} onChange={(e) => set('eventType', e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                {['wedding', 'corporate', 'reception', 'other'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <Input label="Event date" type="date" value={form.eventDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('eventDate', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start time" type="time" value={form.startTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('startTime', e.target.value)} />
            <Input label="End time" type="time" value={form.endTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('endTime', e.target.value)} />
          </div>
          <Input label="Guest count" value={form.guestCount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('guestCount', e.target.value)} />
          {listingType === 'venue' ? (
            <Input label="Rooms required" value={form.roomsRequired} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('roomsRequired', e.target.value)} />
          ) : null}
          <Input label="Package ID (optional)" value={form.packageId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('packageId', e.target.value)} />
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Requirements</label>
            <textarea rows={3} value={form.requirements} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('requirements', e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#924C2B] focus:outline-none" />
          </div>
          <Button variant="primary" fullWidth disabled={isLoading} onClick={submit}>
            {isLoading ? 'Booking...' : 'Review & Pay'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
