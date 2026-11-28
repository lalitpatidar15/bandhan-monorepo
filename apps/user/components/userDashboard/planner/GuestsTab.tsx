"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Badge, Button, Modal } from "@bandhan/ui";
import {
  useAddEventGuestMutation,
  useCheckInEventGuestMutation,
  useDeleteEventGuestMutation,
  useGetEventGuestsQuery,
  useUpdateEventGuestMutation,
} from "@/store/api/eventOsApi";
import { EventGuest, GuestInput } from "@/types/eventOs";
import { errorText, extractItems, formatDate, ResourceState } from "./eventOsUi";

interface Props {
  eventId: string;
}

const MEAL_OPTIONS = ["", "Vegetarian", "Non-vegetarian", "Vegan", "Jain", "Kids"];

const emptyForm: GuestInput = {
  name: "",
  email: "",
  phone: "",
  plusOne: false,
  mealPreference: "",
  notes: "",
};

export default function GuestsTab({ eventId }: Props) {
  const { data, isLoading, isError, error, refetch } = useGetEventGuestsQuery(eventId, { skip: !eventId });
  const [addGuest, { isLoading: adding }] = useAddEventGuestMutation();
  const [updateGuest, { isLoading: updating }] = useUpdateEventGuestMutation();
  const [deleteGuest, { isLoading: deleting }] = useDeleteEventGuestMutation();
  const [checkInGuest] = useCheckInEventGuestMutation();

  const guests = extractItems<EventGuest>(data, "guests");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<EventGuest | null>(null);
  const [removing, setRemoving] = useState<EventGuest | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<GuestInput>(emptyForm);

  const visibleGuests = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return guests;
    return guests.filter((guest) =>
      [guest.name, guest.email, guest.phone].some((value) => (value || "").toLowerCase().includes(term)),
    );
  }, [guests, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (guest: EventGuest) => {
    setEditing(guest);
    setForm({
      name: guest.name || "",
      email: guest.email || "",
      phone: guest.phone || "",
      plusOne: Boolean(guest.plusOne),
      mealPreference: guest.mealPreference || "",
      notes: guest.notes || "",
    });
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Guest name is required.");
      return;
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Enter a valid email address or leave it blank.");
      return;
    }
    const payload: GuestInput = {
      ...form,
      name: form.name.trim(),
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
    };
    try {
      if (editing) {
        await updateGuest({ eventId, guestId: editing._id, data: payload }).unwrap();
        toast.success("Guest updated.");
      } else {
        await addGuest({ eventId, data: payload }).unwrap();
        toast.success("Guest added.");
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
      await deleteGuest({ eventId, guestId: removing._id }).unwrap();
      toast.success("Guest removed.");
      setRemoving(null);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const checkIn = async (guest: EventGuest) => {
    try {
      await checkInGuest({ eventId, guestId: guest._id }).unwrap();
      toast.success(`${guest.name} checked in.`);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Guest list</h3>
          <p className="text-xs text-[var(--bhn-text-muted)]">
            {guests.length} guest{guests.length === 1 ? "" : "s"} on this event&apos;s live list.
          </p>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>
          Add guest
        </Button>
      </div>

      {guests.length > 0 && (
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bhn-text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guests"
            className="bhn-input w-full pl-9"
          />
        </div>
      )}

      <ResourceState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={guests.length === 0}
        emptyTitle="No guests yet"
        emptyDescription="Add guests to build the invitation and check-in list for this event."
        onRetry={() => refetch()}
      >
        {visibleGuests.length === 0 ? (
          <p className="text-sm text-[var(--bhn-text-muted)]">No guests match “{search}”.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleGuests.map((guest) => (
              <div key={guest._id} className="bhn-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--bhn-text)]">{guest.name}</p>
                    <p className="truncate text-xs text-[var(--bhn-text-muted)]">
                      {guest.email || guest.phone || "No contact details"}
                    </p>
                  </div>
                  <Badge tone={guest.checkedInAt ? "success" : "neutral"}>
                    {guest.checkedInAt ? "Checked in" : guest.rsvpStatus || "invited"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--bhn-text-muted)]">
                  {guest.plusOne ? <span>+1 companion</span> : null}
                  {guest.mealPreference ? <span>Meal: {guest.mealPreference}</span> : null}
                  {guest.tableId ? <span>Table: {guest.tableId}</span> : null}
                  {guest.checkedInAt ? <span>At {formatDate(guest.checkedInAt)}</span> : null}
                </div>
                {guest.notes ? <p className="text-xs text-[var(--bhn-text-soft)]">{guest.notes}</p> : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  {!guest.checkedInAt ? (
                    <Button
                      size="sm"
                      variant="soft"
                      icon={<UserCheck size={13} />}
                      onClick={() => checkIn(guest)}
                    >
                      Check in
                    </Button>
                  ) : null}
                  <Button size="sm" variant="secondary" icon={<Pencil size={13} />} onClick={() => openEdit(guest)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => setRemoving(guest)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ResourceState>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit guest" : "Add guest"}>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Name *</label>
            <input
              className="bhn-input w-full"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Email</label>
              <input
                type="email"
                className="bhn-input w-full"
                value={form.email || ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Phone</label>
              <input
                className="bhn-input w-full"
                value={form.phone || ""}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Meal preference</label>
              <select
                className="bhn-select w-full"
                value={form.mealPreference || ""}
                onChange={(e) => setForm((f) => ({ ...f, mealPreference: e.target.value }))}
              >
                {MEAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option || "Not specified"}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-xs text-[var(--bhn-text)]">
              <input
                type="checkbox"
                checked={Boolean(form.plusOne)}
                onChange={(e) => setForm((f) => ({ ...f, plusOne: e.target.checked }))}
              />
              Bringing a plus one
            </label>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Notes</label>
            <textarea
              className="bhn-textarea w-full"
              rows={2}
              value={form.notes || ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={adding || updating} icon={<Check size={14} />}>
              {editing ? "Save changes" : "Add guest"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remove guest"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} icon={<Trash2 size={14} />} onClick={confirmDelete}>
              Remove guest
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--bhn-text-muted)]">
          Remove <span className="font-semibold text-[var(--bhn-text)]">{removing?.name}</span> from this event&apos;s
          guest list? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
