"use client";

import { Edit3, Sparkles, Star } from "lucide-react";
import { useGetSuggestedServicesQuery } from "@/store/api/eventApi";
import { Event, SuggestedService, UpdateEventRequest } from "@/types/event";

interface Props {
  event: Event;
  onEditField: (partial: UpdateEventRequest) => void;
  onAddSuggestedService: (service: SuggestedService) => void;
}

export default function EventOverview({ event, onEditField, onAddSuggestedService }: Props) {
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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="bhn-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--bhn-brand-600)]" />
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
