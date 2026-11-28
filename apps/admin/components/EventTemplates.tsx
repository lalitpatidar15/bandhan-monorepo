'use client';

import { useMemo, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge, Button, Field, Input, Modal, PageHeader, SearchInput, Select, Textarea, statusTone } from '@bandhan/ui';
import {
  type AdminEventTemplate,
  type AdminEventTemplateInput,
  useCreateEventTemplateMutation,
  useDeleteEventTemplateMutation,
  useGetEventTemplatesQuery,
  useUpdateEventTemplateMutation,
} from '@/lib/adminApi';

type PhaseDraft = { name: string; status: string; progress: string };
type TaskDraft = { title: string; priority: string; status: string; vendor: string; phase: string };
type TemplateForm = {
  name: string;
  category: string;
  description: string;
  phases: PhaseDraft[];
  tasks: TaskDraft[];
  budgetCategories: string;
  checklist: string;
  invitationMessage: string;
  isActive: boolean;
};

const emptyForm: TemplateForm = {
  name: '',
  category: '',
  description: '',
  phases: [],
  tasks: [],
  budgetCategories: '',
  checklist: '',
  invitationMessage: '',
  isActive: true,
};

const splitList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

const formatDate = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '—' : date.toLocaleDateString();
};

const toPayload = (form: TemplateForm): AdminEventTemplateInput => ({
  name: form.name.trim(),
  category: form.category.trim(),
  description: form.description.trim(),
  phases: form.phases.map((phase) => ({
    name: phase.name.trim(),
    status: phase.status.trim(),
    progress: Math.min(100, Math.max(0, Number(phase.progress) || 0)),
  })),
  tasks: form.tasks.map((task) => ({
    title: task.title.trim(),
    priority: task.priority.trim(),
    status: task.status.trim(),
    vendor: task.vendor.trim(),
    phase: task.phase.trim(),
  })),
  budgetCategories: splitList(form.budgetCategories),
  checklist: splitList(form.checklist),
  invitationMessage: form.invitationMessage.trim(),
  isActive: form.isActive,
});

