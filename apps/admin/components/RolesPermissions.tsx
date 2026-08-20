'use client';

import { useState } from 'react';
import {
  useCreateRolePermissionMutation,
  useDeleteRolePermissionMutation,
  useGetRolePermissionsQuery,
  useUpdateRolePermissionMutation,
} from '@/lib/adminApi';

export default function RolesPermissions() {
  const { data: roles = [] } = useGetRolePermissionsQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRolePermissionMutation();
  const [updateRole] = useUpdateRolePermissionMutation();
  const [deleteRole] = useDeleteRolePermissionMutation();

  const [form, setForm] = useState({ role: '', description: '', permissions: '' });

  const submit = async () => {
    if (!form.role.trim()) return;
    try {
      await createRole({
        role: form.role.trim().toLowerCase(),
        description: form.description.trim(),
        permissions: form.permissions.split(',').map((item) => item.trim()).filter(Boolean),
      }).unwrap();
      setForm({ role: '', description: '', permissions: '' });
    } catch (error) {
      console.error('Unable to create role:', error);
    }
  };

  const togglePermission = async (id: string, permissions: string[], permission: string) => {
    const exists = permissions.includes(permission);
    const next = exists ? permissions.filter((item) => item !== permission) : [...permissions, permission];

    try {
      await updateRolePermission({ id, permissions: next }).unwrap();
    } catch (error) {
      console.error('Unable to update role permissions:', error);
    }
  };

  const updateRolePermission = updateRole;

  return (
    <div>
      <div className="mb-4">
        <h1 className="admin-page-heading">Roles & Permissions</h1>
        <p className="admin-page-sub">Manage role policies for admin operations.</p>
      </div>

      <div className="card mb-6">
        <h2 className="mb-4 text-lg font-semibold">Create Role</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} placeholder="role (example: auditor)" className="admin-input text-sm" />
          <input value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="description" className="admin-input text-sm" />
          <input value={form.permissions} onChange={(event) => setForm((prev) => ({ ...prev, permissions: event.target.value }))} placeholder="permissions comma separated" className="admin-input text-sm" />
        </div>
        <button onClick={submit} disabled={isCreating} className="mt-3 admin-btn admin-btn-primary disabled:opacity-60 text-sm">
          {isCreating ? 'Creating...' : 'Create Role'}
        </button>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <div key={role.id} className="card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">{role.role}</h3>
                <p className="text-xs text-gray-500">{role.description || 'No description'}</p>
              </div>
              {!role.isSystem && (
                <button onClick={() => deleteRole(role.id)} className="admin-btn admin-btn-danger text-xs">Delete</button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {['users.read', 'users.write', 'support.read', 'support.write', 'moderation.all', 'settings.write'].map((permission) => {
                const enabled = role.permissions.includes(permission);
                return (
                  <button
                    key={permission}
                    onClick={() => togglePermission(role.id, role.permissions, permission)}
                    className={`admin-badge ${enabled ? 'admin-badge-active' : 'admin-badge-inactive'}`}
                  >
                    {permission}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
