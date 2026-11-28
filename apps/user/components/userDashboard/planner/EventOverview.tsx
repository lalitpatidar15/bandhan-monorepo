"use client";

import { useState } from "react";
import { Check, Edit3, RefreshCw, Sparkles, Star } from "lucide-react";
import toast from "react-hot-toast";
import { Badge, Button, Modal } from "@bandhan/ui";
import { useGetSuggestedServicesQuery } from "@/store/api/eventApi";
import { useReplaceEventVendorMutation } from "@/store/api/eventOsApi";
import { Event, EventVendorEntry, SuggestedService, UpdateEventRequest } from "@/types/event";
import { errorText } from "./eventOsUi";

interface Props {
  event: Event;
  eventId: string;
  onRefresh: () => void;
  onEditField: (partial: UpdateEventRequest) => void;
  onAddSuggestedService: (service: SuggestedService) => void;
}

export default function EventOverview({ event, eventId, onRefresh, onEditField, onAddSuggestedService }: Props) {
  const budget = event.budget;
  const spent = Number(budget.spent || 0);
  const total = Number(budget.total || 0);

  const { data: svcData, isLoading: svcLoading } = useGetSuggestedServicesQuery(
    {
      eventType: event.eventType,
      budget: total,
      guests: event.guestCount || 0,
      location: event.location,
    },
    { skip: !event.id }
  );

  const services: SuggestedService[] = svcData?.data ?? [];
  const [replaceVendor, { isLoading: replacing }] = useReplaceEventVendorMutation();
  const [vendorToReplace, setVendorToReplace] = useState<EventVendorEntry | null>(null);
  const [replacement, setReplacement] = useState({ name: "", category: "", vendorId: "" });

  const openReplace = (vendor: EventVendorEntry) => {
    setVendorToReplace(vendor);
    setReplacement({ name: "", category: vendor.category || "", vendorId: "" });
  };

  const submitReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorToReplace) return;
    if (!replacement.name.trim()) {
      toast.error("Enter the replacement vendor name.");
      return;
    }
    const vendorReference = vendorToReplace._id || vendorToReplace.id;
    if (!vendorReference) {
      toast.error("This vendor has no reference ID, so it cannot be replaced.");
      return;
    }
    try {
      await replaceVendor({
        eventId,
        vendorId: vendorReference,
        data: {
          name: replacement.name.trim(),
          category: replacement.category.trim() || undefined,
          vendorId: replacement.vendorId.trim() || undefined,
        },
      }).unwrap();
      toast.success("Vendor replaced.");
      setVendorToReplace(null);
      onRefresh();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="bhn-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--bhn-text)]" />
            <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Event details</h3>
            <Edit3 size={14} className="ml-auto text-[var(--bhn-text-muted)]" />
          </div>

          <FieldRow label="Title" value={event.title} onChange={(v) => onEditField({ title: v })} />
          <FieldRow label="Date" type="date" value={event.date} onChange={(v) => onEditField({ date: v })} />
          <FieldRow label="Location" value={event.location} onChange={(v) => onEditField({ location: v })} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FieldRow label="EventType" value={event.eventType} onChange={(v) => onEditField({ eventType: v })} />
            <FieldRow label="Guests" type="number" value={String(event.guestCount || 0)} onChange={(v) => onEditField({ guestCount: Number(v) })} />
            <FieldRow label="Total budget" type="number" value={String(total)} onChange={(v) => onEditField({ budget: { ...budget, total: Number(v), pending: Number(v) - spent } })} />
          </div>
        </div>

        <div className="bhn-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Selected vendors</h3>
            <Badge tone="neutral">{event.vendors?.length || 0} selected</Badge>
          </div>
          {!event.vendors?.length ? (
            <p className="text-sm text-[var(--bhn-text-muted)]">
              No vendors selected yet. Add one from suggestions or the vendor/venue action above.
            </p>
          ) : (
            <div className="space-y-2">
              {event.vendors.map((vendor, index) => (
                <div
                  key={vendor._id || vendor.id || `${vendor.name}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--bhn-surface-2)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--bhn-text)]">{vendor.name}</p>
                    <p className="text-xs text-[var(--bhn-text-muted)]">
                      {vendor.category || "Uncategorised"}{" "}
                      {vendor.status ? <span className="ml-1">· {vendor.status}</span> : null}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" icon={<RefreshCw size={13} />} onClick={() => openReplace(vendor)}>
                    Replace vendor
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bhn-card p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Suggested services</h3>
          <p className="text-xs text-[var(--bhn-text-muted)]">Picked for your {event.eventType || "event"} in {event.location || "any"} within a ₹{total.toLocaleString()} budget.</p>

          {svcLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bhn-card bhn-card-hover p-4 h-56" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <p className="text-sm text-[var(--bhn-text-muted)]">No suggested services for these filters. Try adjusting your budget, location or event type.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {services.map((svc: SuggestedService) => (
                <ServiceCard key={svc._id || svc.id} service={svc} onAdd={() => onAddSuggestedService(svc)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <BudgetRing spent={spent} total={total} />
      </div>

      <Modal
        open={Boolean(vendorToReplace)}
        onClose={() => setVendorToReplace(null)}
        title="Replace vendor"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setVendorToReplace(null)}>
              Cancel
            </Button>
            <Button type="submit" form="replace-vendor-form" loading={replacing} icon={<Check size={14} />}>
              Replace vendor
            </Button>
          </div>
        }
      >
        <form id="replace-vendor-form" onSubmit={submitReplacement} className="space-y-3">
          <p className="text-xs text-[var(--bhn-text-muted)]">
            Replacing <span className="font-semibold text-[var(--bhn-text)]">{vendorToReplace?.name}</span>. This only
            updates the event record; no payment is made.
          </p>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">New vendor name *</label>
            <input
              className="bhn-input w-full"
              value={replacement.name}
              onChange={(e) => setReplacement((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Category</label>
              <input
                className="bhn-input w-full"
                value={replacement.category}
                onChange={(e) => setReplacement((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Bandhan vendor ID</label>
              <input
                className="bhn-input w-full"
                value={replacement.vendorId}
                onChange={(e) => setReplacement((f) => ({ ...f, vendorId: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function FieldRow({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-[var(--bhn-text)]">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="bhn-input w-full text-sm"
      />
    </div>
  );
}

function BudgetRing({ spent, total }: { spent: number; total: number }) {
  const ratio = total > 0 ? Math.min(spent / total, 1) : 0;
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);
  const pct = Math.round(ratio * 100);

  return (
    <div className="bhn-card p-6 flex flex-col items-center text-center space-y-3">
      <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--bhn-surface-3)" strokeWidth="3.5" />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="var(--bhn-brand-600)"
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <text
          x="18"
          y="18"
          textAnchor="middle"
          dy=".3em"
          className="fill-[var(--bhn-text)] font-bold"
          style={{ fontSize: 14 }}
          transform="rotate(90 18 18)"
        >
          {pct}%
        </text>
      </svg>
      <div>
        <p className="text-xs text-[var(--bhn-text-muted)]">Spent of budget</p>
        <p className="font-semibold text-[var(--bhn-text)]">
          ₹{spent.toLocaleString()} <span className="text-[var(--bhn-text-muted)]">of</span> ₹{total.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

interface ServiceCardProps {
  service: SuggestedService;
  onAdd: () => void;
}

function ServiceCard({ service, onAdd }: ServiceCardProps) {
  const price = Number(service.price || 0);
  return (
    <div className="bhn-card bhn-card-hover p-4 flex flex-col gap-3 h-full">
      <div className="h-36 w-full rounded-lg bg-[var(--bhn-surface-3)] overflow-hidden">
        {service.image ? (
          <img src={service.image} alt={service.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[var(--bhn-text-soft)] text-xs">No image</div>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="font-medium text-[var(--bhn-text)]">{service.title}</h4>
        <p className="text-xs text-[var(--bhn-text-muted)]">{service.category}</p>
        <div className="flex items-center gap-1.5">
          <Star size={12} className="text-[var(--bhn-warning-600)] fill-current" />
          <span className="text-xs font-semibold text-[var(--bhn-text)]">{Number(service.rating || 0).toFixed(1)}</span>
        </div>
        <p className="font-semibold text-[var(--bhn-brand-700)]">₹{price.toLocaleString()}</p>
      </div>
      <button type="button" onClick={onAdd} className="bhn-btn bhn-btn-primary bhn-btn-sm gap-2">
        <Sparkles size={12} /> Add to budget
      </button>
    </div>
  );
}
