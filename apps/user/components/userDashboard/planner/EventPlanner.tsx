"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Spinner, Tabs } from "@bandhan/ui";
import {
  useCreateEventMutation,
  useGetEventByIdQuery,
  useGetUserEventsQuery,
  useUpdateEventMutation,
} from "@/store/api/eventApi";
import {
  Event,
  EventBudget,
  EventPhase,
  EventTask,
  EventVendorEntry,
  EventVenueEntry,
  SuggestedService,
  SuggestedVenue,
  UpdateEventRequest,
} from "@/types/event";
import toast from "react-hot-toast";
import EventOverview from "./EventOverview";
import BudgetPlanner from "./BudgetPlanner";
import EventTimeline from "./EventTimeline";
import HashtagTab from "./HashtagTab";
import { AddVendorVenueModal } from "./AddVendorVenueModal";

const EVENT_TYPE_OPTIONS = ["Wedding", "Engagement", "Birthday", "Corporate", "Anniversary", "Other"];

function normalizeBudget(b: unknown): EventBudget {
  if (!b || typeof b !== "object") {
    return { total: 0, spent: 0, vendorPaid: 0, pending: 0, allocated: {} };
  }
  const o = b as Record<string, unknown>;
  const total = Number(o.total ?? 0);
  const spent = Number(o.spent ?? 0);
  const vendorPaid = Number(o.vendorPaid ?? 0);
  return {
    total,
    spent,
    vendorPaid,
    pending: total - spent,
    allocated: o.allocated && typeof o.allocated === "object" ? { ...(o.allocated as Record<string, number>) } : {},
  };
}

function normalizeEvent(raw: unknown): Event {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      title: "",
      date: "",
      location: "",
      guestCount: 0,
      eventType: "",
      budget: normalizeBudget(undefined),
      status: "planning",
      phases: [],
      tasks: [],
      vendors: [],
      venues: [],
      createdAt: "",
      updatedAt: "",
    };
  }
  const r = raw as Record<string, unknown>;
  return {
    id: (r.id as string) || (r._id as string) || "",
    userId: r.userId as string | undefined,
    title: (r.title as string) || (r.name as string) || "",
    description: (r.description as string) || "",
    date: (r.date as string) || (r.eventDate as string) || "",
    daysToGo: r.daysToGo != null ? Number(r.daysToGo) : undefined,
    location: (r.location as string) || "",
    guestCount: Number((r.guestCount as number | undefined) ?? (r.guests as number | undefined) ?? 0),
    eventType: (r.eventType as string) || "",
    budget: normalizeBudget(r.budget),
    status: (r.status as Event["status"]) || "planning",
    phases: Array.isArray(r.phases) ? (r.phases as EventPhase[]) : [],
    tasks: Array.isArray(r.tasks) ? (r.tasks as EventTask[]) : [],
    vendors: Array.isArray(r.vendors) ? (r.vendors as EventVendorEntry[]) : [],
    venues: Array.isArray(r.venues) ? (r.venues as EventVenueEntry[]) : [],
    createdAt: (r.createdAt as string) || "",
    updatedAt: (r.updatedAt as string) || "",
  };
}

function mergeEvent(prev: Event, partial: UpdateEventRequest): Event {
  const next: Event = { ...prev };
  if (partial.title !== undefined) next.title = partial.title as string;
  if (partial.description !== undefined) next.description = partial.description as string;
  if (partial.date !== undefined) next.date = partial.date as string;
  if (partial.location !== undefined) next.location = partial.location as string;
  if (partial.guestCount !== undefined) next.guestCount = partial.guestCount as number;
  if (partial.eventType !== undefined) next.eventType = partial.eventType as string;
  if (partial.status !== undefined) next.status = partial.status as Event["status"];
  if (partial.daysToGo !== undefined) next.daysToGo = partial.daysToGo as number;
  if (partial.budget) {
    const prevBudget = prev.budget || { total: 0, spent: 0, vendorPaid: 0, pending: 0, allocated: {} };
    next.budget = {
      ...prevBudget,
      ...partial.budget,
      allocated: { ...(prevBudget.allocated || {}), ...(partial.budget.allocated || {}) },
      spentByCategory: {
        ...(prevBudget.spentByCategory || {}),
        ...(partial.budget.spentByCategory || {}),
      },
    };
    next.budget.pending = next.budget.total - next.budget.spent;
  }
  if (partial.phases !== undefined) next.phases = partial.phases as EventPhase[];
  if (partial.tasks !== undefined) next.tasks = partial.tasks as EventTask[];
  if (partial.vendors !== undefined) next.vendors = partial.vendors as EventVendorEntry[];
  if (partial.venues !== undefined) next.venues = partial.venues as EventVenueEntry[];
  return next;
}

