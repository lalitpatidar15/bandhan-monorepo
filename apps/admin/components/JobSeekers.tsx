'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useGetJobSeekersQuery, useCreateJobSeekerMutation, useUpdateJobSeekerMutation, useDeleteJobSeekerMutation } from '@/lib/adminApi';

export default function JobSeekers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', currentRole: '', experienceLevel: 'Fresher', location: '' });
  const { data: seekers = [], isLoading } = useGetJobSeekersQuery();
  const [createSeeker, { isLoading: isCreating }] = useCreateJobSeekerMutation();
  const [updateSeeker] = useUpdateJobSeekerMutation();
  const [deleteSeeker] = useDeleteJobSeekerMutation();

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return seekers;
    return seekers.filter(s => [s.name, s.email, s.currentRole, s.experienceLevel, s.location].join(' ').toLowerCase().includes(q));
  }, [searchTerm, seekers]);

  const reset = () => { setForm({ fullName: '', email: '', phone: '', currentRole: '', experienceLevel: 'Fresher', location: '' }); setEditingId(null); setShowForm(false); };

  const handleEdit = (s: typeof seekers[0]) => {
    setForm({ fullName: s.name, email: s.email, phone: s.phone, currentRole: s.currentRole, experienceLevel: s.experienceLevel, location: s.location });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.email.trim()) return;
    try {
      if (editingId) {
        await updateSeeker({ id: editingId, ...form }).unwrap();
      } else {
        await createSeeker(form).unwrap();
      }
      reset();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job seeker?')) return;
    try { await deleteSeeker(id).unwrap(); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Job Seekers</h1>
        <button onClick={() => setShowForm(true)} className="admin-btn admin-btn-primary">
          <Plus className="w-3.5 h-3.5" /> New Job Seeker
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editingId ? 'Edit Job Seeker' : 'New Job Seeker'}</h2>
            <button onClick={reset} className="admin-btn admin-btn-secondary">Cancel</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full Name" className="admin-input" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="admin-input" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="admin-input" />
            <input value={form.currentRole} onChange={(e) => setForm({ ...form, currentRole: e.target.value })} placeholder="Current Role" className="admin-input" />
            <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} className="admin-input">
              <option>Fresher</option><option>Intermediate</option><option>Senior</option>
            </select>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="admin-input" />
          </div>
          <button onClick={handleSubmit} disabled={isCreating} className="admin-btn admin-btn-primary">
            {isCreating ? 'Saving...' : editingId ? 'Save Changes' : 'Create Job Seeker'}
          </button>
        </div>
      )}

      <div className="card mb-3">
        <div className="flex items-center">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input type="text" placeholder="Search job seekers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm text-gray-700" />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Current Role</th>
              <th>Experience</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="font-medium text-gray-900 text-sm">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.email}</div>
                  <div className="text-xs text-gray-500">{s.phone || 'No phone'}</div>
                </td>
                <td className="text-sm">{s.currentRole}</td>
                <td className="text-sm">{s.experienceLevel}</td>
                <td className="text-sm">{s.location}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(s)} className="admin-btn admin-btn-secondary"><Edit className="w-3 h-3" /></button>
                    <button onClick={() => handleDelete(s.id)} className="admin-btn admin-btn-danger"><Trash2 className="w-3 h-3" /></button>
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
