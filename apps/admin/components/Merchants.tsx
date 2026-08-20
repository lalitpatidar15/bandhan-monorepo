'use client';

import { Fragment, useState } from 'react';
import { Search, Star, Package, ShoppingCart, Ban, CheckCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useGetSellersDetailedQuery, useGetSellerReviewsQuery, useSuspendSellerMutation } from '@/lib/adminApi';
import { PageHeader, Input, Badge, statusTone, Button } from '@bandhan/ui';

export default function Merchants() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: sellers = [], isLoading } = useGetSellersDetailedQuery();
  const [suspendSeller] = useSuspendSellerMutation();

  const filtered = sellers.filter((s) =>
    !search || s.fullName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSuspend = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    if (!confirm(`${newStatus === 'suspended' ? 'Suspend' : 'Reactivate'} this seller?`)) return;
    try { await suspendSeller({ id, status: newStatus }).unwrap(); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <PageHeader
        title="Seller Management"
        subtitle="Manage merchant accounts, ratings, products and orders"
        actions={
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--bhn-text-soft)' }}
            />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sellers..." style={{ width: '14rem', paddingLeft: '2.25rem' }} />
          </div>
        }
      />

      {isLoading ? (
        <div className="bhn-spinner-center"><div className="bhn-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">No sellers found</p>
          <p className="bhn-empty-desc">Try a different name or email.</p>
        </div>
      ) : (
        <div className="bhn-table-wrap">
          <table className="bhn-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Rating</th>
                <th>Products</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <Fragment key={s._id}>
                  <tr>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="bhn-avatar bhn-avatar-sm">{s.fullName.charAt(0).toUpperCase()}</span>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{s.fullName}</div>
                          <div className="truncate text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" style={{ color: 'var(--bhn-warning-500)', fill: 'var(--bhn-warning-500)' }} />
                        <span className="font-medium">{s.avgRating || '—'}</span>
                        <span className="text-xs" style={{ color: 'var(--bhn-text-soft)' }}>({s.reviewCount})</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" style={{ color: 'var(--bhn-info-500)' }} />
                        <span>{s.totalProducts}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" style={{ color: 'var(--bhn-success-600)' }} />
                        <span>{s.totalOrders}</span>
                      </div>
                    </td>
                    <td className="font-medium" style={{ color: 'var(--bhn-success-700)' }}>₹{s.revenue.toLocaleString()}</td>
                    <td><Badge tone={statusTone(s.accountStatus)}>{s.accountStatus}</Badge></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={s.accountStatus === 'suspended' ? 'primary' : 'danger'}
                          size="sm"
                          onClick={() => handleSuspend(s._id, s.accountStatus)}
                          icon={s.accountStatus === 'suspended' ? <CheckCircle size={14} /> : <Ban size={14} />}
                          title={s.accountStatus === 'suspended' ? 'Reactivate' : 'Suspend'}
                        >
                          {s.accountStatus === 'suspended' ? 'Reactivate' : 'Suspend'}
                        </Button>
                        <button
                          type="button"
                          onClick={() => toggleExpand(s._id)}
                          className="bhn-btn bhn-btn-secondary bhn-btn-icon"
                          aria-label={expandedId === s._id ? 'Collapse reviews' : 'Expand reviews'}
                          title="Reviews"
                        >
                          {expandedId === s._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === s._id && (
                    <tr>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <SellerReviews sellerId={s._id} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SellerReviews({ sellerId }: { sellerId: string }) {
  const { data: reviews = [], isLoading } = useGetSellerReviewsQuery(sellerId);

  if (isLoading) return <div className="px-4 py-3 text-xs" style={{ borderTop: '1px solid var(--bhn-border)', color: 'var(--bhn-text-muted)' }}>Loading reviews...</div>;
  if (reviews.length === 0) return <div className="px-4 py-3 text-xs" style={{ borderTop: '1px solid var(--bhn-border)', color: 'var(--bhn-text-muted)' }}>No reviews yet</div>;

  return (
    <div className="px-4 py-3" style={{ background: 'var(--bhn-surface-2)', borderTop: '1px solid var(--bhn-border)' }}>
      <div className="mb-2 flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5" style={{ color: 'var(--bhn-text-muted)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--bhn-text)' }}>Reviews ({reviews.length})</span>
      </div>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {reviews.map((r) => (
          <div key={r._id} className="rounded-lg border p-2.5 text-xs" style={{ background: 'var(--bhn-surface)', borderColor: 'var(--bhn-border)' }}>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ color: 'var(--bhn-text)' }}>{r.customerName}</span>
                {r.productName && <span style={{ color: 'var(--bhn-text-soft)' }}>on {r.productName}</span>}
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`h-2.5 w-2.5 ${i < r.rating ? '' : 'text-gray-200'}`} style={i < r.rating ? { color: 'var(--bhn-warning-500)', fill: 'var(--bhn-warning-500)' } : undefined} />
                ))}
              </div>
            </div>
            {r.title && <div className="mb-0.5 font-medium" style={{ color: 'var(--bhn-text)' }}>{r.title}</div>}
            <div style={{ color: 'var(--bhn-text-muted)' }}>{r.comment}</div>
            {r.sellerReply && (
              <div className="mt-1.5 border-l-2 pl-2" style={{ borderLeftColor: 'var(--bhn-brand-300)', color: 'var(--bhn-text-muted)' }}>
                <span className="font-medium">Reply:</span> {r.sellerReply}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}