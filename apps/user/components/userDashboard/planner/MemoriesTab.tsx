"use client";

import { useState } from "react";
import { Camera, Check, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Modal } from "@bandhan/ui";
import {
  useAddEventMemoryMutation,
  useDeleteEventMemoryMutation,
  useGetEventMemoriesQuery,
} from "@/store/api/eventOsApi";
import { EventMemory } from "@/types/eventOs";
import { errorText, extractItems, formatDate, ResourceState } from "./eventOsUi";

interface Props {
  eventId: string;
}

interface MemoryForm {
  title: string;
  description: string;
  images: string;
  memoryDate: string;
}

const emptyForm: MemoryForm = { title: "", description: "", images: "", memoryDate: "" };

export default function MemoriesTab({ eventId }: Props) {
  const { data, isLoading, isError, error, refetch } = useGetEventMemoriesQuery(eventId, { skip: !eventId });
  const [addMemory, { isLoading: adding }] = useAddEventMemoryMutation();
  const [deleteMemory, { isLoading: deleting }] = useDeleteEventMemoryMutation();

  const memories = extractItems<EventMemory>(data, "memories");
  const [formOpen, setFormOpen] = useState(false);
  const [removing, setRemoving] = useState<EventMemory | null>(null);
  const [form, setForm] = useState<MemoryForm>(emptyForm);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Memory title is required.");
      return;
    }
    const images = form.images
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter(Boolean);
    if (images.some((url) => !/^https?:\/\//i.test(url))) {
      toast.error("Image URLs must start with http:// or https://");
      return;
    }
    try {
      await addMemory({
        eventId,
        data: {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          images,
          memoryDate: form.memoryDate || undefined,
        },
      }).unwrap();
      toast.success("Memory added.");
      setFormOpen(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      await deleteMemory({ eventId, memoryId: removing._id }).unwrap();
      toast.success("Memory deleted.");
      setRemoving(null);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Memories</h3>
          <p className="text-xs text-[var(--bhn-text-muted)]">
            Add real photos and notes from the event. Editing an existing memory is not supported by the API.
          </p>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={() => setFormOpen(true)}>
          Add memory
        </Button>
      </div>

      <ResourceState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={memories.length === 0}
        emptyTitle="No memories yet"
        emptyDescription="Add a title and image links to start this event's memory collection."
        onRetry={() => refetch()}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => (
            <div key={memory._id} className="bhn-card p-4 space-y-2">
              {memory.images && memory.images.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto">
                  {memory.images.map((url, index) => (
                    // Image URLs come from the live API record, not bundled assets.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt={`${memory.title} memory ${index + 1}`}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-lg bg-[var(--bhn-surface-3)] text-[var(--bhn-text-muted)]">
                  <Camera size={22} />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--bhn-text)]">{memory.title}</p>
                  <p className="text-xs text-[var(--bhn-text-muted)]">
                    {memory.memoryDate ? formatDate(memory.memoryDate) : "No memory date"}
                  </p>
                </div>
                <Button size="icon" variant="ghost" aria-label={`Delete ${memory.title}`} onClick={() => setRemoving(memory)}>
                  <Trash2 size={13} />
                </Button>
              </div>
              {memory.description ? <p className="text-xs text-[var(--bhn-text-soft)]">{memory.description}</p> : null}
            </div>
          ))}
        </div>
      </ResourceState>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add memory">
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Title *</label>
            <input
              className="bhn-input w-full"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Description</label>
            <textarea
              className="bhn-textarea w-full"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Image URLs</label>
            <textarea
              className="bhn-textarea w-full"
              rows={3}
              placeholder="One URL per line"
              value={form.images}
              onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Memory date</label>
            <input
              type="date"
              className="bhn-input w-full"
              value={form.memoryDate}
              onChange={(e) => setForm((f) => ({ ...f, memoryDate: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={adding} icon={<Check size={14} />}>
              Add memory
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Delete memory"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} icon={<Trash2 size={14} />} onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--bhn-text-muted)]">
          Delete <span className="font-semibold text-[var(--bhn-text)]">{removing?.title}</span>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
