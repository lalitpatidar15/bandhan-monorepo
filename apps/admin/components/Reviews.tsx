'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Badge, Button, PageHeader, SearchInput, Select, statusTone } from '@bandhan/ui';
import { type AdminModerationReview, useGetModerationReviewsQuery, useUpdateModerationReviewMutation } from '@/lib/adminApi';

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function Reviews() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [itemType, setItemType] = useState('');
  const { data: reviews = [], isLoading, isError, refetch } = useGetModerationReviewsQuery({ status: status || undefined, itemType: itemType || undefined });
  const [updateReview, { isLoading: isUpdating }] = useUpdateModerationReviewMutation();

  const itemTypes = useMemo(() => Array.from(new Set(reviews.map((review) => review.itemType))).sort(), [reviews]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reviews;
    return reviews.filter((review) => `${review.title} ${review.comment} ${review.customerName} ${review.itemId}`.toLowerCase().includes(query));
  }, [reviews, search]);

  const decide = async (review: AdminModerationReview, nextStatus: 'approved' | 'rejected') => {
    try {
      await updateReview({ id: review._id, status: nextStatus, itemType: review.itemType }).unwrap();
      toast.success(`Review ${nextStatus}`);
    } catch {
      toast.error(`Could not ${nextStatus} review`);
    }
  };

  return (
    <div>
      <PageHeader title="Review moderation" subtitle="Approve or reject customer reviews before they appear publicly" />

      <div className="card mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search reviews, customers or item IDs..." />
        </div>
        <Select className="w-full md:w-44" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
        <Select className="w-full md:w-44" value={itemType} onChange={(event) => setItemType(event.target.value)} aria-label="Filter by item type">
          <option value="">All item types</option>
          {itemTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </Select>
      </div>

      {isError ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">Could not load reviews</p>
          <p className="bhn-empty-desc">The moderation service may be unavailable.</p>
          <Button className="mt-3" variant="secondary" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className="card py-8 text-center text-sm text-[var(--bhn-text-muted)]">Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">No reviews found</p>
          <p className="bhn-empty-desc">Try a different search or filter.</p>
        </div>
      ) : (
        <div className="bhn-table-wrap">
          <table className="bhn-table w-full">
            <thead>
              <tr>
                <th>Review</th>
                <th>Item</th>
                <th>Rating</th>
                <th>Customer</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review._id}>
                  <td className="max-w-sm">
                    <div className="text-sm font-medium">{review.title || 'Untitled review'}</div>
                    <div className="text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{review.comment}</div>
                    {review.createdAt ? <div className="mt-1 text-xs" style={{ color: 'var(--bhn-text-soft)' }}>{new Date(review.createdAt).toLocaleDateString()}</div> : null}
                  </td>
                  <td className="text-sm">
                    <div>{review.itemType}</div>
                    <div className="text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{review.itemId || '—'}</div>
                  </td>
                  <td className="text-sm font-semibold">{'★'.repeat(Math.max(0, Math.min(5, review.rating)))} {review.rating || ''}</td>
                  <td className="text-sm">{review.customerName}</td>
                  <td><Badge tone={statusTone(review.status)}>{review.status}</Badge></td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="secondary" disabled={isUpdating || review.status === 'approved'} onClick={() => decide(review, 'approved')}>Approve</Button>
                      <Button size="sm" variant="danger" disabled={isUpdating || review.status === 'rejected'} onClick={() => decide(review, 'rejected')}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
