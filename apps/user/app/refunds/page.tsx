"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import { EmptyState, PageHeader, Spinner } from "@bandhan/ui";
import { useGetReturnsQuery } from "@/store/api/returnApi";

const toneForStatus: Record<string, "warning" | "success" | "danger" | "neutral"> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
  Refunded: "success",
};

function RefundsContent() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("requested") === "1";
  const { data, isLoading, isError, refetch } = useGetReturnsQuery();
  const returns = Array.isArray(data?.returns) ? data.returns : [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <PageHeader
          title="Returns & refunds"
          subtitle="Track the return, cancellation and refund requests for your orders."
        />

        {requested && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--bhn-success-200)] bg-[var(--bhn-success-50)] p-4 text-sm text-[var(--bhn-success-700)]">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>Your request has been submitted. You can follow its status below.</span>
          </div>
        )}

        {isLoading ? (
          <div className="mt-10 flex justify-center"><Spinner /></div>
        ) : isError ? (
          <div className="mt-10">
            <EmptyState
              title="Could not load refund requests"
              description="Please try again in a moment."
              action={<button className="bhn-btn bhn-btn-primary" onClick={() => refetch()}><RefreshCw size={16} /> Retry</button>}
            />
          </div>
        ) : returns.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No refund requests yet"
              description="If something is not right with an order, open the order and request a return or cancellation."
              action={<Link href="/orders" className="bhn-btn bhn-btn-primary">View my orders</Link>}
            />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {returns.map((request) => (
              <div key={request._id} className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--bhn-text)]">{request.productName || request.type || "Order"}</p>
                    <p className="text-xs text-[var(--bhn-text-muted)]">
                      Request {request.requestId || request._id} · {request.requestKind === "cancel" ? "Cancellation" : "Return"}
                      {request.createdAt ? ` · ${new Date(request.createdAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <span className={`bhn-badge ${toneForStatus[request.status] || "neutral"}`}>{request.status}</span>
                </div>
                <p className="mt-3 text-sm text-[var(--bhn-text-muted)]">Reason: {request.reason}</p>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--bhn-border)] pt-3 text-sm">
                  <span className="text-[var(--bhn-text-muted)]">Refund amount</span>
                  <span className="font-semibold text-[var(--bhn-text)]">₹{Number(request.amount || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function RefundsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner /></div>}>
      <RefundsContent />
    </Suspense>
  );
}