export default function EventTemplates() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);

  const { data: templates = [], isLoading, isError, refetch } = useGetEventTemplatesQuery();
  const [createEventTemplate, { isLoading: isCreating }] = useCreateEventTemplateMutation();
  const [updateEventTemplate, { isLoading: isUpdating }] = useUpdateEventTemplateMutation();
  const [deleteEventTemplate] = useDeleteEventTemplateMutation();

  const categories = useMemo(() => Array.from(new Set(templates.map((template) => template.category).filter(Boolean))).sort(), [templates]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesQuery = !query || `${template.name} ${template.category} ${template.description} ${template.invitationMessage}`.toLowerCase().includes(query);
      const matchesCategory = !categoryFilter || template.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [templates, search, categoryFilter]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (template: AdminEventTemplate) => {
    setForm({
      name: template.name,
      category: template.category,
      description: template.description,
      phases: template.phases.map((phase) => ({ name: phase.name, status: phase.status, progress: String(phase.progress) })),
      tasks: template.tasks.map((task) => ({ ...task })),
      budgetCategories: template.budgetCategories.join(', '),
      checklist: template.checklist.join(', '),
      invitationMessage: template.invitationMessage,
      isActive: template.isActive,
    });
    setEditingId(template._id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('A template name is required');
      return;
    }
    const body = toPayload(form);
    try {
      if (editingId) await updateEventTemplate({ id: editingId, ...body }).unwrap();
      else await createEventTemplate(body).unwrap();
      toast.success(editingId ? 'Event template updated' : 'Event template created');
      reset();
    } catch {
      toast.error('Could not save event template');
    }
  };

  const handleDelete = async (template: AdminEventTemplate) => {
    if (!window.confirm(`Delete “${template.name}”?`)) return;
    try {
      await deleteEventTemplate(template._id).unwrap();
      toast.success('Event template deleted');
    } catch {
      toast.error('Could not delete event template');
    }
  };

  const updatePhase = (index: number, patch: Partial<PhaseDraft>) => setForm((previous) => ({
    ...previous,
    phases: previous.phases.map((phase, position) => position === index ? { ...phase, ...patch } : phase),
  }));
  const removePhase = (index: number) => setForm((previous) => ({
    ...previous,
    phases: previous.phases.filter((_, position) => position !== index),
  }));
  const updateTask = (index: number, patch: Partial<TaskDraft>) => setForm((previous) => ({
    ...previous,
    tasks: previous.tasks.map((task, position) => position === index ? { ...task, ...patch } : task),
  }));
  const removeTask = (index: number) => setForm((previous) => ({
    ...previous,
    tasks: previous.tasks.filter((_, position) => position !== index),
  }));

  return (
    <div>
      <PageHeader
        title="Event templates"
        subtitle="Manage phase, task, budget and invitation playbooks"
        actions={<Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} icon={<Plus size={16} />}>New template</Button>}
      />

      <Modal
        open={showForm}
        onClose={reset}
        title={editingId ? 'Edit event template' : 'New event template'}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={reset}>Cancel</Button>
            <Button onClick={handleSubmit} loading={isCreating || isUpdating}>{editingId ? 'Save changes' : 'Create template'}</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Name" required><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Wedding planning" /></Field>
            <Field label="Category"><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. Wedding, Corporate" /></Field>
            <Field label="Description" className="md:col-span-2"><Textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What this template is for" /></Field>
          </div>

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Phases</h3>
              <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => setForm((previous) => ({ ...previous, phases: [...previous.phases, { name: '', status: '', progress: '0' }] }))}>Add phase</Button>
            </div>
            {form.phases.length === 0 ? (
              <p className="text-xs text-[var(--bhn-text-muted)]">No phases yet.</p>
            ) : (
              <div className="space-y-2">
                {form.phases.map((phase, index) => (
                  <div key={index} className="grid grid-cols-1 gap-2 rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-3 md:grid-cols-[2fr_1.5fr_1fr_auto] md:items-end">
                    <Field label={`Phase ${index + 1} name`}><Input value={phase.name} onChange={(event) => updatePhase(index, { name: event.target.value })} placeholder="Venue selection" /></Field>
                    <Field label="Status"><Input value={phase.status} onChange={(event) => updatePhase(index, { status: event.target.value })} placeholder="pending" /></Field>
                    <Field label="Progress %"><Input type="number" min={0} max={100} value={phase.progress} onChange={(event) => updatePhase(index, { progress: event.target.value })} /></Field>
                    <Button size="icon" variant="danger" onClick={() => removePhase(index)} aria-label={`Remove phase ${index + 1}`} icon={<Trash2 size={14} />} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Tasks</h3>
              <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => setForm((previous) => ({ ...previous, tasks: [...previous.tasks, { title: '', priority: '', status: '', vendor: '', phase: '' }] }))}>Add task</Button>
            </div>
            {form.tasks.length === 0 ? (
              <p className="text-xs text-[var(--bhn-text-muted)]">No tasks yet.</p>
            ) : (
              <div className="space-y-2">
                {form.tasks.map((task, index) => (
                  <div key={index} className="grid grid-cols-1 gap-2 rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1.5fr_1fr_auto] xl:items-end">
                    <Field label={`Task ${index + 1} title`}><Input value={task.title} onChange={(event) => updateTask(index, { title: event.target.value })} placeholder="Book caterer" /></Field>
                    <Field label="Priority"><Input value={task.priority} onChange={(event) => updateTask(index, { priority: event.target.value })} placeholder="high" /></Field>
                    <Field label="Status"><Input value={task.status} onChange={(event) => updateTask(index, { status: event.target.value })} placeholder="todo" /></Field>
                    <Field label="Vendor"><Input value={task.vendor} onChange={(event) => updateTask(index, { vendor: event.target.value })} placeholder="Vendor name" /></Field>
                    <Field label="Phase"><Input value={task.phase} onChange={(event) => updateTask(index, { phase: event.target.value })} placeholder="Planning" /></Field>
                    <Button size="icon" variant="danger" onClick={() => removeTask(index)} aria-label={`Remove task ${index + 1}`} icon={<Trash2 size={14} />} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Budget categories" hint="Comma-separated"><Input value={form.budgetCategories} onChange={(event) => setForm({ ...form, budgetCategories: event.target.value })} placeholder="Venue, Catering, Decor" /></Field>
            <Field label="Checklist items" hint="Comma-separated"><Input value={form.checklist} onChange={(event) => setForm({ ...form, checklist: event.target.value })} placeholder="Guest list, Invites, Menu" /></Field>
            <Field label="Invitation message" className="md:col-span-2"><Textarea rows={3} value={form.invitationMessage} onChange={(event) => setForm({ ...form, invitationMessage: event.target.value })} placeholder="Message sent with invitations" /></Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4" style={{ accentColor: 'var(--bhn-brand-600)' }} />
            Template is active
          </label>
        </div>
      </Modal>

      <div className="card mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search templates..." /></div>
        <Select className="w-full md:w-44" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </Select>
      </div>

      {isError ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">Could not load event templates</p>
          <p className="bhn-empty-desc">Please try again.</p>
          <Button className="mt-3" variant="secondary" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className="card py-8 text-center text-sm text-[var(--bhn-text-muted)]">Loading event templates...</div>
      ) : filtered.length === 0 ? (
        <div className="bhn-empty">
          <p className="bhn-empty-title">No event templates found</p>
          <p className="bhn-empty-desc">Create one or adjust your filters.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="admin-table w-full">
            <thead><tr><th>Template</th><th>Category</th><th>Phases</th><th>Tasks</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((template) => (
                <tr key={template._id}>
                  <td className="font-medium text-sm">
                    {template.name}
                    {template.description ? <p className="mt-0.5 text-xs font-normal text-[var(--bhn-text-muted)]">{template.description}</p> : null}
                  </td>
                  <td>{template.category || '—'}</td>
                  <td>{template.phases.length}</td>
                  <td>{template.tasks.length}</td>
                  <td><Badge tone={statusTone(template.isActive ? 'active' : 'inactive')}>{template.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td>{formatDate(template.createdAt)}</td>
                  <td>
                    <div className="flex gap-1">
                      <Button size="icon" variant="secondary" onClick={() => handleEdit(template)} aria-label={`Edit ${template.name}`} icon={<Edit size={14} />} />
                      <Button size="icon" variant="danger" onClick={() => handleDelete(template)} aria-label={`Delete ${template.name}`} icon={<Trash2 size={14} />} />
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
