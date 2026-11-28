"use client";

import { useMemo, useState } from "react";
import { Link2, Mail, Phone } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from "@bandhan/ui";
import Sidebar from "@/components/Sidebar";
import {
  useGetVendorLeadsQuery,
  useUpdateVendorLeadMutation,
  type Lead,
} from "@/lib/store/api/vendorApi";

const statusTone: Record<string, "warning" | "info" | "success" | "danger" | "neutral"> = {
  new: "warning",
  contacted: "info",
  qualified: "info",
  converted: "success",
  lost: "danger",
};

const formatCurrency = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? `₹${value.toLocaleString("en-IN")}` : "—";

export default function VendorLeadsPage() {
  const { data, isLoading, isError, refetch } = useGetVendorLeadsQuery();
  const [updateLead, { isLoading: isUpdating }] = useUpdateVendorLeadMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState<Lead["status"]>("new");

  const leads = Array.isArray(data?.data) ? data.data : [];
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSearch = !needle || [lead.name, lead.email, lead.phone, lead.eventType]
        .some((value) => String(value || "").toLowerCase().includes(needle));
      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const openDetail = (lead: Lead) => {
    setDetailLead(lead);
    setNoteDraft(lead.notes || "");
    setStatusDraft(lead.status || "new");
  };

  const quickUpdate = async (lead: Lead, status: Lead["status"]) => {
    try {
      await updateLead({ id: lead._id, status }).unwrap();
      refetch();
    } catch {
      // Error feedback below covers both paths.
    }
  };

  const saveDetail = async () => {
    if (!detailLead) return;
    try {
      await updateLead({ id: detailLead._id, status: statusDraft, notes: noteDraft }).unwrap();
      setDetailLead(null);
      refetch();
    } catch {
      // Toast is rendered inline below the form.
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bhn-bg)]">
      <Sidebar />
      <div className="flex-1 overflow-hidden px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            title="Leads"
            subtitle="Enquiries buyers send from your public vendor profile."
          />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email or event type"
              className="sm:max-w-xs"
            />
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="sm:w-48">
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </Select>
          </div>

          {isLoading ? (
            <div className="mt-10 flex justify-center"><Spinner /></div>
          ) : isError ? (
            <div className="mt-10">
              <EmptyState
                title="Could not load leads"
                description="Please try again in a moment."
                action={<Button variant="secondary" onClick={() => refetch()}>Retry</Button>}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={<Link2 size={24} />}
                title={leads.length === 0 ? "No leads yet" : "No matching leads"}
                description={leads.length === 0
                  ? "Share your vendor profile so buyers can send you enquiries."
                  : "Try a different search or status filter."}
              />
            </div>
          ) : (
            <Card className="mt-6" padded={false}>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase text-[var(--bhn-text-muted)]">
                      <tr>
                        <th className="pb-3">Buyer</th>
                        <th className="pb-3">Event</th>
                        <th className="pb-3">Budget</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Received</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((lead) => (
                        <tr key={lead._id} className="border-t border-[var(--bhn-border)]">
                          <td className="py-3">
                            <p className="font-medium text-[var(--bhn-text)]">{lead.name}</p>
                            <p className="text-xs text-[var(--bhn-text-muted)]">{lead.email || lead.phone || "—"}</p>
                          </td>
                          <td className="py-3">
                            <p className="text-[var(--bhn-text)]">{lead.eventType || "—"}</p>
                            <p className="text-xs text-[var(--bhn-text-muted)]">{lead.eventDate || "Date not set"}</p>
                          </td>
                          <td className="py-3 text-[var(--bhn-text)]">{formatCurrency(lead.budget)}</td>
                          <td className="py-3">
                            <Badge tone={statusTone[lead.status || "new"] || "neutral"}>
                              {(lead.status || "new").replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3 text-xs text-[var(--bhn-text-muted)]">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="secondary" onClick={() => openDetail(lead)}>Details</Button>
                              {lead.status !== "contacted" ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={isUpdating}
                                  onClick={() => quickUpdate(lead, "contacted")}
                                >
                                  Mark contacted
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        <Modal
          open={Boolean(detailLead)}
          onClose={() => setDetailLead(null)}
          title={`Lead · ${detailLead?.name || ""}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDetailLead(null)}>Close</Button>
              <Button onClick={saveDetail} loading={isUpdating}>Save changes</Button>
            </>
          }
        >
          {detailLead ? (
            <div className="space-y-4">
              <div className="space-y-1 text-sm text-[var(--bhn-text-muted)]">
                {detailLead.email ? <p className="flex items-center gap-2"><Mail size={14} /> {detailLead.email}</p> : null}
                {detailLead.phone ? <p className="flex items-center gap-2"><Phone size={14} /> {detailLead.phone}</p> : null}
                <p>Source: {detailLead.source || "Vendor profile"}</p>
                <p>Budget: {formatCurrency(detailLead.budget)}</p>
              </div>
              <Field label="Status">
                <Select value={statusDraft} onChange={(event) => setStatusDraft(event.target.value as Lead["status"])}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </Select>
              </Field>
              <Field label="Notes">
                <Textarea rows={4} value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Follow-up notes" />
              </Field>
            </div>
          ) : null}
        </Modal>
      </div>
    </div>
  );
}
