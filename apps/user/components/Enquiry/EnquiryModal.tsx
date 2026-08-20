'use client';

import { useState, type ChangeEvent } from 'react';
import { X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRequireAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCreateEnquiryMutation } from '@/store/api/customerApi';

export interface EnquiryTarget {
  listingType: 'general' | 'product' | 'service' | 'venue';
  listingId: string;
  title: string;
}

export default function EnquiryModal({
  target,
  onClose,
}: {
  target: EnquiryTarget;
  onClose: () => void;
}) {
  const { gate } = useRequireAuth();
  const [createEnquiry, { isLoading }] = useCreateEnquiryMutation();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    requiredDate: '',
    budget: '',
    guestCount: '',
    message: '',
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    if (!form.message.trim()) {
      toast.error('Please tell us what you need.');
      return;
    }
    // Login required (spec Section 1)
    const allowed = gate(async () => {
      try {
        await createEnquiry({
          name: form.name,
          email: form.email,
          phone: form.mobile,
          entityType: target.listingType,
          entityId: target.listingId,
          title: target.title,
          requiredDate: form.requiredDate || undefined,
          budget: form.budget ? Number(form.budget) : undefined,
          guestCount: form.guestCount ? Number(form.guestCount) : undefined,
          message: form.message.trim(),
        }).unwrap();
        setSent(true);
      } catch (error) {
        const message = error && typeof error === 'object' && 'data' in error
          && error.data && typeof error.data === 'object' && 'message' in error.data
          ? String(error.data.message)
          : 'Could not send your enquiry. Please try again.';
        toast.error(message);
      }
    });
    if (!allowed) {
      // gate() redirected to login; close modal so user returns after auth
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1C1A16]">Send Enquiry</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Send className="h-6 w-6" />
            </div>
            <p className="font-semibold text-[#1C1A16]">Enquiry sent!</p>
            <p className="mt-1 text-sm text-gray-500">
              Your enquiry is saved and visible in your dashboard.
            </p>
            <Button variant="primary" fullWidth className="mt-4" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              About: <span className="font-medium text-[#924C2B]">{target.title}</span>
            </p>
            <Input label="Name" value={form.name} onChange={(event: ChangeEvent<HTMLInputElement>) => update('name', event.target.value)} />
            <Input label="Mobile" value={form.mobile} onChange={(event: ChangeEvent<HTMLInputElement>) => update('mobile', event.target.value)} />
            <Input label="Email" value={form.email} onChange={(event: ChangeEvent<HTMLInputElement>) => update('email', event.target.value)} />
            <Input label="Required date" type="date" value={form.requiredDate} onChange={(event: ChangeEvent<HTMLInputElement>) => update('requiredDate', event.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Budget (₹)" type="number" min="0" value={form.budget} onChange={(event: ChangeEvent<HTMLInputElement>) => update('budget', event.target.value)} />
              <Input label="Guest count" type="number" min="0" value={form.guestCount} onChange={(event: ChangeEvent<HTMLInputElement>) => update('guestCount', event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Message</label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => update('message', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#924C2B] focus:outline-none"
                placeholder="Tell us what you need…"
              />
            </div>
            <Button variant="primary" fullWidth loading={isLoading} onClick={submit} icon={<Send className="h-4 w-4" />}>
              Submit Enquiry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
