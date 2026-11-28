"use client";

import { useState } from "react";
import { Armchair, Check, Pencil, Plus, Trash2, UserMinus, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { Badge, Button, Modal } from "@bandhan/ui";
import {
  useAddEventTableMutation,
  useAssignGuestToTableMutation,
  useDeleteEventTableMutation,
  useGetEventGuestsQuery,
  useGetEventTablesQuery,
  useUnassignGuestFromTableMutation,
  useUpdateEventTableMutation,
} from "@/store/api/eventOsApi";
import { EventGuest, EventTable } from "@/types/eventOs";
import { errorText, extractItems, ResourceState } from "./eventOsUi";

interface Props {
  eventId: string;
}

interface TableForm {
  name: string;
  capacity: string;
  notes: string;
}

const emptyForm: TableForm = { name: "", capacity: "8", notes: "" };

function tableGuestIds(table: EventTable): string[] {
  return (table.guests || [])
    .map((guest) => (typeof guest === "string" ? guest : String((guest as { _id?: string; id?: string })._id || (guest as { id?: string }).id || "")))
    .filter(Boolean);
}

export default function SeatingTab({ eventId }: Props) {
  const {
    data: tablesData,
    isLoading: tablesLoading,
    isError: tablesError,
    error: tablesErrorData,
    refetch: refetchTables,
  } = useGetEventTablesQuery(eventId, { skip: !eventId });
  const {
    data: guestsData,
    isLoading: guestsLoading,
    isError: guestsError,
    error: guestsErrorData,
  } = useGetEventGuestsQuery(eventId, { skip: !eventId });

  const [addTable, { isLoading: adding }] = useAddEventTableMutation();
  const [updateTable, { isLoading: updating }] = useUpdateEventTableMutation();
  const [deleteTable, { isLoading: deleting }] = useDeleteEventTableMutation();
  const [assignGuest, { isLoading: assigning }] = useAssignGuestToTableMutation();
  const [unassignGuest] = useUnassignGuestFromTableMutation();

  const tables = extractItems<EventTable>(tablesData, "tables");
  const guests = extractItems<EventGuest>(guestsData, "guests");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventTable | null>(null);
  const [removing, setRemoving] = useState<EventTable | null>(null);
  const [form, setForm] = useState<TableForm>(emptyForm);
  const [selectedGuests, setSelectedGuests] = useState<Record<string, string>>({});

  const assignedIds = new Set(tables.flatMap(tableGuestIds));
  const availableGuests = guests.filter((guest) => !assignedIds.has(guest._id) && !guest.tableId);
  const guestName = (id: string) => guests.find((guest) => guest._id === id)?.name || "Unknown guest";

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (table: EventTable) => {
    setEditing(table);
    setForm({ name: table.name || "", capacity: String(table.capacity ?? 8), notes: table.notes || "" });
    setFormOpen(true);
  };

  const submitTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const capacity = Number(form.capacity);
    if (!form.name.trim()) {
      toast.error("Table name is required.");
      return;
    }
    if (!Number.isInteger(capacity) || capacity < 1) {
      toast.error("Capacity must be a whole number greater than zero.");
      return;
    }
    const payload = { name: form.name.trim(), capacity, notes: form.notes.trim() || undefined };
    try {
      if (editing) {
        await updateTable({ eventId, tableId: editing._id, data: payload }).unwrap();
        toast.success("Table updated.");
      } else {
        await addTable({ eventId, data: payload }).unwrap();
        toast.success("Table added.");
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
      await deleteTable({ eventId, tableId: removing._id }).unwrap();
      toast.success("Table removed. Its guests are now unassigned.");
      setRemoving(null);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const assign = async (table: EventTable) => {
    const guestId = selectedGuests[table._id];
    if (!guestId) {
      toast.error("Choose a guest to assign first.");
      return;
    }
    try {
      await assignGuest({ eventId, tableId: table._id, guestId }).unwrap();
      toast.success("Guest assigned to table.");
      setSelectedGuests((prev) => ({ ...prev, [table._id]: "" }));
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const unassign = async (table: EventTable, guestId: string) => {
    try {
      await unassignGuest({ eventId, tableId: table._id, guestId }).unwrap();
      toast.success("Guest unassigned.");
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Seating plan</h3>
          <p className="text-xs text-[var(--bhn-text-muted)]">
            {tables.length} table{tables.length === 1 ? "" : "s"} · {guests.length} guests on the live list.
          </p>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>
          Add table
        </Button>
      </div>

      {(tablesLoading || tablesError) && (
        <ResourceState
          isLoading={tablesLoading}
          isError={tablesError}
          error={tablesErrorData}
          isEmpty={false}
          emptyTitle=""
          onRetry={() => refetchTables()}
        >
          <div />
        </ResourceState>
      )}

      {!tablesLoading && !tablesError && (
        <ResourceState
          isLoading={guestsLoading}
          isError={guestsError}
          error={guestsErrorData}
          isEmpty={tables.length === 0}
          emptyTitle="No tables yet"
          emptyDescription="Add a table, then assign guests from the live guest list."
          onRetry={() => refetchTables()}
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {tables.map((table) => {
              const seated = tableGuestIds(table);
              return (
                <div key={table._id} className="bhn-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Armchair size={16} className="text-[var(--bhn-text)]" />
                        <h4 className="font-semibold text-[var(--bhn-text)]">{table.name}</h4>
                      </div>
                      <p className="mt-1 text-xs text-[var(--bhn-text-muted)]">
                        {seated.length} of {table.capacity ?? "—"} seats assigned
                        {table.notes ? ` · ${table.notes}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(table)} aria-label={`Edit ${table.name}`}>
                        <Pencil size={13} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setRemoving(table)} aria-label={`Delete ${table.name}`}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>

                  {seated.length > 0 ? (
                    <div className="space-y-1">
                      {seated.map((id) => (
                        <div
                          key={id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-[var(--bhn-surface-2)] px-3 py-2 text-sm text-[var(--bhn-text)]"
                        >
                          <span className="truncate">{guestName(id)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<UserMinus size={13} />}
                            onClick={() => unassign(table, id)}
                          >
                            Unassign
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Badge tone="neutral">No guests assigned</Badge>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <select
                      className="bhn-select min-w-40 flex-1"
                      value={selectedGuests[table._id] || ""}
                      onChange={(e) => setSelectedGuests((prev) => ({ ...prev, [table._id]: e.target.value }))}
                      aria-label={`Guest for ${table.name}`}
                    >
                      <option value="">Select an unassigned guest</option>
                      {availableGuests.map((guest) => (
                        <option key={guest._id} value={guest._id}>
                          {guest.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={assigning}
                      icon={<UserPlus size={13} />}
                      onClick={() => assign(table)}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ResourceState>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit table" : "Add table"}>
        <form onSubmit={submitTable} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Table name *</label>
            <input
              className="bhn-input w-full"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Family A"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Capacity *</label>
            <input
              type="number"
              min={1}
              className="bhn-input w-full"
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Notes</label>
            <textarea
              className="bhn-textarea w-full"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={adding || updating} icon={<Check size={14} />}>
              {editing ? "Save changes" : "Add table"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remove table"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} icon={<Trash2 size={14} />} onClick={confirmDelete}>
              Remove table
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--bhn-text-muted)]">
          Remove <span className="font-semibold text-[var(--bhn-text)]">{removing?.name}</span>? Assigned guests will
          become unassigned.
        </p>
      </Modal>
    </div>
  );
}