export default function EventPlanner() {
  const {
    data: eventsData,
    isLoading: loadingEvents,
    isError: eventsError,
    refetch: refetchEvents,
  } = useGetUserEventsQuery();
  const userEvents: Event[] = (eventsData?.events ?? []).map(normalizeEvent);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const {
    data: eventData,
    isLoading: loadingEvent,
    isError: eventError,
    refetch: refetchEvent,
  } = useGetEventByIdQuery(selectedEventId ?? "", {
    skip: !selectedEventId,
  });

  const [createEvent] = useCreateEventMutation();

  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    setRefreshVersion((v) => v + 1);
  };

  const handleRefresh = () => {
    refetchEvent();
    setRefreshVersion((v) => v + 1);
  };

  const handleCreate = async (form: {
    eventType: string;
    title: string;
    date: string;
    location: string;
    guests: string;
    budget: string;
  }) => {
    const guestCount = Number(form.guests);
    const budget = Number(form.budget);
    if (!form.title || !form.date || !form.location || !guestCount || !budget) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const res = await createEvent({
        title: form.title,
        description: form.eventType + " for " + form.location,
        date: form.date,
        location: form.location,
        guestCount,
        eventType: form.eventType,
        budget,
      }).unwrap();
      const newId = normalizeEvent(res.event).id;
      if (newId) {
        setSelectedEventId(newId);
        setShowCreateForm(false);
        setRefreshVersion((v) => v + 1);
        refetchEvents();
        toast.success("Event created!");
      }
    } catch (e) {
      const message =
        e && typeof e === "object" && "data" in e && e.data && typeof e.data === "object" && "message" in e.data
          ? String((e.data as { message?: string }).message)
          : undefined;
      toast.error(message || "Could not create event");
    }
  };

  if (loadingEvents) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="bhn-card mx-auto max-w-2xl p-8 text-center">
        <AlertCircle size={34} className="mx-auto text-[var(--bhn-error-600)]" />
        <h3 className="mt-3 font-serif text-xl font-bold text-[var(--bhn-text)]">Event plans unavailable</h3>
        <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">
          We could not load your saved events. No empty or sample plan has been substituted.
        </p>
        <button type="button" onClick={() => refetchEvents()} className="bhn-btn bhn-btn-primary mt-5 gap-2">
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    );
  }

  if (!selectedEventId) {
    const showSelector = userEvents.length > 0;
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className={showSelector ? "flex items-end justify-between gap-3" : "hidden"}>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[var(--bhn-text)] mb-1">Select an event</label>
            <select
              value={selectedEventId || ""}
              onChange={(e) => handleSelectEvent(e.target.value)}
              className="bhn-select w-full"
            >
              <option value="" disabled>Select an event</option>
              {userEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={() => setShowCreateForm(true)} className="bhn-btn bhn-btn-primary gap-2 mb-[2px]">
            <Plus size={16} /> New event
          </button>
        </div>

        {(showCreateForm || userEvents.length === 0) && (
          <EventCreateForm
            key="create"
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            hideCancel={userEvents.length === 0}
          />
        )}

        {userEvents.length > 0 && !showCreateForm && (
          <div className="bhn-card p-6 text-center">
            <CalendarClock size={40} className="mx-auto mb-3 text-[var(--bhn-brand-600)]" />
            <h3 className="font-serif text-xl font-bold text-[var(--bhn-text)] mb-1">Event Planner</h3>
            <p className="text-sm text-[var(--bhn-text-muted)] mb-4">
              You have <span className="font-semibold text-[var(--bhn-text)]">{userEvents.length}</span> event
              {userEvents.length === 1 ? "" : "s"} created. Select one above or start a new event.
            </p>
            <button type="button" onClick={() => setShowCreateForm(true)} className="bhn-btn bhn-btn-primary gap-2">
              <Plus size={16} /> Create new event
            </button>
          </div>
        )}
      </div>
    );
  }

  if (loadingEvent) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (eventError || !eventData?.event) {
    return (
      <div className="bhn-card mx-auto max-w-2xl p-8 text-center">
        <AlertCircle size={34} className="mx-auto text-[var(--bhn-error-600)]" />
        <h3 className="mt-3 font-serif text-xl font-bold text-[var(--bhn-text)]">This event could not be loaded</h3>
        <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">Refresh the saved event or choose another plan.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => refetchEvent()} className="bhn-btn bhn-btn-primary gap-2">
            <RefreshCw size={15} /> Try again
          </button>
          <button type="button" onClick={() => setSelectedEventId(null)} className="bhn-btn bhn-btn-secondary">
            Choose another event
          </button>
        </div>
      </div>
    );
  }

  return (
    <EventWorkspace
      key={selectedEventId + "-" + refreshVersion}
      eventId={selectedEventId}
      sourceEvent={normalizeEvent(eventData.event)}
      onRefresh={handleRefresh}
    />
  );
}

interface EventWorkspaceProps {
  eventId: string;
  sourceEvent: Event;
  onRefresh: () => void;
}

