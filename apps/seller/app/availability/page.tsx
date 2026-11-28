"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Field,
  Input,
  PageHeader,
  SectionHeader,
  Spinner,
} from "@bandhan/ui";
import Sidebar from "@/components/Sidebar";
import { apiGet, apiPut } from "@/lib/api";
import { getApiErrorMessage, normalizeList } from "@/lib/response";

type AvailabilitySlot = { start: string; end: string; isBlocked?: boolean };
type AvailabilityRecord = {
  _id?: string;
  sellerId?: string;
  date: string;
  slots: AvailabilitySlot[];
};

const today = () => new Date().toISOString().slice(0, 10);

export default function AvailabilityPage() {
  const [records, setRecords] = useState<AvailabilityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([
    { start: "10:00", end: "13:00", isBlocked: false },
  ]);

  const load = async () => {
    setIsLoading(true);
    try {
      const response = await apiGet("/vendor/availability");
      setRecords(normalizeList<AvailabilityRecord>(response));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not load your availability"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedRecord = useMemo(
    () => records.find((record) => String(record.date).slice(0, 10) === date),
    [records, date],
  );

  useEffect(() => {
    setSlots(
      selectedRecord?.slots?.length
        ? selectedRecord.slots.map((slot) => ({ ...slot }))
        : [{ start: "10:00", end: "13:00", isBlocked: false }],
    );
  }, [selectedRecord]);

  const save = async () => {
    if (!date) {
      toast.error("Choose a date first");
      return;
    }
    const cleaned = slots
      .map((slot) => ({ ...slot, start: slot.start.trim(), end: slot.end.trim() }))
      .filter((slot) => slot.start && slot.end);
    if (cleaned.length === 0) {
      toast.error("Add at least one time slot");
      return;
    }

    setIsSaving(true);
    try {
      await apiPut("/vendor/availability", { date, slots: cleaned });
      toast.success("Availability saved");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save availability"));
    } finally {
      setIsSaving(false);
    }
  };

  const updateSlot = (index: number, patch: Partial<AvailabilitySlot>) => {
    setSlots((current) => current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, ...patch } : slot)));
  };

  return (
    <div className="flex min-h-screen bg-[var(--bhn-bg)]">
      <Sidebar />
      <div className="flex-1 overflow-hidden px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <PageHeader
            title="Availability"
            subtitle="Tell buyers when you can take bookings and which hours are blocked."
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card padded={false}>
              <CardBody>
                <SectionHeader title="Set hours for a date" />
                <div className="mt-4 space-y-4">
                  <Field label="Date" required>
                    <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                  </Field>

                  <div className="space-y-3">
                    {slots.map((slot, index) => (
                      <div key={index} className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-3">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          <Field label="From">
                            <Input type="time" value={slot.start} onChange={(event) => updateSlot(index, { start: event.target.value })} />
                          </Field>
                          <Field label="To">
                            <Input type="time" value={slot.end} onChange={(event) => updateSlot(index, { end: event.target.value })} />
                          </Field>
                          <Field label="Status">
                            <select
                              className="bhn-select"
                              value={slot.isBlocked ? "blocked" : "open"}
                              onChange={(event) => updateSlot(index, { isBlocked: event.target.value === "blocked" })}
                            >
                              <option value="open">Open</option>
                              <option value="blocked">Blocked</option>
                            </select>
                          </Field>
                        </div>
                        {slots.length > 1 ? (
                          <div className="mt-2 flex justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<Trash2 size={14} />}
                              disabled={isSaving}
                              onClick={() => setSlots((current) => current.filter((_, slotIndex) => slotIndex !== index))}
                            >
                              Remove slot
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="secondary"
                      icon={<Plus size={14} />}
                      disabled={isSaving}
                      onClick={() => setSlots((current) => [...current, { start: "", end: "", isBlocked: false }])}
                    >
                      Add slot
                    </Button>
                    <Button onClick={save} loading={isSaving}>Save availability</Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card padded={false}>
              <CardBody>
                <SectionHeader title="Saved dates" />
                {isLoading ? (
                  <div className="mt-8 flex justify-center"><Spinner /></div>
                ) : records.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState
                      icon={<CalendarDays size={24} />}
                      title="No availability saved"
                      description="Add open hours for a date so buyers know when you can take bookings."
                    />
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {records
                      .slice()
                      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
                      .map((record) => (
                        <button
                          key={record._id || record.date}
                          type="button"
                          onClick={() => setDate(String(record.date).slice(0, 10))}
                          className="w-full rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-3 text-left transition hover:bg-[var(--bhn-surface-2)]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-[var(--bhn-text)]">
                              {new Date(`${String(record.date).slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, {
                                weekday: "short", day: "numeric", month: "short", year: "numeric",
                              })}
                            </p>
                            <Badge tone="brand">{record.slots?.length || 0} slots</Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(record.slots || []).map((slot, index) => (
                              <span
                                key={index}
                                className="rounded-full border border-[var(--bhn-border)] px-2 py-0.5 text-xs text-[var(--bhn-text-muted)]"
                              >
                                {slot.start}–{slot.end}{slot.isBlocked ? " (blocked)" : ""}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
