"use client";

import { useState } from "react";
import { Check, KeyRound, Pencil, Trash2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { Badge, Button, Modal } from "@bandhan/ui";
import {
  useAcceptCollaboratorInviteMutation,
  useAddEventCollaboratorMutation,
  useDeleteEventCollaboratorMutation,
  useGetEventCollaboratorsQuery,
  useUpdateEventCollaboratorMutation,
} from "@/store/api/eventOsApi";
import { Collaborator } from "@/types/eventOs";
import { errorText, extractItems, ResourceState } from "./eventOsUi";

interface Props {
  eventId: string;
}

interface CollaboratorForm {
  email: string;
  role: string;
  permissions: string;
  status: string;
}

const emptyForm: CollaboratorForm = { email: "", role: "editor", permissions: "", status: "invited" };

export default function CollaboratorsTab({ eventId }: Props) {
  const { data, isLoading, isError, error, refetch } = useGetEventCollaboratorsQuery(eventId, { skip: !eventId });
  const [addCollaborator, { isLoading: adding }] = useAddEventCollaboratorMutation();
  const [updateCollaborator, { isLoading: updating }] = useUpdateEventCollaboratorMutation();
  const [deleteCollaborator, { isLoading: deleting }] = useDeleteEventCollaboratorMutation();
  const [acceptInvite, { isLoading: accepting }] = useAcceptCollaboratorInviteMutation();

  const collaborators = extractItems<Collaborator>(data, "collaborators");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Collaborator | null>(null);
  const [removing, setRemoving] = useState<Collaborator | null>(null);
  const [form, setForm] = useState<CollaboratorForm>(emptyForm);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptToken, setAcceptToken] = useState("");

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (collaborator: Collaborator) => {
    setEditing(collaborator);
    setForm({
      email: collaborator.email || "",
      role: collaborator.role || "editor",
      permissions: (collaborator.permissions || []).join(", "),
      status: collaborator.status || "invited",
    });
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      toast.error("Enter a valid email address for the collaborator.");
      return;
    }
    const permissions = form.permissions
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    try {
      if (editing) {
        await updateCollaborator({
          eventId,
          collaboratorId: editing._id,
          data: { role: form.role, status: form.status, permissions },
        }).unwrap();
        toast.success("Collaborator updated.");
      } else {
        await addCollaborator({
          eventId,
          data: { email: form.email.trim(), role: form.role, permissions },
        }).unwrap();
        toast.success("Collaborator invited.");
      }
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      await deleteCollaborator({ eventId, collaboratorId: removing._id }).unwrap();
      toast.success("Collaborator removed.");
      setRemoving(null);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const submitAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptToken.trim()) {
      toast.error("Enter the invitation token you received.");
      return;
    }
    try {
      await acceptInvite(acceptToken.trim()).unwrap();
      toast.success("Invitation accepted.");
      setAcceptOpen(false);
      setAcceptToken("");
      refetch();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Collaborators</h3>
          <p className="text-xs text-[var(--bhn-text-muted)]">
            Invite people to help plan this event. Roles and status come from the live event record.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" icon={<KeyRound size={14} />} onClick={() => setAcceptOpen(true)}>
            Accept invite
          </Button>
          <Button size="sm" icon={<UserPlus size={14} />} onClick={openAdd}>
            Add collaborator
          </Button>
        </div>
      </div>

      <ResourceState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={collaborators.length === 0}
        emptyTitle="No collaborators yet"
        emptyDescription="Invite a collaborator to share planning work on this event."
        onRetry={() => refetch()}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collaborators.map((collaborator) => (
            <div key={collaborator._id} className="bhn-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate font-semibold text-[var(--bhn-text)]">{collaborator.email}</p>
                <Badge tone={collaborator.status === "accepted" ? "success" : "warning"}>
                  {collaborator.status || "invited"}
                </Badge>
              </div>
              <p className="text-xs text-[var(--bhn-text-muted)]">Role: {collaborator.role || "editor"}</p>
              {(collaborator.permissions || []).length > 0 ? (
                <p className="text-xs text-[var(--bhn-text-soft)]">
                  Permissions: {collaborator.permissions?.join(", ")}
                </p>
              ) : null}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="secondary" icon={<Pencil size={13} />} onClick={() => openEdit(collaborator)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => setRemoving(collaborator)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ResourceState>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit collaborator" : "Invite collaborator"}>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Email {editing ? "" : "*"}</label>
            <input
              type="email"
              className="bhn-input w-full"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              disabled={Boolean(editing)}
              required={!editing}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Role</label>
              <select
                className="bhn-select w-full"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Status</label>
              <select
                className="bhn-select w-full"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="invited">Invited</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">
              Permissions <span className="font-normal text-[var(--bhn-text-muted)]">(comma separated, optional)</span>
            </label>
            <input
              className="bhn-input w-full"
              value={form.permissions}
              onChange={(e) => setForm((f) => ({ ...f, permissions: e.target.value }))}
              placeholder="guests, budget"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={adding || updating} icon={<Check size={14} />}>
              {editing ? "Save changes" : "Send invite"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remove collaborator"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} icon={<Trash2 size={14} />} onClick={confirmDelete}>
              Remove
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--bhn-text-muted)]">
          Remove <span className="font-semibold text-[var(--bhn-text)]">{removing?.email}</span> from this event?
        </p>
      </Modal>

      <Modal open={acceptOpen} onClose={() => setAcceptOpen(false)} title="Accept a collaboration invite">
        <form onSubmit={submitAccept} className="space-y-3">
          <p className="text-xs text-[var(--bhn-text-muted)]">Enter the token shared with you by the event owner.</p>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Invitation token *</label>
            <input
              className="bhn-input w-full"
              value={acceptToken}
              onChange={(e) => setAcceptToken(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAcceptOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={accepting} icon={<Check size={14} />}>
              Accept invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
