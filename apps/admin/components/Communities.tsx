'use client';

import { useMemo, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge, Button, Field, Input, Modal, PageHeader, SearchInput, Select, Textarea, statusTone } from '@bandhan/ui';
import {
  type AdminCommunity,
  useCreateCommunityMutation,
  useDeleteCommunityMutation,
  useGetCommunitiesQuery,
  useUpdateCommunityMutation,
} from '@/lib/adminApi';

type CommunityForm = {
  name: string;
  description: string;
  coverImage: string;
  category: string;
  members: string;
  status: string;
  isActive: boolean;
};

const emptyForm: CommunityForm = { name: '', description: '', coverImage: '', category: '', members: '0', status: 'active', isActive: true };

export default function Communities() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CommunityForm>(emptyForm);

  const { data: communities = [], isLoading, isError, refetch } = useGetCommunitiesQuery();
  const [createCommunity, { isLoading: isCreating }] = useCreateCommunityMutation();
  const [updateCommunity, { isLoading: isUpdating }] = useUpdateCommunityMutation();
  const [deleteCommunity] = useDeleteCommunityMutation();

  const categories = useMemo(() => Array.from(new Set(communities.map((community) => community.category).filter(Boolean))).sort(), [communities]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return communities.filter((community) => {
      const matchesQuery = !query || `${community.name} ${community.description} ${community.category}`.toLowerCase().includes(query);
      const matchesCategory = !categoryFilter || community.category === categoryFilter;
      const matchesStatus = !statusFilter || community.status.toLowerCase() === statusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [communities, search, categoryFilter, statusFilter]);

  const reset = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleEdit = (community: AdminCommunity) => {
    setForm({
      name: community.name,
      description: community.description,
      coverImage: community.coverImage,
      category: community.category,
      members: String(community.members),
      status: community.status,
      isActive: community.isActive,
    });
    setEditingId(community._id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('A community name is required');
      return;
    }
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      coverImage: form.coverImage.trim(),
      category: form.category.trim(),
      members: Math.max(0, Number(form.members) || 0),
      status: form.status,
      isActive: form.isActive,
    };
    try {
      if (editingId) await updateCommunity({ id: editingId, ...body }).unwrap();
      else await createCommunity(body).unwrap();
      toast.success(editingId ? 'Community updated' : 'Community created');
      reset();
    } catch {
      toast.error('Could not save community');
    }
  };

  const handleDelete = async (community: AdminCommunity) => {
    if (!confirm(`Delete “${community.name}”?`)) return;
    try {
      await deleteCommunity(community._id).unwrap();
      toast.success('Community deleted');
    } catch {
      toast.error('Could not delete community');
    }
  };

  return (
    <div>
      <PageHeader
        title="Communities"
        subtitle="Manage community spaces and member groups"
        actions={<Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>New community</Button>}
      />

      <Modal
        open={showForm}
        onClose={reset}
        title={editingId ? 'Edit community' : 'New community'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={reset}>Cancel</Button>
            <Button onClick={handleSubmit} loading={isCreating || isUpdating}>{editingId ? 'Save changes' : 'Create community'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Name" required><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Community name" /></Field>
          <Field label="Category"><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. Weddings, Decor" /></Field>
          <Field label="Cover image URL" className="md:col-span-2"><Input value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} placeholder="https://..." /></Field>
          <Field label="Description" className="md:col-span-2"><Textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What is this community about?" /></Field>
          <Field label="Members"><Input type="number" min={0} value={form.members} onChange={(event) => setForm({ ...form, members: event.target.value })} /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </Select>
          </Field>
          <label className="flex items-center gap-2 md:col-span-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4" style={{ accentColor: 'var(--bhn-brand-600)' }} />
            Visible on the community directory
          </label>
        </div>
      </Modal>

      <div className="card mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search communities..." /></div>
        <Select className="w-full md:w-44" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </Select>
        <Select className="w-full md:w-44" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </Select>
      </div>

      {isError ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">Could not load communities</p>
          <p className="bhn-empty-desc">Please try again.</p>
          <Button className="mt-3" variant="secondary" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className="card py-8 text-center text-sm text-[var(--bhn-text-muted)]">Loading communities...</div>
      ) : filtered.length === 0 ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">No communities found</p>
          <p className="bhn-empty-desc">Create one or adjust your filters.</p>
        </div>
      ) : (
        <div className="bhn-table-wrap">
          <table className="bhn-table w-full">
            <thead>
              <tr>
                <th>Community</th>
                <th>Category</th>
                <th>Members</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((community) => (
                <tr key={community._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--bhn-surface-200)]">
                        {community.coverImage ? <img src={community.coverImage} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-[var(--bhn-text-muted)]">—</span>}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{community.name}</div>
                        <div className="max-w-xs truncate text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{community.description || 'No description'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{community.category || '—'}</td>
                  <td className="text-sm">{community.members.toLocaleString('en-IN')}</td>
                  <td><Badge tone={statusTone(community.isActive ? community.status : 'inactive')}>{community.isActive ? community.status : 'hidden'}</Badge></td>
                  <td className="text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{community.createdAt ? new Date(community.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="secondary" onClick={() => handleEdit(community)} aria-label={`Edit ${community.name}`} icon={<Edit size={14} />} />
                      <Button size="icon" variant="danger" onClick={() => handleDelete(community)} aria-label={`Delete ${community.name}`} icon={<Trash2 size={14} />} />
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
