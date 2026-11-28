"use client";

import { useState } from "react";
import { Check, CreditCard, Pencil, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Alert, Badge, Button, Modal, statusTone } from "@bandhan/ui";
import {
  useAddEventMilestoneMutation,
  useGetEventMilestonesQuery,
  useUpdateEventMilestoneMutation,
} from "@/store/api/eventOsApi";
import { Milestone } from "@/types/eventOs";
import { errorText, extractItems, formatDate, ResourceState } from "./eventOsUi";

interface Props {
  eventId: string;
}

interface MilestoneForm {
  vendorName: string;
  vendorId: string;
  title: string;
  amount: string;
  dueDate: string;
  proofUrl: string;
}

interface EditForm {
  status: string;
  paymentRef: string;
  proofUrl: string;
}

const emptyForm: MilestoneForm = { vendorName: "", vendorId: "", title: "", amount: "", dueDate: "", proofUrl: "" };
const emptyEdit: EditForm = { status: "pending", paymentRef: "", proofUrl: "" };

export default function MilestonesTab({ eventId }: Props) {
  const { data, isLoading, isError, error, refetch } = useGetEventMilestonesQuery(eventId, { skip: !eventId });
  const [addMilestone, { isLoading: adding }] = useAddEventMilestoneMutation();
  const [updateMilestone, { isLoading: updating }] = useUpdateEventMilestoneMutation();

  const milestones = extractItems<Milestone>(data, "milestones");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [form, setForm] = useState<MilestoneForm>(emptyForm);
  const [editForm, setEditForm] = useState<EditForm>(emptyEdit);

  const openAdd = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (milestone: Milestone) => {
    setEditing(milestone);
    setEditForm({
      status: milestone.status || "pending",
      paymentRef: milestone.paymentRef || "",
      proofUrl: milestone.proofUrl || "",
    });
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Milestone title is required.");
      return;
    }
    const amount = form.amount ? Number(form.amount) : 0;
    if (Number.isNaN(amount) || amount < 0) {
      toast.error("Amount must be a non-negative number.");
      return;
    }
    if (form.proofUrl && !/^https?:\/\//i.test(form.proofUrl.trim())) {
      toast.error("Proof URL must start with http:// or https://");
      return;
    }
    try {
      await addMilestone({
        eventId,
        data: {
          vendorId: form.vendorId.trim() || undefined,
          vendorName: form.vendorName.trim() || undefined,
          title: form.title.trim(),
          amount,
          dueDate: form.dueDate || undefined,
          proofUrl: form.proofUrl.trim() || undefined,
        },
      }).unwrap();
      toast.success("Milestone added.");
      setFormOpen(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editForm.status.trim()) {
      toast.error("Status is required.");
      return;
    }
    if (editForm.proofUrl && !/^https?:\/\//i.test(editForm.proofUrl.trim())) {
      toast.error("Proof URL must start with http:// or https://");
      return;
    }
    try {
      await updateMilestone({
        eventId,
        milestoneId: editing._id,
        data: {
          status: editForm.status.trim(),
          paymentRef: editForm.paymentRef.trim(),
          proofUrl: editForm.proofUrl.trim(),
        },
      }).unwrap();
      toast.success("Payment details updated.");
      setEditing(null);
      setEditForm(emptyEdit);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const total = milestones.reduce((sum, milestone) => sum + Number(milestone.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Milestone payments</h3>
          <p className="text-xs text-[var(--bhn-text-muted)]">
            {milestones.length} milestone{milestones.length === 1 ? "" : "s"} · ₹{total.toLocaleString("en-IN")} tracked.
          </p>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>
          Add milestone
        </Button>
      </div>

      <Alert tone="warning" title="Manual payment tracking">
        This tab records payment references manually. Bandhan does not hold funds in escrow here, and no payment is made
        by adding or updating a milestone.
      </Alert>

      <ResourceState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={milestones.length === 0}
        emptyTitle="No milestones yet"
        emptyDescription="Add a milestone to track a manual payment and its reference number."
        onRetry={() => refetch()}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {milestones.map((milestone) => (
            <div key={milestone._id} className="bhn-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--bhn-text)]">{milestone.title}</p>
                  <p className="text-xs text-[var(--bhn-text-muted)]">
                    {milestone.vendorName || "No vendor linked"}
                    {milestone.dueDate ? ` · Due ${formatDate(milestone.dueDate)}` : ""}
                  </p>
                </div>
                <Badge tone={statusTone(milestone.status)}>{milestone.status || "pending"}</Badge>
              </div>
              <p className="font-semibold text-[var(--bhn-text)]">₹{Number(milestone.amount || 0).toLocaleString("en-IN")}</p>
              {milestone.paymentRef ? (
                <p className="text-xs text-[var(--bhn-text-muted)]">Ref: {milestone.paymentRef}</p>
              ) : (
                <p className="text-xs text-[var(--bhn-text-muted)]">No payment reference recorded</p>
              )}
              {milestone.proofUrl ? (
                <a
                  href={milestone.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-xs text-[var(--bhn-brand-700)] underline"
                >
                  View proof
                </a>
              ) : null}
              <Button size="sm" variant="secondary" icon={<Pencil size={13} />} onClick={() => openEdit(milestone)}>
                Update payment
              </Button>
            </div>
          ))}
        </div>
      </ResourceState>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add milestone">
        <form onSubmit={submitAdd} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Title *</label>
            <input
              className="bhn-input w-full"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Vendor name</label>
              <input
                className="bhn-input w-full"
                value={form.vendorName}
                onChange={(e) => setForm((f) => ({ ...f, vendorName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Vendor ID</label>
              <input
                className="bhn-input w-full"
                value={form.vendorId}
                onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Amount (₹)</label>
              <input
                type="number"
                min={0}
                className="bhn-input w-full"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Due date</label>
              <input
                type="date"
                className="bhn-input w-full"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Proof URL</label>
            <input
              className="bhn-input w-full"
              value={form.proofUrl}
              onChange={(e) => setForm((f) => ({ ...f, proofUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <p className="text-xs text-[var(--bhn-text-muted)]">Adding a milestone does not make a payment.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={adding} icon={<CreditCard size={14} />}>
              Add milestone
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Update payment details"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="milestone-edit-form" loading={updating} icon={<Check size={14} />}>
              Save changes
            </Button>
          </div>
        }
      >
        <form id="milestone-edit-form" onSubmit={submitEdit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Status *</label>
            <select
              className="bhn-select w-full"
              value={editForm.status}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="released">Released</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Payment reference</label>
            <input
              className="bhn-input w-full"
              value={editForm.paymentRef}
              onChange={(e) => setEditForm((f) => ({ ...f, paymentRef: e.target.value }))}
              placeholder="Manual reference number"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Proof URL</label>
            <input
              className="bhn-input w-full"
              value={editForm.proofUrl}
              onChange={(e) => setEditForm((f) => ({ ...f, proofUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <p className="text-xs text-[var(--bhn-text-muted)]">No escrow funds are held by Bandhan in this tab.</p>
        </form>
      </Modal>
    </div>
  );
}
