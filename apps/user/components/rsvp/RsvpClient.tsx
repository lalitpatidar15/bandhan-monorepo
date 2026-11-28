"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CalendarDays, Check, MapPin, Users } from "lucide-react";
import toast from "react-hot-toast";
import { Alert, Badge, Button, Card, Logo, Spinner } from "@bandhan/ui";
import { useGetRsvpInvitationQuery, useSubmitRsvpMutation } from "@/store/api/eventOsApi";
import { RsvpDetails, RsvpStatus } from "@/types/eventOs";
import { errorText, extractItem, formatDate } from "@/components/userDashboard/planner/eventOsUi";

interface Props {
  token: string;
}

type RsvpChoice = Exclude<RsvpStatus, "invited">;

const STATUS_OPTIONS: Array<{ value: RsvpChoice; label: string }> = [
  { value: "attending", label: "Attending" },
  { value: "declined", label: "Declined" },
  { value: "maybe", label: "Maybe" },
];

const MEAL_OPTIONS = ["", "Vegetarian", "Non-vegetarian", "Vegan", "Jain", "Kids"];

export default function RsvpClient({ token }: Props) {
  const { data, isLoading, isError, error, refetch } = useGetRsvpInvitationQuery(token, { skip: !token });
  const details = extractItem<RsvpDetails>(data);
  const invalidLink = !token || isError || (!isLoading && !details);

  return (
    <main className="min-h-screen bg-[var(--bhn-bg)]">
      <div className="border-b border-[var(--bhn-border)] bg-[var(--bhn-surface)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Logo href="/" size="sm" />
          <Link href="/" className="text-xs font-semibold text-[var(--bhn-brand-700)] hover:underline">
            Bandhan home
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <Card className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </Card>
        ) : invalidLink ? (
          <Card className="space-y-4 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bhn-error-50)]">
              <AlertCircle size={24} className="text-[var(--bhn-error-600)]" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[var(--bhn-text)]">Invitation unavailable</h1>
            <p className="mx-auto max-w-md text-sm text-[var(--bhn-text-muted)]">
              This RSVP link is invalid or has expired. Ask the event organiser to send you a new invite link.
            </p>
            {isError ? (
              <p className="text-xs text-[var(--bhn-text-soft)]">{errorText(error)}</p>
            ) : null}
            {isError ? (
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            ) : null}
          </Card>
        ) : details ? (
          <RsvpForm key={details.guest?._id || token} token={token} details={details} />
        ) : null}
      </div>
    </main>
  );
}

function RsvpForm({ token, details }: { token: string; details: RsvpDetails }) {
  const [submitRsvp, { isLoading: submitting }] = useSubmitRsvpMutation();
  const eventInfo = details.event || {};
  const guestInfo = details.guest || {};
  const title = eventInfo.title || details.eventTitle || details.title || "Event invitation";
  const date = eventInfo.date || details.date;
  const location = eventInfo.location || details.location;
  const guestName = guestInfo.name || details.guestName || details.name || "Guest";
  const currentStatus = guestInfo.rsvpStatus || details.rsvpStatus;
  const initialStatus = guestInfo.rsvpStatus;

  const [status, setStatus] = useState<RsvpChoice | "">(
    initialStatus === "attending" || initialStatus === "declined" || initialStatus === "maybe" ? initialStatus : "",
  );
  const [plusOne, setPlusOne] = useState(Boolean(guestInfo.plusOne));
  const [mealPreference, setMealPreference] = useState(guestInfo.mealPreference || "");
  const [submitted, setSubmitted] = useState<RsvpChoice | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      toast.error("Please choose attending, declined or maybe.");
      return;
    }
    try {
      await submitRsvp({
        token,
        data: { status, plusOne, mealPreference: mealPreference || undefined },
      }).unwrap();
      setSubmitted(status);
      toast.success("Your RSVP has been recorded.");
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-text-muted)]">
              You&apos;re invited
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-[var(--bhn-text)]">{title}</h1>
            <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">
              Hello <span className="font-semibold text-[var(--bhn-text)]">{guestName}</span>, please confirm your
              attendance below.
            </p>
          </div>
          {currentStatus ? <Badge tone="neutral">Current: {currentStatus}</Badge> : null}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-[var(--bhn-text-muted)]">
          <span className="flex items-center gap-2">
            <CalendarDays size={15} /> {formatDate(date)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={15} /> {location || "Location to be announced"}
          </span>
        </div>
      </Card>

      {submitted ? (
        <Alert tone="success" title="RSVP recorded">
          You responded <span className="font-semibold">{submitted}</span>. You can change your response by submitting
          the form again.
        </Alert>
      ) : null}

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-lg font-bold text-[var(--bhn-text)]">Your response</h2>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--bhn-text)]">Will you attend? *</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {STATUS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] px-3 py-2 text-sm text-[var(--bhn-text)]"
                >
                  <input
                    type="radio"
                    name="rsvpStatus"
                    value={option.value}
                    checked={status === option.value}
                    onChange={() => setStatus(option.value)}
                    required
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--bhn-text)]">
            <input type="checkbox" checked={plusOne} onChange={(e) => setPlusOne(e.target.checked)} />
            <Users size={15} /> Bringing a plus one
          </label>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--bhn-text)]">Meal preference</label>
            <select
              className="bhn-select w-full"
              value={mealPreference}
              onChange={(e) => setMealPreference(e.target.value)}
            >
              {MEAL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option || "Not specified"}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={submitting} icon={<Check size={15} />}>
            Submit RSVP
          </Button>
        </form>
      </Card>
    </div>
  );
}
