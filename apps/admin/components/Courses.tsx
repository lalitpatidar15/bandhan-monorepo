'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Check, Star } from 'lucide-react';
import { useGetCoursesQuery, useCreateCourseMutation, useUpdateCourseMutation, useDeleteCourseMutation } from '@/lib/adminApi';

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', category: '', price: 0, status: 'draft', visibility: 'public', description: '' });
  const { data: courses = [], isLoading } = useGetCoursesQuery();
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(c => [c.title, c.category, c.level, c.instructor].join(' ').toLowerCase().includes(q));
  }, [searchTerm, courses]);

  const reset = () => { setForm({ title: '', category: '', price: 0, status: 'draft', visibility: 'public', description: '' }); setEditingId(null); setShowForm(false); };

  const handleEdit = (c: typeof courses[0]) => {
    setForm({ title: c.title, category: c.category, price: c.price, status: c.status, visibility: c.visibility, description: '' });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    try {
      if (editingId) {
        await updateCourse({ id: editingId, ...form }).unwrap();
      } else {
        await createCourse(form).unwrap();
      }
      reset();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try { await deleteCourse(id).unwrap(); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Courses</h1>
        <button onClick={() => setShowForm(true)} className="admin-btn admin-btn-primary">
          <Plus className="w-3.5 h-3.5" /> New Course
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editingId ? 'Edit Course' : 'New Course'}</h2>
            <button onClick={reset} className="admin-btn admin-btn-secondary">Cancel</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Course Title" className="admin-input" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="admin-input" />
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price (₹)" className="admin-input" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="admin-input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="admin-input">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="admin-input" />
          </div>
          <button onClick={handleSubmit} disabled={isCreating} className="admin-btn admin-btn-primary">
            {isCreating ? 'Saving...' : editingId ? 'Save Changes' : 'Create Course'}
          </button>
        </div>
      )}

      <div className="card mb-3">
        <div className="flex items-center">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input type="text" placeholder="Search courses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm text-gray-700" />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Instructor</th>
              <th>Price</th>
              <th>Students</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="font-medium text-gray-900 text-sm">{c.title}</div>
                  <div className="text-xs text-gray-500">{c.category} &bull; {c.level}</div>
                </td>
                <td className="text-sm">{c.instructor}</td>
                <td className="text-sm">₹{c.price.toLocaleString()}</td>
                <td className="text-sm">{c.totalStudents}</td>
                <td>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-medium">{c.rating || '—'}</span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <span className={`admin-badge ${c.status === 'published' ? 'admin-badge-active' : 'admin-badge-pending'}`}>{c.status}</span>
                    <span className="admin-badge bg-blue-100 text-blue-800">{c.visibility}</span>
                  </div>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(c)} className="admin-btn admin-btn-secondary"><Edit className="w-3 h-3" /></button>
                    <button onClick={() => handleDelete(c.id)} className="admin-btn admin-btn-danger"><Trash2 className="w-3 h-3" /></button>
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
