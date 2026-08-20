'use client';

import { useState } from 'react';
import { Search, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useGetRentalOrdersQuery, useUpdateRentalOrderMutation } from '@/lib/adminApi';

type RentalOrder = { id: string; rentalId: string; customerName: string; sellerName: string; productTitle: string; rentalStart: string; rentalEnd: string; rentalDurationDays: number; dailyRate: number; subtotal: number; securityDeposit: number; totalAmount: number; rentalStatus: string; paymentStatus: string; createdAt: string; };

const STATUS_BADGE: Record<string, string> = {
  pending_deposit: 'admin-badge-pending',
  deposit_paid: 'admin-badge-pending',
  reserved: 'admin-badge-pending',
  shipped: 'admin-badge-active',
  delivered: 'admin-badge-active',
  in_use: 'admin-badge-active',
  return_scheduled: 'admin-badge-pending',
  return_shipped: 'admin-badge-pending',
  returned: 'admin-badge-active',
  inspection: 'admin-badge-pending',
  completed: 'admin-badge-active',
  cancelled: 'admin-badge-inactive',
  overdue: 'admin-badge-inactive',
};

const STATUSES = ['', 'pending_deposit', 'deposit_paid', 'reserved', 'shipped', 'delivered', 'in_use', 'return_shipped', 'returned', 'inspection', 'completed', 'cancelled', 'overdue'];

export default function RentalOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: rentals = [], isLoading } = useGetRentalOrdersQuery({ status: statusFilter });
  const [updateRental] = useUpdateRentalOrderMutation();

  const filtered = rentals.filter((r) =>
    r.rentalId.toLowerCase().includes(search.toLowerCase()) ||
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.productTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateRental({ id, rentalStatus: newStatus }).unwrap();
    } catch {}
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Rental Orders</h1>
        <span className="admin-badge bg-violet-100 text-violet-700">{filtered.length} total</span>
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center flex-1">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by rental ID, customer, or product..." className="flex-1 outline-none text-sm text-gray-700" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input" style={{ width: 'auto' }}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">No rental orders found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between p-1 cursor-pointer" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-violet-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.rentalId}</p>
                    <p className="text-xs text-gray-500">{r.customerName} · {r.productTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`admin-badge ${STATUS_BADGE[r.rentalStatus] || 'admin-badge-pending'}`}>
                    {r.rentalStatus.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-bold text-gray-800">₹{r.totalAmount.toLocaleString()}</span>
                  {expandedId === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {expandedId === r.id && (
                <div className="border-t mt-2 pt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Seller:</span> <span className="font-medium">{r.sellerName}</span></div>
                    <div><span className="text-gray-500">Product:</span> <span className="font-medium">{r.productTitle}</span></div>
                    <div><span className="text-gray-500">Rental Period:</span> <span className="font-medium">{new Date(r.rentalStart).toLocaleDateString()} – {new Date(r.rentalEnd).toLocaleDateString()}</span></div>
                    <div><span className="text-gray-500">Duration:</span> <span className="font-medium">{r.rentalDurationDays} days</span></div>
                    <div><span className="text-gray-500">Daily Rate:</span> <span className="font-medium">₹{r.dailyRate.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Security Deposit:</span> <span className="font-medium">₹{r.securityDeposit.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Payment:</span> <span className="font-medium">{r.paymentStatus}</span></div>
                    <div><span className="text-gray-500">Created:</span> <span className="font-medium">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</span></div>
                  </div>

                  <div className="flex items-center gap-2 border-t pt-3">
                    <span className="text-xs font-semibold text-gray-500">Update Status:</span>
                    {STATUSES.filter(Boolean).map((s) => (
                      <button
                        key={s}
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(r.id, s); }}
                        className={`admin-btn text-[10px] ${r.rentalStatus === s ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                      >
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
