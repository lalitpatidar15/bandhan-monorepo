"use client";

import { useState } from "react";
import { Check, Globe, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Alert, Badge, Button } from "@bandhan/ui";
import { useGetEventWebsiteQuery, useSaveEventWebsiteMutation } from "@/store/api/eventOsApi";
import { EventWebsite, WebsiteScheduleItem } from "@/types/eventOs";
import { errorText, extractItem, ResourceState } from "./eventOsUi";

interface Props {
  eventId: string;
}

interface WebsiteForm {
  title: string;
  slug: string;
  theme: string;
  coverImage: string;
  story: string;
  venueDetails: string;
  schedule: WebsiteScheduleItem[];
  rsvpEnabled: boolean;
  published: boolean;
}

const toForm = (website: EventWebsite | null): WebsiteForm => ({
  title: website?.title || "",
  slug: website?.slug || "",
  theme: website?.theme || "classic",
  coverImage: website?.coverImage || "",
  story: website?.story || "",
  venueDetails: website?.venueDetails || "",
  schedule: Array.isArray(website?.schedule) ? website.schedule : [],
  rsvpEnabled: website ? website.rsvpEnabled !== false : true,
  published: Boolean(website?.published),
});

export default function WebsiteTab({ eventId }: Props) {
  const { data, isLoading, isError, error, refetch } = useGetEventWebsiteQuery(eventId, { skip: !eventId });
  const website = extractItem<EventWebsite>(data);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Event website</h3>
          <p className="text-xs text-[var(--bhn-text-muted)]">
            Manage the page details buyers and guests can preview for this event.
          </p>
        </div>
        {website ? (
          <Badge tone={website.published ? "success" : "warning"}>{website.published ? "Published" : "Draft"}</Badge>
        ) : null}
      </div>

      <Alert tone="info" title="Preview target">
        A website slug is a preview target. The public event-site page may not resolve inside the app; do not treat the
        link as a published delivery channel.
      </Alert>

      <ResourceState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={false}
        emptyTitle=""
        onRetry={() => refetch()}
      >
        {/* Remounting on a loaded record seeds the form from live data without an effect. */}
        <WebsiteForm key={website?._id || "new"} eventId={eventId} initial={website} onSaved={refetch} />
      </ResourceState>
    </div>
  );
}

function WebsiteForm({
  eventId,
  initial,
  onSaved,
}: {
  eventId: string;
  initial: EventWebsite | null;
  onSaved: () => void;
}) {
  const [saveWebsite, { isLoading: saving }] = useSaveEventWebsiteMutation();
  const [form, setForm] = useState<WebsiteForm>(() => toForm(initial));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Website title is required.");
      return;
    }
    if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      toast.error("Slug may contain lowercase letters, numbers and hyphens only.");
      return;
    }
    const payload: Partial<EventWebsite> = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      theme: form.theme,
      coverImage: form.coverImage.trim() || undefined,
      story: form.story,
      venueDetails: form.venueDetails,
      schedule: form.schedule.filter((item) => item.title?.trim() || item.time?.trim()),
      rsvpEnabled: form.rsvpEnabled,
      published: form.published,
    };
    try {
      await saveWebsite({
        eventId,
        method: initial?._id ? "PUT" : "POST",
        data: payload,
      }).unwrap();
      toast.success("Event website saved.");
      onSaved();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const previewUrl = form.slug && typeof window !== "undefined" ? `${window.location.origin}/event-site/${form.slug}` : "";

  return (
    <form onSubmit={submit} className="bhn-card p-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
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
          <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Slug</label>
          <input
            className="bhn-input w-full"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
            placeholder="mehak-aarav-wedding"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Theme</label>
          <input
            className="bhn-input w-full"
            value={form.theme}
            onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
            placeholder="classic"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Cover image URL</label>
          <input
            className="bhn-input w-full"
            value={form.coverImage}
            onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Story</label>
        <textarea
          className="bhn-textarea w-full"
          rows={4}
          value={form.story}
          onChange={(e) => setForm((f) => ({ ...f, story: e.target.value }))}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Venue details</label>
        <textarea
          className="bhn-textarea w-full"
          rows={2}
          value={form.venueDetails}
          onChange={(e) => setForm((f) => ({ ...f, venueDetails: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-[var(--bhn-text)]">Schedule</p>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={13} />}
            onClick={() =>
              setForm((f) => ({ ...f, schedule: [...f.schedule, { time: "", title: "", description: "" }] }))
            }
          >
            Add slot
          </Button>
        </div>
        {form.schedule.length === 0 ? (
          <p className="text-xs text-[var(--bhn-text-muted)]">No schedule slots added.</p>
        ) : (
          <div className="space-y-2">
            {form.schedule.map((item, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[120px_1fr_1fr_auto]">
                <input
                  className="bhn-input w-full"
                  placeholder="Time"
                  value={item.time || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      schedule: f.schedule.map((row, i) => (i === index ? { ...row, time: e.target.value } : row)),
                    }))
                  }
                />
                <input
                  className="bhn-input w-full"
                  placeholder="Title"
                  value={item.title || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      schedule: f.schedule.map((row, i) => (i === index ? { ...row, title: e.target.value } : row)),
                    }))
                  }
                />
                <input
                  className="bhn-input w-full"
                  placeholder="Description"
                  value={item.description || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      schedule: f.schedule.map((row, i) =>
                        i === index ? { ...row, description: e.target.value } : row,
                      ),
                    }))
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Remove schedule slot"
                  onClick={() => setForm((f) => ({ ...f, schedule: f.schedule.filter((_, i) => i !== index) }))}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-xs text-[var(--bhn-text)]">
          <input
            type="checkbox"
            checked={form.rsvpEnabled}
            onChange={(e) => setForm((f) => ({ ...f, rsvpEnabled: e.target.checked }))}
          />
          Accept RSVPs on this site
        </label>
        <label className="flex items-center gap-2 text-xs text-[var(--bhn-text)]">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          />
          Mark as published
        </label>
      </div>

      {previewUrl ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--bhn-text-muted)]">
          <Globe size={14} />
          <span>Preview target:</span>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-medium text-[var(--bhn-brand-700)] underline"
          >
            {previewUrl}
          </a>
          <span>(may not resolve inside the app)</span>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" loading={saving} icon={<Check size={14} />}>
          Save website
        </Button>
      </div>
    </form>
  );
}
