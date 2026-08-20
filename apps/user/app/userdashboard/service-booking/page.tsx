'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/userDashboard/Dashboardlayout';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRequireAuth } from '@/lib/auth';
import { useCreateBookingMutation } from '@/store/api/bookingApi';
import type { CreateBookingRequest } from '@/types/booking';

const getErrorMessage = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return 'Failed to submit booking. Please try again.';
  const payload = error as { data?: { message?: unknown }; message?: unknown };
  if (typeof payload.data?.message === 'string') return payload.data.message;
  return typeof payload.message === 'string' ? payload.message : 'Failed to submit booking. Please try again.';
};

export default function ServiceBookingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { isAuthed } = useRequireAuth();
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    eventType: 'wedding',
    eventDate: '',
    startTime: '10:00',
    endTime: '20:00',
    guestCount: '',
    requirements: '',
    contactPerson: '',
    alternateMobile: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const listingId = params?.get('serviceId') || params?.get('listingId') || '';

  const submit = async () => {
    setErrorMessage(null);

    if (!listingId) {
      setErrorMessage('No service selected.');
      return;
    }

    if (!form.eventDate) {
      setErrorMessage('Please select an event date.');
      return;
    }

    try {
      const payload: CreateBookingRequest & { contactPerson: string; alternateMobile: string } = {
        listingType: 'service',
        listingId,
        eventDate: form.eventDate,
        eventType: form.eventType,
        startTime: form.startTime,
        endTime: form.endTime,
        guestCount: Number(form.guestCount || 0),
        requirements: form.requirements,
        contactPerson: form.contactPerson,
        alternateMobile: form.alternateMobile,
      };

      await createBooking(payload).unwrap();
      router.push('/userdashboard/service-bookings?booked=1');
    } catch (error: unknown) {
      console.error('Failed to create service booking', error);
      setErrorMessage(getErrorMessage(error));
    }
  };

  if (!isAuthed) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl px-4 py-10 text-center">
          <p className="text-gray-500">Please log in to book a service.</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.push(`/login?next=/userdashboard/service-booking`)}
          >
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
          <p className="text-gray-500">No service selected. Please choose a service before booking.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-xl font-bold text-[#1C1A16]">Book Service</h1>
        <p className="text-sm text-gray-500">Complete the details to confirm your booking.</p>

        {errorMessage && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {errorMessage}
          </div>
        )}

        <div className="surface mt-4 space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-gray-500">Event type</span>
              <select
                value={form.eventType}
                onChange={(e) => set('eventType', e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                {['wedding', 'corporate', 'birthday', 'other'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Event date"
              type="date"
              value={form.eventDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('eventDate', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start time"
              type="time"
              value={form.startTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('startTime', e.target.value)}
            />
            <Input
              label="End time"
              type="time"
              value={form.endTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('endTime', e.target.value)}
            />
          </div>
          <Input
            label="Guest count"
            type="number"
            value={form.guestCount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('guestCount', e.target.value)}
          />
          <Input
            label="Contact person"
            value={form.contactPerson}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('contactPerson', e.target.value)}
          />
          <Input
            label="Alternate mobile"
            value={form.alternateMobile}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('alternateMobile', e.target.value)}
          />
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Requirements</label>
            <textarea
              rows={3}
              value={form.requirements}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('requirements', e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#924C2B] focus:outline-none"
            />
          </div>
          <Button variant="primary" fullWidth onClick={submit} disabled={isLoading}>
            {isLoading ? 'Booking...' : 'Review & Pay'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
