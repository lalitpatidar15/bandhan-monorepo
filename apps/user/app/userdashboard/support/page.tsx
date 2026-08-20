'use client';

import { useState } from 'react';
import { LifeBuoy, Send } from 'lucide-react';
import DashboardLayout from '@/components/userDashboard/Dashboardlayout';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  useGetTicketsQuery,
  useCreateTicketMutation,
} from '@/store/api/customerApi';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function SupportPage() {
  const { data, isLoading } = useGetTicketsQuery();
  const [createTicket, { isLoading: saving }] = useCreateTicketMutation();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const tickets: Ticket[] = (data?.tickets || []).map((t) => ({
    id: t._id,
    subject: t.subject,
    message: t.message,
    status: t.status,
    createdAt: t.createdAt,
  }));

  const raise = async () => {
    if (!subject.trim() || !description.trim()) return;
    try {
      await createTicket({ subject, message: description }).unwrap();
      setSubject('');
      setDescription('');
    } catch {
      /* ignore */
    }
  };

  const STATUS: Record<string, string> = {
    open: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    waiting_user: 'bg-purple-100 text-purple-700',
    closed: 'bg-gray-100 text-gray-600',
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-xl font-bold text-[#1C1A16]">Support Centre</h1>
        <p className="text-sm text-gray-500">Search FAQs or raise a ticket with our team.</p>

        <div className="surface mt-4 space-y-3 p-4">
          <h3 className="font-semibold text-[#1C1A16]">Raise a ticket</h3>
          <Input label="Subject" value={subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)} />
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#924C2B] focus:outline-none"
            />
          </div>
          <Button variant="primary" loading={saving} onClick={raise} icon={<Send className="h-4 w-4" />}>
            Submit ticket
          </Button>
        </div>

        <h3 className="mt-6 font-semibold text-[#1C1A16]">Your tickets</h3>
        {isLoading ? (
          <p className="mt-3 text-gray-500">Loading…</p>
        ) : tickets.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-[#E7E1D8] bg-white p-8 text-center">
            <LifeBuoy className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No tickets raised yet.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="surface p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#1C1A16]">{t.subject}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS[t.status] || 'bg-gray-100'}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-1 text-sm text-gray-600">{t.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
