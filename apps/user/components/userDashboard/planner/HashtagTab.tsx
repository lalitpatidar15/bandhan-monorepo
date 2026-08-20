"use client";

import { Sparkles } from "lucide-react";
import { Event } from "@/types/event";
import HashtagGenerator from "@/components/userDashboard/HashtagGenerator";

interface Props {
  event: Event;
}

export default function HashtagTab({ event }: Props) {
  const hasContext = Boolean(event.eventType || event.location);

  return (
    <div className="bhn-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Sparkles size={16} className="text-[var(--bhn-brand-600)]" />
        <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Hashtag Generator</h3>
      </div>

      {hasContext ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--bhn-text-muted)]">Derived defaults:</span>
          <span className="bhn-chip">{event.eventType || "Any"}</span>
          <span className="text-[var(--bhn-text-muted)]">in</span>
          <span className="bhn-chip">{event.location || "any city"}</span>
        </div>
      ) : (
        <p className="text-xs text-[var(--bhn-text-soft)]">No event type or location on the event yet. Fill them in the Overview tab to seed defaults.</p>
      )}

      <HashtagGenerator className="h-full" defaultEventType={event.eventType || undefined} defaultLocation={event.location || undefined} />
    </div>
  );
}
