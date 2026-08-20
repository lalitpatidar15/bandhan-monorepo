'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useGetStudentsQuery, useCreateStudentMutation, useUpdateStudentMutation, useDeleteStudentMutation } from '@/lib/adminApi';
import { PageHeader, Button, Badge, statusTone, Modal, Field, Input, Select } from '@bandhan/ui';

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', experienceLevel: 'Fresher', accountStatus: 'active' });
  const { data: students = [], isLoading } = useGetStudentsQuery();
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent] = useUpdateStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s => [s.name, s.email, s.experienceLevel].join(' ').toLowerCase().includes(q));
  }, [searchTerm, students]);

  const reset = () => { setForm({ fullName: '', email: '', phone: '', experienceLevel: 'Fresher', accountStatus: 'active' }); setEditingId(null); setShowForm(false); };

  const handleEdit = (s: typeof students[0]) => {
    setForm({ fullName: s.name, email: s.email, phone: s.phone, experienceLevel: s.experienceLevel, accountStatus: s.accountStatus });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.email.trim()) return;
    try {
      if (editingId) {
        await updateStudent({ id: editingId, ...form }).unwrap();
      } else {
        await createStudent(form).unwrap();
      }
      reset();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    try { await deleteStudent(id).unwrap(); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Manage learner accounts and enrollment levels"
        actions={
          <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>
            New Student
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={reset}
        title={editingId ? 'Edit Student' : 'New Student'}
        footer={
          <>
            <Button variant="secondary" onClick={reset}>Cancel</Button>
            <Button onClick={handleSubmit} loading={isCreating}>
              {editingId ? 'Save Changes' : 'Create Student'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name">
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full Name" />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
          </Field>
          <Field label="Experience Level">
            <Select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
              <option>Fresher</option><option>Intermediate</option><option>Advanced</option>
            </Select>
          </Field>
          <Field label="Account Status" className="md:col-span-2">
            <Select value={form.accountStatus} onChange={(e) => setForm({ ...form, accountStatus: e.target.value })}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </Select>
          </Field>
        </div>
      </Modal>

      <div className="relative mb-3">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--bhn-text-soft)' }}
        />
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bhn-input"
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">No students found</p>
          <p className="bhn-empty-desc">Try a different name, email or experience level.</p>
        </div>
      ) : (
        <div className="bhn-table-wrap">
          <table className="bhn-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Phone</th>
                <th>Experience</th>
                <th>Enrollments</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{s.email}</div>
                  </td>
                  <td>{s.phone || '—'}</td>
                  <td>{s.experienceLevel}</td>
                  <td>{s.enrolledCount}</td>
                  <td><Badge tone={statusTone(s.accountStatus)}>{s.accountStatus}</Badge></td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="secondary" size="icon" onClick={() => handleEdit(s)} icon={<Edit size={14} />} aria-label="Edit" />
                      <Button variant="danger" size="icon" onClick={() => handleDelete(s.id)} icon={<Trash2 size={14} />} aria-label="Delete" />
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