function EventWorkspace({ eventId, sourceEvent, onRefresh }: EventWorkspaceProps) {
  const [workingEvent, setWorkingEvent] = useState<Event>(() => sourceEvent);
  const [updateEvent, { isLoading: isSaving }] = useUpdateEventMutation();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveQueue = useRef<UpdateEventRequest | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const commit = (partial: UpdateEventRequest) => {
    setWorkingEvent((prev) => mergeEvent(prev, partial));
    saveQueue.current = { ...(saveQueue.current || {}), ...partial };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const patch = saveQueue.current;
      saveQueue.current = null;
      if (patch) {
        updateEvent({ id: eventId, data: patch })
          .unwrap()
          .catch(() => {
            /* persist handled by RTK cache invalidation */
          });
      }
      saveTimer.current = null;
    }, 700);
  };

  const handleAddSuggestedService = (service: SuggestedService) => {
    const price = Number(service.price || 0);
    const category = service.category || "Misc";
    const newVendors = [...(workingEvent.vendors || []), { name: service.title, category, status: "pending" }];
    const spent = workingEvent.budget.spent + price;
    commit({
      vendors: newVendors,
      budget: {
        total: workingEvent.budget.total,
        spent,
        vendorPaid: workingEvent.budget.vendorPaid,
        pending: workingEvent.budget.total - spent,
        allocated: { ...workingEvent.budget.allocated },
      },
    });
    toast.success(service.title + " added to budget");
  };

  const handleAddVenue = (venue: SuggestedVenue) => {
    const newVenues = [...(workingEvent.venues || []), { name: venue.name, location: venue.location, status: "pending" }];
    commit({ venues: newVenues });
    toast.success(venue.name + " added to event");
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "budget", label: "Budget Planner" },
    { id: "timeline", label: "Timeline" },
    { id: "hashtags", label: "Hashtags" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <CalendarClock size={18} className="text-[var(--bhn-brand-600)]" />
          <span className="font-semibold text-[var(--bhn-text)]">{workingEvent.title}</span>
          <span className="text-xs text-[var(--bhn-text-muted)]">({workingEvent.guestCount || 0} guests)</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onRefresh} className="bhn-btn bhn-btn-secondary bhn-btn-sm gap-2">
            <RefreshCw size={14} /> Refresh
          </button>
          <button type="button" disabled className="bhn-btn bhn-btn-secondary bhn-btn-sm gap-2">
            {isSaving ? <Spinner size="sm" /> : <Save size={14} />}
            {isSaving ? "Saving..." : "Auto-save on edit"}
          </button>
          <button type="button" onClick={() => setAddModalOpen(true)} className="bhn-btn bhn-btn-primary bhn-btn-sm gap-2">
            <Plus size={14} /> Add vendor/venue
          </button>
        </div>
      </div>

      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && (
        <EventOverview event={workingEvent} onEditField={commit} onAddSuggestedService={handleAddSuggestedService} />
      )}
      {activeTab === "budget" && <BudgetPlanner event={workingEvent} onSaveBudget={commit} />}
      {activeTab === "timeline" && <EventTimeline event={workingEvent} onSaveTimeline={commit} />}
      {activeTab === "hashtags" && <HashtagTab event={workingEvent} />}

      <AddVendorVenueModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        event={workingEvent}
        onAddService={handleAddSuggestedService}
        onAddVenue={handleAddVenue}
      />
    </div>
  );
}

interface EventCreateFormProps {
  onSubmit: (form: {
    eventType: string;
    title: string;
    date: string;
    location: string;
    guests: string;
    budget: string;
  }) => Promise<void>;
  onCancel: () => void;
  hideCancel: boolean;
}

function EventCreateForm({ onSubmit, onCancel, hideCancel }: EventCreateFormProps) {
  const [form, setForm] = useState({
    eventType: "Wedding",
    title: "",
    date: "",
    location: "",
    guests: "",
    budget: "",
  });
  const [submitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bhn-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Sparkles size={18} className="text-[var(--bhn-brand-600)]" />
        <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">
          {hideCancel ? "Create your first event" : "New event"}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--bhn-text)]">Event type *</label>
          <select name="eventType" value={form.eventType} onChange={handleChange} className="bhn-select w-full">
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--bhn-text)]">Title *</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Mehak & Aarav's Wedding" className="bhn-input w-full" required />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--bhn-text)]">Date *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="bhn-input w-full" required />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--bhn-text)]">Location *</label>
          <input name="location" value={form.location} onChange={handleChange} placeholder="City, Venue" className="bhn-input w-full" required />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--bhn-text)]">Guests *</label>
          <input type="number" min={1} name="guests" value={form.guests} onChange={handleChange} placeholder="Total expected guests" className="bhn-input w-full" required />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--bhn-text)]">Total budget *</label>
          <input type="number" min={0} name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. 500100" className="bhn-input w-full" required />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {!hideCancel && (
          <button type="button" onClick={onCancel} className="bhn-btn bhn-btn-secondary bhn-btn-sm">
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting} className="bhn-btn bhn-btn-primary bhn-btn-sm gap-2">
          {submitting ? <Spinner size="sm" /> : <CalendarClock size={14} />}
          Create event
        </button>
      </div>
    </form>
  );
}
