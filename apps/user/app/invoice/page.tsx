"use client";

import { useGetUserInvoicesQuery } from "@/store/api/invoiceApi";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { Sidebar } from "@/components/ui/Sidebar";
import { FileText, Download } from "lucide-react";

export default function InvoicesPage() {
  const { data, isLoading } = useGetUserInvoicesQuery();
  const invoices = Array.isArray(data?.invoices) ? data.invoices : [];

  return (
    <div className="min-h-screen bg-[var(--bhn-surface-2)]">
      <Header variant="main" showNav />
      <div className="flex">
        <Sidebar variant="account" />
        <main className="flex-1 p-4 md:p-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-[var(--bhn-text)]" size={24} />
            <h1 className="text-2xl font-bold text-[var(--bhn-text)]">My Invoices</h1>
          </div>

          {isLoading ? (
            <p className="text-[var(--bhn-text-muted)] text-sm">Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <div className="text-center py-6">
              <FileText size={48} className="mx-auto text-[var(--bhn-text-soft)] mb-4" />
              <p className="text-[var(--bhn-text-muted)] text-sm">No invoices yet. Invoices are generated after a successful order.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv._id} className="bg-[var(--bhn-surface)] rounded-xl border border-[var(--bhn-border)] p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-[var(--bhn-surface-2)] p-3 rounded-lg">
                      <FileText className="text-[var(--bhn-text)]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{inv.invoiceNo}</p>
                      <p className="text-xs text-[var(--bhn-text-muted)] mt-0.5">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "Date unavailable"}
                      </p>
                      <p className="text-sm font-bold text-[var(--bhn-text)] mt-1">₹{Number(inv.total).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${inv.paymentStatus === "paid" ? "bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]" : "bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]"}`}>
                      {inv.paymentStatus?.toUpperCase()}
                    </span>
                    {inv.invoiceUrl && (
                      <a href={inv.invoiceUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-[var(--bhn-border)] hover:bg-[var(--bhn-surface-2)] transition">
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
