'use client';

import { useMemo, useState } from 'react';
import { Search, Edit, Trash2, X, Check } from 'lucide-react';
import { useGetEnrollmentsQuery, useUpdateEnrollmentMutation, useDeleteEnrollmentMutation } from '@/lib/adminApi';
import { statusBadgeClass } from '@/lib/badges';

export default function Enrollments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: '', progressPercentage: 0 });
  const { data: enrollments = [] } = useGetEnrollmentsQuery();
  const [updateEnrollment] = useUpdateEnrollmentMutation();
  const [deleteEnrollment] = useDeleteEnrollmentMutation();

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter(e => [e.student, e.studentEmail, e.course, e.category, e.status].join(' ').toLowerCase().includes(q));
  }, [searchTerm, enrollments]);

  const startEdit = (e: typeof enrollments[0]) => {
    setEditingId(e.id);
    setEditForm({ status: e.status, progressPercentage: e.progressPercentage });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try { await updateEnrollment({ id: editingId, ...editForm }).unwrap(); setEditingId(null); }
    catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enrollment?')) return;
    try { await deleteEnrollment(id).unwrap(); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <h1 className="admin-page-heading">Enrollments</h1>
      <p className="admin-page-sub">Monitor which students are enrolled in which courses and their progress.</p>

      <div className="card mt-4">
        <div className="flex items-center">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input type="text" placeholder="Search by student, course, or status..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm text-gray-700" />
        </div>
      </div>

      <div className="card mt-3 overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Progress</th>
              <th>Last Accessed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id}>
                {editingId === e.id ? (
                  <>
                    <td>
                      <div className="font-medium text-gray-900 text-sm">{e.student}</div>
                      <div className="text-xs text-gray-500">{e.studentEmail}</div>
                    </td>
                    <td>
                      <div className="font-medium text-gray-900 text-sm">{e.course}</div>
                      <div className="text-xs text-gray-500">{e.category}</div>
                    </td>
                    <td>
                      <input type="number" min="0" max="100" value={editForm.progressPercentage} onChange={e2 => setEditForm({ ...editForm, progressPercentage: Number(e2.target.value) })} className="admin-input text-xs w-20" />
                    </td>
                    <td className="text-sm">{e.lastAccessedAt ? new Date(e.lastAccessedAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <select value={editForm.status} onChange={e2 => setEditForm({ ...editForm, status: e2.target.value })} className="admin-input text-xs">
                        <option value="active">active</option><option value="completed">completed</option><option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={saveEdit} className="admin-btn admin-btn-success"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setEditingId(null)} className="admin-btn admin-btn-secondary"><X className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <div className="font-medium text-gray-900 text-sm">{e.student}</div>
                      <div className="text-xs text-gray-500">{e.studentEmail}</div>
                    </td>
                    <td>
                      <div className="font-medium text-gray-900 text-sm">{e.course}</div>
                      <div className="text-xs text-gray-500">{e.category}</div>
                    </td>
                    <td className="text-sm">{e.progressPercentage}%</td>
                    <td className="text-sm">{e.lastAccessedAt ? new Date(e.lastAccessedAt).toLocaleDateString() : '—'}</td>
                    <td><span className={`admin-badge ${statusBadgeClass(e.status)}`}>{e.status}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(e)} className="admin-btn admin-btn-secondary"><Edit className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(e.id)} className="admin-btn admin-btn-danger"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
