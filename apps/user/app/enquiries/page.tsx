"use client";

import { useState } from "react";
import { AlertCircle, MessageSquare, RefreshCw, Send } from "lucide-react";
import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import EnquiryModal, { type EnquiryTarget } from "@/components/Enquiry/EnquiryModal";
import { Button } from "@/components/ui/Button";
import { useGetEnquiriesQuery } from "@/store/api/customerApi";
import { EmptyState, PageHeader, Spinner } from "@bandhan/ui";

const formatDate = (value?: string) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function EnquiriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetEnquiriesQuery();
  const enquiries = Array.isArray(data?.enquiries) ? data.enquiries : [];
  const target: EnquiryTarget = {
    listingType: "general",
    listingId: "general",
    title: "General enquiry",
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            title="My enquiries"
            subtitle="Track enquiries saved to your account and their latest platform status."
          />
          <Button variant="primary" icon={<Send className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            New enquiry
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="bhn-card p-8 text-center">
            <AlertCircle className="mx-auto text-[var(--bhn-error-600)]" size={32} />
            <h2 className="mt-3 font-semibold text-[var(--bhn-text)]">Enquiries unavailable</h2>
            <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">We could not load your saved enquiries.</p>
            <button type="button" onClick={() => refetch()} className="bhn-btn bhn-btn-primary mt-5 gap-2">
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : enquiries.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={24} />}
            title="No enquiries yet"
            description="Ask about a product, service, venue, or general planning need."
            action={<button type="button" onClick={() => setModalOpen(true)} className="bhn-btn bhn-btn-primary">Send an enquiry</button>}
          />
        ) : (
          <div className="space-y-3">
            {enquiries.map((enquiry) => (
              <article key={enquiry._id} className="bhn-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-[var(--bhn-text)]">{enquiry.title || `${enquiry.entityType} enquiry`}</h2>
                    <p className="mt-0.5 text-xs capitalize text-[var(--bhn-text-muted)]">
                      {enquiry.entityType} · {enquiry.status}
                    </p>
                  </div>
                  <time className="text-xs text-[var(--bhn-text-soft)]">{formatDate(enquiry.createdAt)}</time>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--bhn-text-muted)]">{enquiry.message}</p>
                {(enquiry.requiredDate || typeof enquiry.budget === "number" || typeof enquiry.guestCount === "number") && (
                  <dl className="mt-4 grid gap-3 border-t border-[var(--bhn-border)] pt-4 text-xs sm:grid-cols-3">
                    {enquiry.requiredDate && (
                      <div>
                        <dt className="text-[var(--bhn-text-soft)]">Required date</dt>
                        <dd className="mt-1 font-medium text-[var(--bhn-text)]">{formatDate(enquiry.requiredDate)}</dd>
                      </div>
                    )}
                    {typeof enquiry.budget === "number" && (
                      <div>
                        <dt className="text-[var(--bhn-text-soft)]">Budget</dt>
                        <dd className="mt-1 font-medium text-[var(--bhn-text)]">₹{enquiry.budget.toLocaleString("en-IN")}</dd>
                      </div>
                    )}
                    {typeof enquiry.guestCount === "number" && (
                      <div>
                        <dt className="text-[var(--bhn-text-soft)]">Guests</dt>
                        <dd className="mt-1 font-medium text-[var(--bhn-text)]">{enquiry.guestCount}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {modalOpen && <EnquiryModal target={target} onClose={() => setModalOpen(false)} />}
    </DashboardLayout>
  );
}
