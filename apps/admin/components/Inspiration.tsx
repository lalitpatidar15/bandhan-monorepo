'use client';

import { useMemo, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge, Button, Field, Input, Modal, PageHeader, SearchInput, Select, Textarea, statusTone } from '@bandhan/ui';
import {
  type AdminInspiration,
  useCreateInspirationMutation,
  useDeleteInspirationMutation,
  useGetInspirationQuery,
  useUpdateInspirationMutation,
} from '@/lib/adminApi';

type InspirationForm = {
  title: string;
  category: string;
  image: string;
  images: string;
  description: string;
  tags: string;
  isActive: boolean;
  publishedAt: string;
};

const emptyForm: InspirationForm = { title: '', category: '', image: '', images: '', description: '', tags: '', isActive: true, publishedAt: '' };

const splitList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

export default function Inspiration() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InspirationForm>(emptyForm);

  const { data: stories = [], isLoading, isError, refetch } = useGetInspirationQuery();
  const [createInspiration, { isLoading: isCreating }] = useCreateInspirationMutation();
  const [updateInspiration, { isLoading: isUpdating }] = useUpdateInspirationMutation();
  const [deleteInspiration] = useDeleteInspirationMutation();

  const categories = useMemo(() => Array.from(new Set(stories.map((story) => story.category).filter(Boolean))).sort(), [stories]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stories.filter((story) => {
      const matchesQuery = !query || `${story.title} ${story.description} ${story.tags.join(' ')}`.toLowerCase().includes(query);
      const matchesCategory = !categoryFilter || story.category === categoryFilter;
      const matchesStatus = !statusFilter || (statusFilter === 'active' ? story.isActive : !story.isActive);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [stories, search, categoryFilter, statusFilter]);

  const reset = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleEdit = (story: AdminInspiration) => {
    setForm({
      title: story.title,
      category: story.category,
      image: story.image,
      images: story.images.join(', '),
      description: story.description,
      tags: story.tags.join(', '),
      isActive: story.isActive,
      publishedAt: story.publishedAt ? story.publishedAt.split('T')[0] : '',
    });
    setEditingId(story._id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('A title is required');
      return;
    }
    const body = {
      title: form.title.trim(),
      category: form.category.trim(),
      image: form.image.trim(),
      images: splitList(form.images),
      description: form.description.trim(),
      tags: splitList(form.tags),
      isActive: form.isActive,
      publishedAt: form.publishedAt || undefined,
    };
    try {
      if (editingId) await updateInspiration({ id: editingId, ...body }).unwrap();
      else await createInspiration(body).unwrap();
      toast.success(editingId ? 'Story updated' : 'Story created');
      reset();
    } catch {
      toast.error('Could not save story');
    }
  };

  const handleDelete = async (story: AdminInspiration) => {
    if (!confirm(`Delete “${story.title}”?`)) return;
    try {
      await deleteInspiration(story._id).unwrap();
      toast.success('Story deleted');
    } catch {
      toast.error('Could not delete story');
    }
  };

  return (
    <div>
      <PageHeader
        title="Wedding inspiration"
        subtitle="Curate inspiration stories and gallery imagery"
        actions={<Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>New story</Button>}
      />

      <Modal
        open={showForm}
        onClose={reset}
        title={editingId ? 'Edit story' : 'New story'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={reset}>Cancel</Button>
            <Button onClick={handleSubmit} loading={isCreating || isUpdating}>{editingId ? 'Save changes' : 'Create story'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Title" required><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Story title" /></Field>
          <Field label="Category"><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. Decor, Photography" /></Field>
          <Field label="Cover image URL" className="md:col-span-2"><Input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="https://..." /></Field>
          <Field label="Gallery image URLs" hint="Comma-separated" className="md:col-span-2"><Input value={form.images} onChange={(event) => setForm({ ...form, images: event.target.value })} placeholder="https://..., https://..." /></Field>
          <Field label="Description" className="md:col-span-2"><Textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short description" /></Field>
          <Field label="Tags" hint="Comma-separated"><Input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="outdoor, floral" /></Field>
          <Field label="Publish date"><Input type="date" value={form.publishedAt} onChange={(event) => setForm({ ...form, publishedAt: event.target.value })} /></Field>
          <label className="flex items-center gap-2 md:col-span-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4" style={{ accentColor: 'var(--bhn-brand-600)' }} />
            Published on the inspiration feed
          </label>
        </div>
      </Modal>

      <div className="card mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search stories or tags..." /></div>
        <Select className="w-full md:w-44" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </Select>
        <Select className="w-full md:w-44" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="active">Published</option>
          <option value="inactive">Hidden</option>
        </Select>
      </div>

      {isError ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">Could not load inspiration stories</p>
          <p className="bhn-empty-desc">Please try again.</p>
          <Button className="mt-3" variant="secondary" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className="card py-8 text-center text-sm text-[var(--bhn-text-muted)]">Loading stories...</div>
      ) : filtered.length === 0 ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">No stories found</p>
          <p className="bhn-empty-desc">Create one or adjust your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((story) => (
            <div key={story._id} className="card overflow-hidden p-0">
              <div className="relative h-40 bg-[var(--bhn-surface-200)]">
                {story.image ? <img src={story.image} alt={story.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-[var(--bhn-text-muted)]">No cover image</div>}
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button size="icon" variant="secondary" onClick={() => handleEdit(story)} aria-label={`Edit ${story.title}`} icon={<Edit size={14} />} />
                  <Button size="icon" variant="danger" onClick={() => handleDelete(story)} aria-label={`Delete ${story.title}`} icon={<Trash2 size={14} />} />
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold">{story.title}</h3>
                  <Badge tone={statusTone(story.isActive ? 'active' : 'inactive')}>{story.isActive ? 'Published' : 'Hidden'}</Badge>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{story.category || 'Uncategorized'}{story.publishedAt ? ` · ${new Date(story.publishedAt).toLocaleDateString()}` : ''}</p>
                <p className="mt-2 line-clamp-2 text-xs" style={{ color: 'var(--bhn-text-soft)' }}>{story.description || 'No description'}</p>
                {story.tags.length > 0 ? <div className="mt-2 flex flex-wrap gap-1">{story.tags.map((tag) => <Badge key={tag} tone="brand">{tag}</Badge>)}</div> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
