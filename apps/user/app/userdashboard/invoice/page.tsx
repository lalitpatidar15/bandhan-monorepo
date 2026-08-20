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
    <div className="min-h-screen bg-[#F8F4EF]">
      <Header variant="main" showNav />
      <div className="flex">
        <Sidebar variant="userdashboard" />
        <main className="flex-1 p-4 md:p-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-[#C2652A]" size={24} />
            <h1 className="text-2xl font-bold text-[#1C1A16]">My Invoices</h1>
          </div>

          {isLoading ? (
            <p className="text-gray-500 text-sm">Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <div className="text-center py-6">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">No invoices yet. Invoices are generated after a successful order.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv._id} className="bg-white rounded-xl border border-[#E5D8CC] p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#FAF1EA] p-3 rounded-lg">
                      <FileText className="text-[#B65B2D]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{inv.invoiceNo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "Date unavailable"}
                      </p>
                      <p className="text-sm font-bold text-[#1C1A16] mt-1">₹{Number(inv.total).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${inv.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {inv.paymentStatus?.toUpperCase()}
                    </span>
                    {inv.invoiceUrl && (
                      <a href={inv.invoiceUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-[#E5D8CC] hover:bg-[#FAF1EA] transition">
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
