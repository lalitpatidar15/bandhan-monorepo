"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import {
  useApproveSellerQuoteMutation,
  useGetSellerQuotesQuery,
  useRejectSellerQuoteMutation,
} from "@/lib/store/api/chatApi";

const statusStyles: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  accepted: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border border-rose-200",
  pending: "bg-amber-100 text-amber-800 border border-amber-200",
};

const normalizeStatus = (status: any) => String(status || "pending").trim().toLowerCase();

export default function SellerQuotesPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetSellerQuotesQuery();
  const [approveQuote, { isLoading: approving }] = useApproveSellerQuoteMutation();
  const [rejectQuote, { isLoading: rejecting }] = useRejectSellerQuoteMutation();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  const quotes = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  // Approve Quote Handler
  const handleApprove = async (quote: any) => {
    if (!quote?._id || approving || rejecting) return;
    try {
      await approveQuote({ quoteId: quote._id }).unwrap();
      
      // Update local state instantly so UI updates without delay
      setSelectedQuote((prev: any) => (prev?._id === quote._id ? { ...prev, status: "approved" } : prev));
      refetch();
    } catch (err) {
      console.error("Approve quote failed", err);
    }
  };

  // Reject Quote Handler
  const handleReject = async (quoteId: string) => {
    if (!quoteId || approving || rejecting) return;
    try {
      await rejectQuote({ quoteId }).unwrap();
      
      // Update local state instantly so UI updates without delay
      setSelectedQuote((prev: any) => (prev?._id === quoteId ? { ...prev, status: "rejected" } : prev));
      refetch();
    } catch (err) {
      console.error("Reject quote failed", err);
    }
  };

  // Open Direct 1-on-1 Chat with Specific Customer
  const handleOpenChat = (quote: any) => {
    const currentStatus = normalizeStatus(quote.status);
    if (currentStatus === "rejected") return; // Block chat if rejected

    const conversationId = quote.conversationId || quote.conversation?._id;
    const userId = quote.userId?._id || quote.userId;

    if (conversationId) {
      router.push(`/chat?conversationId=${conversationId}`);
    } else if (userId) {
      router.push(`/chat?userId=${userId}&quoteId=${quote._id}`);
    } else {
      router.push("/chat");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#332219]">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 max-w-7xl mx-auto space-y-6">
          {/* Main Top Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8DFC0]/60 pb-6">
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#4A2612]">
                {selectedQuote ? "Quote Request Details" : "Quote Requests"}
              </h1>
              <p className="mt-1 text-sm text-[#7A6252]">
                {selectedQuote
                  ? "View complete customer specifications and initiate direct service-specific chat."
                  : "Review incoming customer quotes and open direct chat."}
              </p>
            </div>
            {selectedQuote ? (
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="inline-flex items-center justify-center rounded-xl bg-[#EBE3D5] px-5 py-2.5 text-sm font-semibold text-[#4A2612] hover:bg-[#E2D6C3] transition-all"
              >
                ← Back to All Quotes List
              </button>
            ) : (
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-xl bg-[#633318] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#4E2711] transition-all"
              >
                Open Chat Inbox
              </Link>
            )}
          </div>

          {/* Loading / Error States */}
          {isLoading ? (
            <div className="rounded-2xl border border-[#ECE2D8] bg-white p-8 text-center text-sm text-[#7A6252] animate-pulse">
              Loading quote requests...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Unable to load quote requests. Please refresh the page.
            </div>
          ) : quotes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#D5C7B7] bg-white p-12 text-center space-y-2">
              <p className="font-serif text-lg font-semibold text-[#4A2612]">No quote requests found</p>
              <p className="text-sm text-[#7A6252]">
                Customer quote inquiries will appear here automatically.
              </p>
            </div>
          ) : selectedQuote ? (
            /* DETAIL VIEW FOR A SINGLE QUOTE */
            (() => {
              const currentStatus = normalizeStatus(selectedQuote.status);
              const isApproved = currentStatus === "approved" || currentStatus === "accepted";
              const isRejected = currentStatus === "rejected";
              const isPending = currentStatus === "pending";

              return (
                <div className="rounded-3xl border border-[#E8DFC0] bg-white p-8 shadow-md space-y-8 animate-fadeIn">
                  {/* Header inside detail page */}
                  <div className="flex items-center justify-between border-b border-[#F0E8DC] pb-6">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-[#8C6D58] uppercase">
                        Customer Quote Request
                      </span>
                      <h2 className="font-serif text-3xl font-bold text-[#3D2213] mt-1">
                        {selectedQuote.title ||
                          selectedQuote.serviceId?.title ||
                          selectedQuote.venueId?.name ||
                          "Requested Services Overview"}
                      </h2>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase ${
                        statusStyles[currentStatus] || statusStyles.pending
                      }`}
                    >
                      {selectedQuote.status || "Pending"}
                    </span>
                  </div>

                  {/* Data Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    <DetailBox
                      label="Customer Name"
                      value={
                        selectedQuote.fullName ||
                        selectedQuote.userId?.fullName ||
                        selectedQuote.conversationBuyerName ||
                        "Customer"
                      }
                    />
                    <DetailBox
                      label="Contact Info"
                      value={
                        selectedQuote.phone ||
                        selectedQuote.email ||
                        selectedQuote.userId?.email ||
                        "Not Provided"
                      }
                    />
                    <DetailBox label="Event Location" value={selectedQuote.location || "N/A"} />
                    <DetailBox
                      label="Guests Count"
                      value={selectedQuote.guestRange || selectedQuote.guests || "Not Specified"}
                    />
                    <DetailBox
                      label="Event Date"
                      value={
                        selectedQuote.eventDate
                          ? new Date(selectedQuote.eventDate).toLocaleDateString("en-GB")
                          : "Pending"
                      }
                    />
                    <DetailBox
                      label="Quoted Budget"
                      value={`₹${Number(selectedQuote.budget || selectedQuote.price || 0).toLocaleString(
                        "en-IN"
                      )}`}
                    />
                  </div>

                  {/* Service tags and note */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-[#FAF8F5] p-6 border border-[#F0E8DC]">
                      <h4 className="text-xs font-bold text-[#8C6D58] uppercase tracking-wider mb-3">
                        Selected Services
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedQuote.services) && selectedQuote.services.length > 0 ? (
                          selectedQuote.services.map((srv: string, idx: number) => (
                            <span
                              key={idx}
                              className="rounded-xl bg-[#EBE3D5] px-3.5 py-1.5 text-xs font-semibold text-[#4A2612]"
                            >
                              {srv}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#7A6252]">No additional service tags</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#FAF8F5] p-6 border border-[#F0E8DC]">
                      <h4 className="text-xs font-bold text-[#8C6D58] uppercase tracking-wider mb-3">
                        Customer Message & Notes
                      </h4>
                      <p className="text-sm text-[#3D2213] whitespace-pre-wrap leading-relaxed">
                        {selectedQuote.note ||
                          selectedQuote.description ||
                          "No specific instructions provided by the customer."}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#F0E8DC] pt-6 gap-4">
                    <div className="flex items-center gap-3">
                      {/* PENDING: Show both Approve and Reject */}
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(selectedQuote)}
                            disabled={approving || rejecting}
                            className="rounded-xl bg-[#633318] px-6 py-3 text-xs font-semibold text-white hover:bg-[#4E2711] shadow-md disabled:opacity-50 transition-all"
                          >
                            {approving ? "Approving..." : "Approve Quote"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(selectedQuote._id)}
                            disabled={approving || rejecting}
                            className="rounded-xl border border-[#D5C7B7] bg-white px-6 py-3 text-xs font-semibold text-[#3D2213] hover:bg-[#F3EEE7] disabled:opacity-50 transition-all"
                          >
                            {rejecting ? "Rejecting..." : "Reject Quote"}
                          </button>
                        </>
                      )}

                      {/* APPROVED: Hide Reject Button completely */}
                      {isApproved && (
                        <span className="rounded-xl bg-emerald-100 border border-emerald-300 px-5 py-2.5 text-xs font-bold text-emerald-800">
                          ✓ Quote Approved
                        </span>
                      )}

                      {/* REJECTED: Hide Approve Button completely */}
                      {isRejected && (
                        <span className="rounded-xl bg-rose-100 border border-rose-300 px-5 py-2.5 text-xs font-bold text-rose-800">
                          ✕ Quote Rejected
                        </span>
                      )}
                    </div>

                    {/* Chat Action: Enabled for Pending & Approved, Disabled for Rejected */}
                    {!isRejected ? (
                      <button
                        type="button"
                        onClick={() => handleOpenChat(selectedQuote)}
                        className="rounded-xl bg-[#924C2B] px-8 py-3 text-xs font-semibold text-white hover:bg-[#7A3D1F] shadow-md transition-all"
                      >
                        Open Direct Chat with Customer
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl">
                        Chat Disabled (Quote Rejected)
                      </span>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            /* ALL QUOTES TABLE VIEW */
            <div className="overflow-x-auto rounded-3xl border border-[#E8DFC0]/70 bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#F3EEE7] text-xs font-semibold uppercase text-[#7A6252] tracking-wider border-b border-[#E8DFC0]/70">
                  <tr>
                    <th className="px-6 py-4">Service / Venue</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Event Date</th>
                    <th className="px-6 py-4">Budget</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E8DC]">
                  {quotes.map((quote: any) => {
                    const status = normalizeStatus(quote.status);

                    const listingName =
                      quote.serviceId?.title ||
                      quote.venueId?.name ||
                      quote.venueId?.title ||
                      quote.productId?.name ||
                      quote.title ||
                      (Array.isArray(quote.services) ? quote.services.join(", ") : null) ||
                      "Custom Request";

                    const customerName =
                      quote.userId?.fullName ||
                      quote.fullName ||
                      quote.userId?.email ||
                      quote.conversationBuyerName ||
                      "Customer";

                    const formattedDate = quote.eventDate
                      ? new Date(quote.eventDate).toLocaleDateString("en-GB")
                      : "Date Pending";

                    const budget = `₹${Number(quote.budget || quote.price || 0).toLocaleString("en-IN")}`;

                    return (
                      <tr
                        key={quote._id}
                        onClick={() => setSelectedQuote(quote)}
                        className="transition-colors hover:bg-[#FAF6F0] cursor-pointer"
                      >
                        <td className="px-6 py-4 font-semibold text-[#3D2213]">{listingName}</td>
                        <td className="px-6 py-4 text-[#6B5545]">{customerName}</td>
                        <td className="px-6 py-4 text-[#6B5545]">
                          {quote.eventType ? `${quote.eventType} • ` : ""}
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#3D2213]">{budget}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ${
                              statusStyles[status] || statusStyles.pending
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuote(quote);
                            }}
                            className="rounded-xl bg-[#633318] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4E2711] transition-all shadow-sm"
                          >
                            View Details & Chat
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-4 bg-[#FAF8F5] border border-[#F0E8DC]">
      <p className="text-[11px] font-bold text-[#8C6D58] uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#3D2213] capitalize">{value}</p>
    </div>
  );
}