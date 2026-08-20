'use client';

import { useGetSupportTicketsQuery, useUpdateSupportTicketMutation } from '@/lib/adminApi';
import { useState } from 'react';
import { PageHeader, StatCard, Badge, statusTone, Button } from '@bandhan/ui';

export default function SupportTickets() {
  const { data: tickets = [] } = useGetSupportTicketsQuery();
  const [updateTicket] = useUpdateSupportTicketMutation();
  const [assignment, setAssignment] = useState<Record<string, string>>({});

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateTicket({ id, status, assignedTo: assignment[id] || undefined, note: `Updated to ${status}` }).unwrap();
    } catch (error) {
      console.error('Unable to update support ticket:', error);
    }
  };

  const priorityTone = (priority: string): ReturnType<typeof statusTone> => {
    const p = String(priority || '').toLowerCase();
    if (['urgent', 'high', 'critical'].includes(p)) return 'danger';
    if (p === 'medium') return 'warning';
    if (p === 'low') return 'info';
    return 'neutral';
  };

  const summary = [
    { label: 'Total Tickets', value: tickets.length },
    { label: 'Open', value: tickets.filter((t) => t.status === 'open' || t.status === 'pending').length },
    { label: 'In Progress', value: tickets.filter((t) => t.status === 'in_progress').length },
    { label: 'Waiting User', value: tickets.filter((t) => t.status === 'waiting_user').length },
  ];

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        subtitle="Track support workload and close outstanding customer issues."
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="bhn-table-wrap">
        <table className="bhn-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Requester</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="font-medium">{ticket.subject}</td>
                <td>{ticket.requester}</td>
                <td>
                  <Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge>
                </td>
                <td>
                  <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
                </td>
                <td>
                  <input
                    value={assignment[ticket.id] || ticket.assignedTo || ''}
                    onChange={(event) => setAssignment((prev) => ({ ...prev, [ticket.id]: event.target.value }))}
                    placeholder="Assignee"
                    className="bhn-input text-xs"
                    style={{ width: '8rem' }}
                  />
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => updateStatus(ticket.id, 'in_progress')}>In Progress</Button>
                    <Button variant="primary" size="sm" onClick={() => updateStatus(ticket.id, 'waiting_user')}>Waiting User</Button>
                    <Button variant="soft" size="sm" onClick={() => updateStatus(ticket.id, 'closed')}>Close</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}