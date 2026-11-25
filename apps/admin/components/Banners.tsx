'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useGetBannersQuery, useCreateBannerMutation, useUpdateBannerMutation, useDeleteBannerMutation } from '@/lib/adminApi';

type Banner = { id: string; title: string; subtitle: string; image: string; buttonText: string; createdAt: string; };

export default function Banners() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', buttonText: '' });

  const { data: banners = [], isLoading } = useGetBannersQuery();
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const reset = () => {
    setForm({ title: '', subtitle: '', image: '', buttonText: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (b: Banner) => {
    setForm({ title: b.title, subtitle: b.subtitle, image: b.image, buttonText: b.buttonText });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    try {
      if (editId) {
        await updateBanner({ id: editId, ...form }).unwrap();
      } else {
        await createBanner(form).unwrap();
      }
      reset();
    } catch {}
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Banner Management</h1>
        <button onClick={() => setShowForm(true)} className="admin-btn admin-btn-primary">
          <Plus className="w-3.5 h-3.5" /> New Banner
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editId ? 'Edit Banner' : 'New Banner'}</h2>
            <button onClick={reset} className="admin-btn admin-btn-secondary">Cancel</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="admin-input" />
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitle" className="admin-input" />
          </div>
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" className="admin-input" />
          <input value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} placeholder="Button Text" className="admin-input" />
          {form.image && (
            <div className="overflow-hidden rounded-lg border">
              <img src={form.image} alt="Preview" className="h-32 w-full object-cover" />
            </div>
          )}
          <button onClick={handleSubmit} disabled={isCreating || isUpdating} className="admin-btn admin-btn-primary">
            {isCreating || isUpdating ? 'Saving...' : editId ? 'Save Changes' : 'Create Banner'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-sm text-[var(--bhn-text-muted)]">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--bhn-text-muted)]">No banners yet</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <div key={b.id} className="card overflow-hidden p-0">
              <div className="relative h-36 bg-[var(--bhn-surface-3)]">
                {b.image ? (
                  <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--bhn-text-muted)]">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute right-2 top-2 flex gap-1">
                  <button onClick={() => handleEdit(b)} className="admin-btn admin-btn-secondary bg-[color-mix(in_srgb,var(--bhn-surface)_90%,transparent)]"><Edit className="w-3 h-3" /></button>
                  <button onClick={() => { if (confirm('Delete this banner?')) deleteBanner(b.id); }} className="admin-btn admin-btn-danger bg-[color-mix(in_srgb,var(--bhn-surface)_90%,transparent)]"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-[var(--bhn-text)]">{b.title}</h3>
                {b.subtitle && <p className="mt-0.5 text-xs text-[var(--bhn-text-muted)]">{b.subtitle}</p>}
                {b.buttonText && <span className="mt-2 inline-block admin-badge bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]">{b.buttonText}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
