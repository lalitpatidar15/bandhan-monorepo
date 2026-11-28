"use client";

import { useState } from "react";
import { Copy, Link2, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Alert, Badge, Button } from "@bandhan/ui";
import {
  useCreateEventInvitationsMutation,
  useGetEventGuestsQuery,
  useGetEventInvitationsQuery,
  useSendEventInvitationsMutation,
} from "@/store/api/eventOsApi";
import { EventGuest, InvitationLink, InvitationRecord } from "@/types/eventOs";
import { errorText, extractItems, ResourceState } from "./eventOsUi";

interface Props {
  eventId: string;
}

function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value);
  }
  const area = document.createElement("textarea");
  area.value = value;
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  return Promise.resolve();
}

export default function InvitationsTab({ eventId }: Props) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetEventInvitationsQuery(eventId, { skip: !eventId });
  const { data: guestsData } = useGetEventGuestsQuery(eventId, { skip: !eventId });
  const [createInvitations, { isLoading: creating }] = useCreateEventInvitationsMutation();
  const [sendInvitations, { isLoading: sending }] = useSendEventInvitationsMutation();

  const invitations = extractItems<InvitationRecord>(data, "invitations");
  const guests = extractItems<EventGuest>(guestsData, "guests");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [links, setLinks] = useState<InvitationLink[]>([]);

  const toggleGuest = (guestId: string) => {
    setSelectedGuests((prev) =>
      prev.includes(guestId) ? prev.filter((id) => id !== guestId) : [...prev, guestId],
    );
  };

  const generate = async () => {
    try {
      const result = await createInvitations({
        eventId,
        guestIds: selectedGuests.length ? selectedGuests : undefined,
      }).unwrap();
      const created = extractItems<InvitationRecord>(result, "invitations");
      toast.success(created.length ? `${created.length} invitation link(s) created.` : "Invitations generated.");
      refetch();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const send = async () => {
    try {
      const result = await sendInvitations({
        eventId,
        guestIds: selectedGuests.length ? selectedGuests : undefined,
      }).unwrap();
      const payload = result?.data;
      const newLinks = Array.isArray(payload?.links) ? payload.links : [];
      setLinks(newLinks);
      toast.success(`${payload?.sent ?? newLinks.length} invite link(s) ready to copy.`);
      refetch();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const copyOne = async (url: string, guestName?: string) => {
    try {
      await copyText(url);
      toast.success(`Invite link for ${guestName || "guest"} copied.`);
    } catch {
      toast.error("Could not copy the link. Copy it manually from the field.");
    }
  };

  const copyAll = async () => {
    const urls = links.map((link) => link.url).filter(Boolean);
    if (urls.length === 0) {
      toast.error("There are no invite links to copy yet.");
      return;
    }
    try {
      await copyText(urls.join("\n"));
      toast.success(`${urls.length} invite link(s) copied.`);
    } catch {
      toast.error("Could not copy the links. Copy them manually from the fields.");
    }
  };

  const linkFor = (record: InvitationRecord) => {
    if (record.url) return record.url;
    if (record.token && typeof window !== "undefined") {
      return `${window.location.origin}/rsvp/${encodeURIComponent(record.token)}`;
    }
    return "";
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">Invitations</h3>
        <p className="text-xs text-[var(--bhn-text-muted)]">
          Invitations are link-based. Generate links, then copy and share them yourself — nothing is sent by email or
          SMS automatically.
        </p>
      </div>

      <Alert tone="info" title="Link-based delivery only">
        Copy each invite link and share it with the guest. The app does not claim that an email or text message was
        delivered.
      </Alert>

      {guests.length > 0 ? (
        <div className="bhn-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--bhn-text)]">Choose guests</p>
            <p className="text-xs text-[var(--bhn-text-muted)]">
              {selectedGuests.length ? `${selectedGuests.length} selected` : "None selected = all guests"}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {guests.map((guest) => (
              <label
                key={guest._id}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--bhn-surface-2)] px-3 py-2 text-sm text-[var(--bhn-text)]"
              >
                <input
                  type="checkbox"
                  checked={selectedGuests.includes(guest._id)}
                  onChange={() => toggleGuest(guest._id)}
                />
                <span className="truncate">{guest.name}</span>
                {guest.rsvpStatus ? <Badge tone="neutral">{guest.rsvpStatus}</Badge> : null}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant="secondary" loading={creating} icon={<Link2 size={14} />} onClick={generate}>
              Generate invite links
            </Button>
            <Button size="sm" loading={sending} icon={<Send size={14} />} onClick={send}>
              Create &amp; copy links
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--bhn-text-muted)]">
          Add guests in the Guests tab before creating invitation links.
        </p>
      )}

      {links.length > 0 ? (
        <div className="bhn-card p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-semibold text-[var(--bhn-text)]">Copy invite links</h4>
            <Button size="sm" variant="secondary" icon={<Copy size={14} />} onClick={copyAll}>
              Copy all links
            </Button>
          </div>
          {links.map((link) => (
            <div key={link.guestId} className="flex flex-wrap items-center gap-2">
              <input readOnly value={link.url} className="bhn-input min-w-56 flex-1" aria-label={`Invite link for ${link.guestName}`} />
              <Button size="sm" icon={<Copy size={14} />} onClick={() => copyOne(link.url, link.guestName)}>
                Copy invite link
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <ResourceState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={invitations.length === 0}
        emptyTitle="No invitations generated"
        emptyDescription="Generate invite links for your guests to see them listed here."
        onRetry={() => refetch()}
      >
        <div className="space-y-2">
          {invitations.map((record, index) => {
            const url = linkFor(record);
            return (
              <div
                key={record._id || record.id || record.guestId || index}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--bhn-surface-2)] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--bhn-text)]">{record.guestName || "Guest"}</p>
                  <p className="truncate text-xs text-[var(--bhn-text-muted)]">{url || "No link available"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {record.status ? <Badge tone="neutral">{record.status}</Badge> : null}
                  {url ? (
                    <Button size="sm" variant="secondary" icon={<Copy size={13} />} onClick={() => copyOne(url, record.guestName)}>
                      Copy invite link
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </ResourceState>
    </div>
  );
}
