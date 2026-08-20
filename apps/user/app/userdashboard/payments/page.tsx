"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock2,
  CreditCard,
  Download,
  FileText,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import {
  useGetUserInvoicesQuery,
  type InvoiceRecord,
} from "@/store/api/invoiceApi";

const getInvoiceStatus = (invoice: InvoiceRecord) =>
  String(invoice.paymentStatus || invoice.status || "paid").toLowerCase();

const formatInvoiceDate = (value?: string) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function PaymentsPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetUserInvoicesQuery();

  const invoices = useMemo(
    () => (Array.isArray(data?.invoices) ? data.invoices : []),
    [data],
  );

  const paidInvoices = useMemo(
    () => invoices.filter((invoice) => getInvoiceStatus(invoice) === "paid"),
    [invoices],
  );
  const adjustedInvoices = invoices.length - paidInvoices.length;
  const totalPaid = paidInvoices.reduce(
    (total, invoice) => total + Number(invoice.total || 0),
    0,
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6 py-6">
        <div className="flex flex-col gap-4 border-b border-[var(--bhn-border)] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2.5">
              <div className="bhn-icon-tile text-[var(--bhn-brand-700)]">
                <CreditCard size={22} />
              </div>
              <h1 className="font-serif text-2xl font-bold text-[var(--bhn-text)]">Payments & invoices</h1>
            </div>
            <p className="text-sm text-[var(--bhn-text-muted)]">
              Amounts and statuses below come from invoices generated after verified payments.
            </p>
          </div>

          <div className="bhn-card px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--bhn-text-muted)]">Paid invoice total</p>
            <p className="text-2xl font-bold text-[var(--bhn-text)]">₹{totalPaid.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="bhn-card p-12 text-center">
            <Clock2 className="mx-auto mb-3 animate-spin text-[var(--bhn-brand-600)]" size={36} />
            <p className="font-medium text-[var(--bhn-text)]">Loading verified invoices…</p>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-[var(--bhn-error-200)] bg-[var(--bhn-error-50)] p-8 text-center">
            <AlertCircle className="mx-auto text-[var(--bhn-error-600)]" size={32} />
            <p className="mt-2 font-semibold text-[var(--bhn-error-700)]">Unable to load payment records</p>
            <p className="mt-1 text-sm text-[var(--bhn-error-600)]">No order data has been substituted for missing invoices.</p>
            <button type="button" onClick={() => refetch()} className="bhn-btn bhn-btn-secondary mt-5 gap-2">
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bhn-card p-12 text-center">
            <div className="bhn-icon-tile mx-auto mb-4 text-[var(--bhn-brand-700)]">
              <FileText size={28} />
            </div>
            <h2 className="text-lg font-semibold text-[var(--bhn-text)]">No verified invoices yet</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-[var(--bhn-text-muted)]">
              An invoice will appear here after a payment is verified and its order is created.
            </p>
            <Link href="/products" className="bhn-btn bhn-btn-primary mt-6 gap-2">
              Browse products <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bhn-card p-4">
                <p className="text-xs text-[var(--bhn-text-muted)]">All invoices</p>
                <p className="mt-1 text-xl font-bold text-[var(--bhn-text)]">{invoices.length}</p>
              </div>
              <div className="bhn-card p-4">
                <p className="text-xs text-[var(--bhn-text-muted)]">Paid</p>
                <p className="mt-1 text-xl font-bold text-[var(--bhn-text)]">{paidInvoices.length}</p>
              </div>
              <div className="bhn-card p-4">
                <p className="text-xs text-[var(--bhn-text-muted)]">Refunded or adjusted</p>
                <p className="mt-1 text-xl font-bold text-[var(--bhn-text)]">{adjustedInvoices}</p>
              </div>
            </div>

            <div className="space-y-3">
              {invoices.map((invoice) => {
                const status = getInvoiceStatus(invoice);
                const isPaid = status === "paid";
                const orderId = typeof invoice.orderId === "string" ? invoice.orderId : "";

                return (
                  <article key={invoice._id || invoice.invoiceNo} className="bhn-card bhn-card-hover p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-bold text-[var(--bhn-text)]">Invoice #{invoice.invoiceNo}</h2>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            isPaid
                              ? "bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]"
                              : "bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]"
                          }`}>
                            {isPaid ? <CheckCircle2 size={12} /> : <RotateCcw size={12} />}
                            {status.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--bhn-text-muted)]">
                          Issued {formatInvoiceDate(invoice.createdAt || invoice.updatedAt)} · {invoice.items?.length || 0} item{invoice.items?.length === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-[var(--bhn-border)] pt-3 sm:border-0 sm:pt-0">
                        <div className="sm:text-right">
                          <p className="text-xs text-[var(--bhn-text-muted)]">Invoice amount</p>
                          <p className="text-xl font-bold text-[var(--bhn-text)]">₹{Number(invoice.total || 0).toLocaleString("en-IN")}</p>
                        </div>
                        {invoice.invoiceUrl ? (
                          <a href={invoice.invoiceUrl} target="_blank" rel="noreferrer" className="bhn-btn bhn-btn-secondary bhn-btn-sm gap-2">
                            <Download size={14} /> Download
                          </a>
                        ) : orderId ? (
                          <Link href={`/userdashboard/orders/${orderId}`} className="bhn-btn bhn-btn-secondary bhn-btn-sm">
                            View order
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
