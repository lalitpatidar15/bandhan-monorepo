'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Eye } from 'lucide-react';
import { Badge, Button, Modal, PageHeader, SearchInput, Select, statusTone } from '@bandhan/ui';
import { type AdminEvent, useGetEventsQuery } from '@/lib/adminApi';

const formatDate = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '—' : date.toLocaleDateString();
};

const humanize = (key: string) => key
  .replace(/([A-Z])/g, ' $1')
  .replace(/[_-]/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bhn-text-muted)]">{label}</p>
      <div className="mt-1 break-words text-sm">{children}</div>
    </div>
  );
}

export default function Events() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState<AdminEvent | null>(null);

  const { data: events = [], isLoading, isError, refetch } = useGetEventsQuery();

  const statuses = useMemo(() => Array.from(new Set(events.map((event) => event.status).filter(Boolean))).sort(), [events]);
  const eventTypes = useMemo(() => Array.from(new Set(events.map((event) => event.eventType).filter(Boolean))).sort(), [events]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesQuery = !query || `${event.title} ${event.location} ${event.eventType} ${event.status} ${event.owner.fullName} ${event.owner.email}`.toLowerCase().includes(query);
      const matchesStatus = !statusFilter || event.status === statusFilter;
      const matchesType = !typeFilter || event.eventType === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [events, search, statusFilter, typeFilter]);

  const detailArrays = selected
    ? Object.entries(selected.raw).filter(([key, value]) => Array.isArray(value) && /budget|vendor|venue|task/i.test(key))
    : [];

  return (
    <div>
      <PageHeader title="Events" subtitle="All events created across the platform" />

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title || 'Event details'} size="xl">
        {selected ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Event">{selected.title}</Detail>
              <Detail label="Status"><Badge tone={statusTone(selected.status)}>{selected.status || '—'}</Badge></Detail>
              <Detail label="Event type">{selected.eventType || '—'}</Detail>
              <Detail label="Date">{formatDate(selected.date)}</Detail>
              <Detail label="Location">{selected.location || '—'}</Detail>
              <Detail label="Guests">{selected.guestCount}</Detail>
              <Detail label="Owner">{selected.owner.fullName || '—'}</Detail>
              <Detail label="Owner email">{selected.owner.email || '—'}</Detail>
              <Detail label="Owner ID">{selected.owner._id || '—'}</Detail>
              <Detail label="Created">{formatDate(selected.createdAt)}</Detail>
              <Detail label="Event ID">{selected._id || '—'}</Detail>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Budget, vendors, venues and tasks</h3>
              {detailArrays.length === 0 ? (
                <p className="text-xs text-[var(--bhn-text-muted)]">No budget, vendor, venue or task arrays are present in this event record.</p>
              ) : (
                detailArrays.map(([key, value]) => (
                  <div key={key}>
                    <p className="mb-1 text-xs font-semibold text-[var(--bhn-text-soft)]">{humanize(key)}</p>
                    <pre className="max-h-64 overflow-auto rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-3 text-xs text-[var(--bhn-text)]">{JSON.stringify(value, null, 2)}</pre>
                  </div>
                ))
              )}
            </section>

            <details className="rounded-xl border border-[var(--bhn-border)] p-3">
              <summary className="cursor-pointer text-sm font-semibold">Full event payload</summary>
              <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-[var(--bhn-surface-2)] p-3 text-xs text-[var(--bhn-text)]">{JSON.stringify(selected.raw, null, 2)}</pre>
            </details>
          </div>
        ) : null}
      </Modal>

      <div className="card mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search events, owners or locations..." /></div>
        <Select className="w-full md:w-44" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </Select>
        <Select className="w-full md:w-44" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by event type">
          <option value="">All event types</option>
          {eventTypes.map((eventType) => <option key={eventType} value={eventType}>{eventType}</option>)}
        </Select>
      </div>

      {isError ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">Could not load events</p>
          <p className="bhn-empty-desc">Please try again.</p>
          <Button className="mt-3" variant="secondary" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className="card py-8 text-center text-sm text-[var(--bhn-text-muted)]">Loading events...</div>
      ) : filtered.length === 0 ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">No events found</p>
          <p className="bhn-empty-desc">Adjust your filters to see more events.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="admin-table w-full">
            <thead><tr><th>Event</th><th>Owner</th><th>Date</th><th>Location</th><th>Guests</th><th>Status</th><th>Type</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event._id}>
                  <td className="font-medium text-sm">{event.title}</td>
                  <td>
                    {event.owner.fullName || '—'}
                    {event.owner.email ? <p className="mt-0.5 text-xs font-normal text-[var(--bhn-text-muted)]">{event.owner.email}</p> : null}
                  </td>
                  <td>{formatDate(event.date)}</td>
                  <td>{event.location || '—'}</td>
                  <td>{event.guestCount}</td>
                  <td><Badge tone={statusTone(event.status)}>{event.status || '—'}</Badge></td>
                  <td>{event.eventType || '—'}</td>
                  <td>{formatDate(event.createdAt)}</td>
                  <td><Button size="sm" variant="secondary" onClick={() => setSelected(event)} icon={<Eye size={14} />}>View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
