'use client';

import { useState } from 'react';
import { useGetDisputesQuery, useUpdateDisputeMutation } from '@/lib/adminApi';
import { statusBadgeClass } from '@/lib/badges';

export default function Disputes() {
  const { data: disputes = [] } = useGetDisputesQuery();
  const [updateDispute] = useUpdateDisputeMutation();
  const [resolutionDraft, setResolutionDraft] = useState<Record<string, string>>({});

  const updateDisputeStatus = async (id: string, status: string) => {
    try {
      await updateDispute({ id, status, resolution: resolutionDraft[id] || 'Updated by admin' }).unwrap();
    } catch (error) {
      console.error('Unable to resolve dispute:', error);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="admin-page-heading">Disputes</h1>
        <p className="admin-page-sub">Resolve refund and transaction conflicts raised by users.</p>
      </div>

      <div className="space-y-4">
        {disputes.map((dispute) => (
          <div key={dispute.id} className="card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{dispute.title}</h2>
                <p className="text-xs text-gray-500">Ref: {dispute.referenceId} • {dispute.type} • Raised by {dispute.raisedBy}</p>
              </div>
              <span className={`admin-badge ${statusBadgeClass(dispute.status)}`}>
                {dispute.status}
              </span>
            </div>

            <textarea
              className="w-full admin-input text-sm"
              rows={3}
              placeholder="Resolution notes"
              value={resolutionDraft[dispute.id] || dispute.resolution || ''}
              onChange={(event) => setResolutionDraft((prev) => ({ ...prev, [dispute.id]: event.target.value }))}
            />

            <div className="flex flex-wrap gap-2">
              <button onClick={() => updateDisputeStatus(dispute.id, 'in_review')} className="admin-btn admin-btn-secondary text-sm">
                Mark In Review
              </button>
              <button onClick={() => updateDisputeStatus(dispute.id, 'resolved')} className="admin-btn admin-btn-success text-sm">
                Resolve
              </button>
              <button onClick={() => updateDisputeStatus(dispute.id, 'rejected')} className="admin-btn admin-btn-danger text-sm">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
