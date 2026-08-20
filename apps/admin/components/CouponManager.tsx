'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, TicketPercent } from 'lucide-react';
import { useGetCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } from '@/lib/adminApi';

type Coupon = { id: string; code: string; description: string; discountType: 'percentage' | 'fixed'; discountValue: number; minOrderAmount: number; maxDiscount: number; usageLimit: number; usedCount: number; isActive: boolean; startDate: string; endDate: string; createdAt: string; };

export default function CouponManager() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', description: '', discountType: 'percentage' as 'percentage' | 'fixed', discountValue: 0, minOrderAmount: 0, maxDiscount: 0, usageLimit: 0, startDate: '', endDate: '' });
  const [filter, setFilter] = useState('');

  const { data: coupons = [], isLoading } = useGetCouponsQuery({ status: filter || undefined });
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const reset = () => {
    setForm({ code: '', description: '', discountType: 'percentage', discountValue: 0, minOrderAmount: 0, maxDiscount: 0, usageLimit: 0, startDate: '', endDate: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (c: Coupon) => {
    setForm({ code: c.code, description: c.description, discountType: c.discountType, discountValue: c.discountValue, minOrderAmount: c.minOrderAmount, maxDiscount: c.maxDiscount, usageLimit: c.usageLimit, startDate: c.startDate?.split('T')[0] || '', endDate: c.endDate?.split('T')[0] || '' });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) return;
    try {
      if (editId) {
        await updateCoupon({ id: editId, ...form }).unwrap();
      } else {
        await createCoupon(form).unwrap();
      }
      reset();
    } catch {}
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Coupon Management</h1>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="admin-input w-auto">
            <option value="">All Coupons</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button onClick={() => setShowForm(true)} className="admin-btn admin-btn-primary">
            <Plus className="w-3.5 h-3.5" /> New Coupon
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editId ? 'Edit Coupon' : 'New Coupon'}</h2>
            <button onClick={reset} className="admin-btn admin-btn-secondary">Cancel</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Coupon Code (e.g. SAVE20)" className="admin-input" />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="admin-input" />
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' })} className="admin-input">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} placeholder="Discount Value" className="admin-input" />
            <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} placeholder="Min Order Amount (₹)" className="admin-input" />
            <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} placeholder="Max Discount (₹, 0=unlimited)" className="admin-input" />
            <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} placeholder="Usage Limit (0=unlimited)" className="admin-input" />
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="admin-input" />
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="admin-input" />
          </div>
          <button onClick={handleSubmit} disabled={isCreating || isUpdating} className="admin-btn admin-btn-primary">
            {isCreating || isUpdating ? 'Saving...' : editId ? 'Save Changes' : 'Create Coupon'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : coupons.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">No coupons yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Used</th>
                <th>Status</th>
                <th>Valid Until</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="font-mono font-bold text-sm">{c.code}</td>
                  <td>
                    <span className="admin-badge bg-violet-100 text-violet-700">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </span>
                  </td>
                  <td className="text-sm">₹{c.minOrderAmount.toLocaleString()}</td>
                  <td className="text-sm">{c.usedCount}{c.usageLimit > 0 ? `/${c.usageLimit}` : ''}</td>
                  <td><span className={`admin-badge ${c.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="text-xs text-gray-500">{c.endDate ? new Date(c.endDate).toLocaleDateString() : 'No expiry'}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEdit(c)} className="admin-btn admin-btn-secondary"><Edit className="w-3 h-3" /></button>
                      <button onClick={() => { if (confirm('Delete this coupon?')) deleteCoupon(c.id); }} className="admin-btn admin-btn-danger"><Trash2 className="w-3 h-3" /></button>
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
