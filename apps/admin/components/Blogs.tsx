'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import { useGetBlogsQuery, useCreateBlogMutation, useUpdateBlogMutation, useDeleteBlogMutation } from '@/lib/adminApi';

type Blog = { id: string; title: string; content: string; category: string; status: string; featured: boolean; createdAt: string; seoTitle: string; seoDescription: string; };

export default function Blogs() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: '', status: 'draft', featured: false, seoTitle: '', seoDescription: '' });

  const { data: blogs = [], isLoading } = useGetBlogsQuery({ status: statusFilter, q: search });
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();

  const reset = () => {
    setForm({ title: '', content: '', category: '', status: 'draft', featured: false, seoTitle: '', seoDescription: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (b: Blog) => {
    setForm({ title: b.title, content: b.content, category: b.category, status: b.status, featured: b.featured, seoTitle: b.seoTitle || '', seoDescription: b.seoDescription || '' });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    try {
      if (editId) {
        await updateBlog({ id: editId, ...form }).unwrap();
      } else {
        await createBlog(form).unwrap();
      }
      reset();
    } catch {}
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Blog Management</h1>
        <button onClick={() => setShowForm(true)} className="admin-btn admin-btn-primary">
          <Plus className="w-3.5 h-3.5" /> New Blog
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editId ? 'Edit Blog' : 'New Blog'}</h2>
            <button onClick={reset} className="admin-btn admin-btn-secondary">Cancel</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="admin-input" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="admin-input" />
          </div>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Content (supports plain text or markdown)" rows={6} className="admin-input" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="admin-input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
              Featured
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="SEO Title" className="admin-input" />
            <input value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="SEO Description" className="admin-input" />
          </div>
          <button onClick={handleSubmit} disabled={isCreating || isUpdating} className="admin-btn admin-btn-primary">
            {isCreating || isUpdating ? 'Saving...' : editId ? 'Save Changes' : 'Create Blog'}
          </button>
        </div>
      )}

      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center flex-1">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blogs..." className="flex-1 outline-none text-sm text-gray-700" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input" style={{ width: 'auto' }}>
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : blogs.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">No blogs found</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b.id}>
                  <td className="font-medium">{b.title}</td>
                  <td>{b.category || '—'}</td>
                  <td>
                    <span className={`admin-badge ${b.status === 'published' ? 'admin-badge-active' : b.status === 'draft' ? 'admin-badge-pending' : 'admin-badge-inactive'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>{b.featured ? <Eye size={14} className="text-violet-600" /> : <EyeOff size={14} className="text-gray-300" />}</td>
                  <td>{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(b)} className="admin-btn admin-btn-secondary"><Edit className="w-3 h-3" /></button>
                      <button onClick={() => { if (confirm('Delete this blog?')) deleteBlog(b.id); }} className="admin-btn admin-btn-danger"><Trash2 className="w-3 h-3" /></button>
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
