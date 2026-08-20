"use client";

import Link from "next/link";
import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import { useGetQuotesQuery, type Quote } from "@/store/api/quoteApi";

type QuoteParty = string | {
  _id?: string;
  fullName?: string;
  companyName?: string;
  name?: string;
};

type QuoteView = Quote & {
  sellerId?: QuoteParty;
  vendorId?: QuoteParty;
  sellerName?: string;
};

const partyField = (party: QuoteParty | undefined, field: "_id" | "fullName" | "companyName" | "name") =>
  typeof party === "object" && party !== null ? party[field] : undefined;

const partyId = (party?: QuoteParty) =>
  typeof party === "string" ? party : party?._id;

const statusClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const normalizeStatus = (status?: string) => String(status || "").trim().toLowerCase();

const getSellerName = (quote: QuoteView) =>
  partyField(quote.sellerId, "fullName") ||
  partyField(quote.sellerId, "companyName") ||
  quote?.conversationSellerName ||
  partyField(quote.vendorId, "name") ||
  partyField(quote.vendorId, "companyName") ||
  quote?.sellerName ||
  "Seller";

const getServiceName = (quote: QuoteView) =>
  quote?.title ||
  quote?.serviceId?.title ||
  quote?.venueId?.name ||
  quote?.venueId?.title ||
  quote?.productId?.name ||
  quote?.productId?.title ||
  (Array.isArray(quote?.services) ? quote.services.join(", ") : "") ||
  "Custom Request";

export default function QuoteListPage() {
  const { data, isLoading, isError } = useGetQuotesQuery();
  const quotes = (data?.data ?? []) as QuoteView[];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1A16]">My Quotations</h1>
            <p className="mt-1 text-sm text-[#6B625A]">
              Review your quote requests and provider responses.
            </p>
          </div>
          <Link
            href="/userdashboard/quote/request"
            className="rounded-xl bg-[#924C2B] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Request a quote
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-xl bg-white p-5 text-sm">Loading quotations…</div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Unable to load your quotations. Please try again.
          </div>
        ) : null}

        {!isLoading && !isError && quotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D8C8BE] bg-white p-8 text-center">
            <p className="font-semibold">No quotations yet</p>
            <p className="mt-1 text-sm text-[#6B625A]">
              Request a quote from a service, venue, or product listing to see it here.
            </p>
          </div>
        ) : null}

        <div className="space-y-3">
          {quotes.map((quote) => {
            const normalizedStatus = normalizeStatus(quote?.status);
            const allowedInboxStatuses = ["approved", "pending", "accepted"];
            const isRejected = normalizedStatus === "rejected";
            const sellerName = getSellerName(quote);
            const serviceName = getServiceName(quote);

            const sellerIdVal = partyId(quote.sellerId) || partyId(quote.vendorId);

            const canOpenInbox =
              allowedInboxStatuses.includes(normalizedStatus) &&
              Boolean(quote?.conversationId || sellerIdVal);

            const inboxHref = quote?.conversationId
              ? `/userdashboard/inbox?conversationId=${quote.conversationId}`
              : sellerIdVal
              ? `/userdashboard/inbox?sellerId=${sellerIdVal}&quoteId=${quote._id}`
              : "/userdashboard/inbox";

            return (
              <div
                key={quote._id}
                className="rounded-xl border border-[#E7E1D8] bg-white p-5 transition hover:border-[#B66A43] hover:shadow-sm"
              >
                <Link href={`/userdashboard/quote/${quote._id}`} className="block">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#1C1A16]">{serviceName}</p>
                      <p className="mt-1 text-sm text-[#6B625A]">
                        {quote.eventType || "Event"} · {quote.location || "Location"} ·{" "}
                        {quote.eventDate || "Date pending"}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#924C2B]">
                        Budget: ₹{Number(quote.budget || quote.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        statusClass[normalizedStatus] || statusClass.pending
                      }`}
                    >
                      {quote?.status || "Pending"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-[#8D817A]">
                    Requested {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString("en-GB") : "Date unavailable"}
                  </p>
                </Link>

                {canOpenInbox && !isRejected ? (
                  <Link
                    href={inboxHref}
                    className="mt-4 inline-flex rounded-lg bg-[#924C2B] px-3 py-2 text-xs font-semibold text-white"
                  >
                    Open Inbox · {sellerName}
                  </Link>
                ) : null}

                {isRejected ? (
                  <div className="mt-4 inline-flex rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                    Quote Rejected - Chat Closed
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
