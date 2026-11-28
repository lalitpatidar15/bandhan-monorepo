"use client";

import { useState } from "react";
import { AlertTriangle, Check, ClipboardList, Pencil, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Badge, Button, Modal } from "@bandhan/ui";
import {
  useGetEventDayQuery,
  useReportEventDayIssueMutation,
  useUpdateEventDayIssueMutation,
} from "@/store/api/eventOsApi";
import { EventIssue } from "@/types/eventOs";
import { errorText, extractItem, ResourceState } from "./eventOsUi";

interface Props {
  eventId: string;
}

interface IssueForm {
  type: string;
  title: string;
  description: string;
  assignedTo: string;
}

const emptyForm: IssueForm = { type: "vendor", title: "", description: "", assignedTo: "" };

export default function EventDayTab({ eventId }: Props) {
  const { data, isLoading, isError, error, refetch } = useGetEventDayQuery(eventId, { skip: !eventId });
  const [reportIssue, { isLoading: reporting }] = useReportEventDayIssueMutation();
  const [updateIssue, { isLoading: updating }] = useUpdateEventDayIssueMutation();

  const summary = extractItem<{
    issues?: EventIssue[];
    vendors?: Array<{ name?: string; category?: string; status?: string }>;
    venueBookings?: Array<{ name?: string; status?: string }>;
    guests?: { invited?: number; attending?: number; checkedIn?: number };
    tasks?: Array<{ title?: string; status?: string; priority?: string }>;
  }>(data);

  const issues = summary?.issues || [];
  const vendors = summary?.vendors || [];
  const venueBookings = summary?.venueBookings || [];
  const tasks = summary?.tasks || [];
  const guests = summary?.guests || {};

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventIssue | null>(null);
  const [form, setForm] = useState<IssueForm>(emptyForm);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (issue: EventIssue) => {
    setEditing(issue);
    setForm({
      type: issue.type || "vendor",
      title: issue.title || "",
      description: issue.description || "",
      assignedTo: issue.assignedTo || "",
    });
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Issue title is required.");
      return;
    }
    if (!editing && !form.type.trim()) {
      toast.error("Issue type is required.");
      return;
    }
    const payload = {
      title: form.title.trim(),
      type: form.type.trim(),
      description: form.description.trim(),
      assignedTo: form.assignedTo.trim(),
    };
    try {
      if (editing) {
        await updateIssue({
          eventId,
          issueId: editing._id,
          data: {
            title: payload.title,
            description: payload.description,
            assignedTo: payload.assignedTo,
          },
        }).unwrap();
        toast.success("Issue updated.");
      } else {
        await reportIssue({ eventId, data: payload }).unwrap();
        toast.success("Issue reported.");
      }
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const markResolved = async (issue: EventIssue) => {
    try {
      await updateIssue({ eventId, issueId: issue._id, data: { status: "resolved" } }).unwrap();
      toast.success("Issue marked resolved.");
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Event day</h3>
          <p className="text-xs text-[var(--bhn-text-muted)]">
            Live day-of snapshot and issue tracking for this event.
          </p>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>
          Report issue
        </Button>
      </div>

      <ResourceState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={false}
        emptyTitle=""
        onRetry={() => refetch()}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="bhn-card p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--bhn-text-muted)]">Invited</p>
            <p className="mt-1 text-xl font-bold text-[var(--bhn-text)]">{guests.invited ?? 0}</p>
          </div>
          <div className="bhn-card p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--bhn-text-muted)]">Attending</p>
            <p className="mt-1 text-xl font-bold text-[var(--bhn-text)]">{guests.attending ?? 0}</p>
          </div>
          <div className="bhn-card p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--bhn-text-muted)]">Checked in</p>
            <p className="mt-1 text-xl font-bold text-[var(--bhn-text)]">{guests.checkedIn ?? 0}</p>
          </div>
        </div>

        <div className="bhn-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[var(--bhn-text)]" />
            <h4 className="font-semibold text-[var(--bhn-text)]">Reported issues</h4>
          </div>
          {issues.length === 0 ? (
            <p className="text-sm text-[var(--bhn-text-muted)]">No issues reported for this event yet.</p>
          ) : (
            <div className="space-y-2">
              {issues.map((issue) => (
                <div
                  key={issue._id}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-[var(--bhn-surface-2)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[var(--bhn-text)]">{issue.title}</p>
                      {issue.status ? <Badge tone={issue.status === "resolved" ? "success" : "warning"}>{issue.status}</Badge> : null}
                    </div>
                    <p className="text-xs text-[var(--bhn-text-muted)]">
                      {issue.type || "issue"}
                      {issue.assignedTo ? ` · Assigned to ${issue.assignedTo}` : ""}
                    </p>
                    {issue.description ? <p className="mt-1 text-xs text-[var(--bhn-text-soft)]">{issue.description}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" icon={<Pencil size={13} />} onClick={() => openEdit(issue)}>
                      Edit
                    </Button>
                    {issue.status !== "resolved" ? (
                      <Button size="sm" variant="soft" icon={<Check size={13} />} onClick={() => markResolved(issue)}>
                        Resolve
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <ListCard
            icon={<ClipboardList size={15} />}
            title="Vendors"
            items={vendors.map((vendor) => `${vendor.name || "Vendor"}${vendor.category ? ` · ${vendor.category}` : ""}`)}
            emptyText="No vendors on this event."
          />
          <ListCard
            icon={<ClipboardList size={15} />}
            title="Venue bookings"
            items={venueBookings.map((booking) => booking.name || "Venue booking")}
            emptyText="No venue bookings recorded."
          />
          <ListCard
            icon={<ClipboardList size={15} />}
            title="Tasks"
            items={tasks.map((task) => `${task.title || "Task"}${task.status ? ` · ${task.status}` : ""}`)}
            emptyText="No tasks recorded."
          />
        </div>
      </ResourceState>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit issue" : "Report an issue"}>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Type *</label>
            <select
              className="bhn-select w-full"
              value={form.type}
              disabled={Boolean(editing)}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="vendor">Vendor</option>
              <option value="venue">Venue</option>
              <option value="guest">Guest</option>
              <option value="logistics">Logistics</option>
              <option value="other">Other</option>
            </select>
          </div>
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
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Assigned to</label>
            <input
              className="bhn-input w-full"
              value={form.assignedTo}
              onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={reporting || updating} icon={<Check size={14} />}>
              {editing ? "Save issue" : "Report issue"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ListCard({
  icon,
  title,
  items,
  emptyText,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="bhn-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-semibold text-[var(--bhn-text)]">{title}</h4>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-[var(--bhn-text-muted)]">{emptyText}</p>
      ) : (
        <ul className="space-y-1 text-xs text-[var(--bhn-text-muted)]">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
