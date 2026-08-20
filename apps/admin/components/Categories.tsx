'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '@/lib/adminApi';

export default function Categories() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', subcategories: '', scopes: ['products'], isActive: true });

  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const reset = () => {
    setForm({ name: '', subcategories: '', scopes: ['products'], isActive: true });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (cat: typeof categories[0]) => {
    setForm({ name: cat.name, subcategories: cat.subcategories.join(', '), scopes: cat.scopes?.length ? cat.scopes : ['products'], isActive: cat.isActive });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    const subs = form.subcategories.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      if (editId) {
        await updateCategory({ id: editId, name: form.name.trim(), subcategories: subs, scopes: form.scopes, isActive: form.isActive }).unwrap();
      } else {
        await createCategory({ name: form.name.trim(), subcategories: subs, scopes: form.scopes, isActive: form.isActive }).unwrap();
      }
      reset();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await deleteCategory(id).unwrap(); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Categories</h1>
        <button onClick={() => setShowForm(true)} className="admin-btn admin-btn-primary">
          <Plus className="w-3.5 h-3.5" /> New Category
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editId ? 'Edit Category' : 'New Category'}</h2>
            <button onClick={reset} className="admin-btn admin-btn-secondary">Cancel</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category Name" className="admin-input" />
            <input value={form.subcategories} onChange={(e) => setForm({ ...form, subcategories: e.target.value })} placeholder="Subcategories (comma-separated)" className="admin-input" />
            <fieldset className="rounded-lg border border-gray-200 px-3 py-2">
              <legend className="px-1 text-xs font-medium text-gray-700">Use in listing types</legend>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-700">{['products', 'services', 'venues', 'courses', 'jobs'].map((scope) => <label key={scope} className="flex items-center gap-1"><input type="checkbox" checked={form.scopes.includes(scope)} onChange={() => setForm({ ...form, scopes: form.scopes.includes(scope) ? form.scopes.filter((item) => item !== scope) : [...form.scopes, scope] })} />{scope}</label>)}</div>
            </fieldset>
            <select value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} className="admin-input">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <button onClick={handleSubmit} disabled={isCreating || isUpdating} className="admin-btn admin-btn-primary">
            {isCreating || isUpdating ? 'Saving...' : editId ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">No categories yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subcategories</th>
                <th>Used in</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="font-medium text-sm">{cat.name}</td>
                  <td className="text-xs text-gray-600">
                    {cat.subcategories.length > 0 ? cat.subcategories.join(', ') : '—'}
                  </td>
                  <td className="text-xs text-gray-600">{cat.scopes?.join(', ') || 'products'}</td>
                  <td><span className={`admin-badge ${cat.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEdit(cat)} className="admin-btn admin-btn-secondary"><Edit className="w-3 h-3" /></button>
                      <button onClick={() => handleDelete(cat.id)} className="admin-btn admin-btn-danger"><Trash2 className="w-3 h-3" /></button>
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
