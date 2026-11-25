'use client';

import { useState } from 'react';
import { CheckCircle2, FileText, ShieldCheck, XCircle } from 'lucide-react';
import { useGetSellerVerificationsQuery, useReviewSellerVerificationMutation } from '@/lib/adminApi';
import { Badge, Button, Card, PageHeader } from '@bandhan/ui';
import toast from 'react-hot-toast';

const DOCUMENT_LABELS: Array<{ key: 'governmentId' | 'addressProof' | 'businessProof'; label: string }> = [
  { key: 'governmentId', label: 'Government ID' },
  { key: 'addressProof', label: 'Address proof' },
  { key: 'businessProof', label: 'Business proof' },
];

export default function SellerVerifications() {
  const { data: verifications = [], isLoading } = useGetSellerVerificationsQuery();
  const [review, { isLoading: reviewing }] = useReviewSellerVerificationMutation();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');

  const visible = verifications.filter((record) => filter === 'all' || record.status === filter);

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    try {
      await review({ id, action, rejectionReason: reasons[id] }).unwrap();
      toast.success(action === 'approve' ? 'Seller verified' : 'Seller rejected');
      setReasons((previous) => ({ ...previous, [id]: '' }));
    } catch {
      toast.error(`Unable to ${action} seller`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Seller verification"
        subtitle="Manually review identity documents submitted by sellers"
        actions={
          <select className="bhn-select" style={{ width: 'auto' }} value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
            <option value="pending">Pending</option>
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        }
      />

      {isLoading ? (
        <Card><p className="text-sm text-[var(--bhn-text-muted)]">Loading verification requests…</p></Card>
      ) : visible.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <ShieldCheck className="h-8 w-8" style={{ color: 'var(--bhn-text-muted)' }} />
            <p className="text-sm font-semibold text-[var(--bhn-text)]">Nothing to review</p>
            <p className="text-xs text-[var(--bhn-text-muted)]">New seller submissions will appear here.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {visible.map((record) => (
            <Card key={record.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--bhn-text)]">{record.sellerName || 'Seller'}</h3>
                    <Badge tone={record.status === 'verified' ? 'success' : record.status === 'rejected' ? 'danger' : 'warning'}>{record.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--bhn-text-muted)]">{record.sellerEmail} · {record.businessName || 'Business name not provided'}</p>
                  <p className="text-xs text-[var(--bhn-text-muted)]">Submitted {record.submittedAt ? new Date(record.submittedAt).toLocaleString() : '—'}</p>
                </div>
                {record.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" icon={<XCircle size={13} />} disabled={reviewing || !String(reasons[record.id] || '').trim()} onClick={() => handleReview(record.id, 'reject')}>Reject</Button>
                    <Button variant="primary" size="sm" icon={<CheckCircle2 size={13} />} disabled={reviewing} onClick={() => handleReview(record.id, 'approve')}>Approve</Button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {DOCUMENT_LABELS.map(({ key, label }) => {
                  const url = record.documents?.[key];
                  return url ? (
                    <a key={key} href={url} target="_blank" rel="noreferrer" className="bhn-button bhn-button-secondary bhn-button-sm inline-flex items-center gap-1.5">
                      <FileText size={13} /> {label}
                    </a>
                  ) : (
                    <span key={key} className="text-xs text-[var(--bhn-text-muted)]">{label}: not uploaded</span>
                  );
                })}
              </div>

              {record.status === 'rejected' && record.rejectionReason && (
                <p className="mt-3 text-xs" style={{ color: 'var(--bhn-error-600)' }}>Reason: {record.rejectionReason}</p>
              )}

              {record.status === 'pending' && (
                <input
                  className="bhn-input mt-4"
                  placeholder="Rejection reason (required to reject)"
                  value={reasons[record.id] || ''}
                  onChange={(event) => setReasons((previous) => ({ ...previous, [record.id]: event.target.value }))}
                />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
