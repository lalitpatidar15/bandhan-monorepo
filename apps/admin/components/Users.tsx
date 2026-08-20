'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useCreateUserMutation, useDeleteUserMutation, useGetUsersQuery, useUpdateUserMutation } from '@/lib/adminApi';
import { PageHeader, Button, Badge, statusTone, Modal, Field, Input, Select } from '@bandhan/ui';

type User = import('@/lib/adminApi').AdminUser;

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'buyer',
    status: 'active' as User['status'],
  });
  const { data: users = [] } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', role: 'buyer', status: 'active' });
    setEditingUserId(null);
    setShowForm(false);
  };

  const handleEdit = (user: User) => {
    setForm({ name: user.name, email: user.email, phone: '', role: user.role, status: user.status });
    setEditingUserId(user.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      if (editingUserId) {
        await updateUser({ id: editingUserId, fullName: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: form.role, status: form.status }).unwrap();
      } else {
        await createUser({ fullName: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: form.role, status: form.status }).unwrap();
      }
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try { await deleteUser(id).unwrap(); } catch (error) { console.error('Error deleting user:', error); }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage marketplace, learner and job seeker accounts"
        actions={
          <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>
            Add User
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editingUserId ? 'Edit User' : 'Add User'}
        footer={
          <>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit} loading={isCreating || isUpdating}>
              {editingUserId ? 'Save Changes' : 'Create User'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full name">
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
          </Field>
          <Field label="Role">
            <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="eventOwner">Event Owner</option>
              <option value="learner">Learner</option>
              <option value="jobSeeker">Job Seeker</option>
            </Select>
          </Field>
          <Field label="Status" className="md:col-span-2">
            <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as User['status'] })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </div>
      </Modal>

      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--bhn-text-soft)' }}
        />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bhn-input"
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">No users found</p>
          <p className="bhn-empty-desc">Try a different name or email.</p>
        </div>
      ) : (
        <div className="bhn-table-wrap">
          <table className="bhn-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.name}</td>
                  <td>{user.email}</td>
                  <td><Badge tone="brand">{user.role}</Badge></td>
                  <td><Badge tone={statusTone(user.status)}>{user.status}</Badge></td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="secondary" size="icon" onClick={() => handleEdit(user)} icon={<Edit size={14} />} aria-label="Edit" />
                      <Button variant="danger" size="icon" onClick={() => handleDelete(user.id)} icon={<Trash2 size={14} />} aria-label="Delete" />
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