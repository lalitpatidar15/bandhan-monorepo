"use client";

export const dynamic = "force-dynamic";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CareersHeader } from "@/components/CareersHeader";
import {
  useGetFinancialDashboardQuery,
  useGetInvoicesQuery,
  useGetBillingQuery,
  useCreateInvoiceMutation,
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetRecruitersQuery,
  useUpdateBillingMutation,
  useOpenBillingPortalMutation,
  useGetCurrentPlanQuery,
  InvoiceItem,
} from "../redux/services/paymentApi";
import {
  FileText,
  CreditCard,
  Users,
  Settings2,
  ChevronRight,
  TrendingUp,
  X,
  Plus,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  YAxis,
  Cell,
} from "recharts";

const menuItems: { key: SectionKey; label: string; icon: LucideIcon }[] = [
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "invoices", label: "Invoices", icon: FileText },
  { key: "recruiters", label: "Recruiters", icon: Users },
  { key: "settings", label: "Settings", icon: Settings2 },
];

type SectionKey = "payments" | "invoices" | "recruiters" | "settings" | "create-invoice";

type RangeKey = "30" | "90" | "365";

const chartData: Record<RangeKey, unknown[]> = {
  "30": [],
  "90": [],
  "365": [],
};

export default function FinancialDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey>("payments");
  const [range, setRange] = useState<RangeKey>("365");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [invoiceDraft, setInvoiceDraft] = useState({
    clientName: "",
    invoiceNumber: "",
    amount: "",
    dueDate: "",
    notes: "",
  });
  const [invoiceCreated, setInvoiceCreated] = useState(false);

  const { data: dashboardData, isLoading } = useGetFinancialDashboardQuery();
  const { data: invoicesResp } = useGetInvoicesQuery(undefined, { skip: activeSection !== "invoices" });
  const { data: billingResp } = useGetBillingQuery(undefined, { skip: activeSection !== "settings" });
  const { data: currentPlanResp } = useGetCurrentPlanQuery(undefined, { skip: activeSection !== "settings" });
  const { data: recruitersResp } = useGetRecruitersQuery(undefined, { skip: activeSection !== "recruiters" });

  const [createInvoice, { isLoading: creatingInvoice }] = useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: updatingInvoice }] = useUpdateInvoiceMutation();
  const [deleteInvoice, { isLoading: deletingInvoice }] = useDeleteInvoiceMutation();

  const [updateBilling] = useUpdateBillingMutation();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const { data: selectedInvoiceResp } = useGetInvoiceByIdQuery(selectedInvoiceId ?? "", { skip: !selectedInvoiceId });

  const totalSpend = dashboardData?.data?.totalSpend ?? 0;
  const monthSpend = dashboardData?.data?.monthSpend ?? 0;
  const pendingPayment = dashboardData?.data?.pendingPayment ?? 0;
  const currentPlan = dashboardData?.data?.currentPlan ?? "Free";
  const monthlyGraph = dashboardData?.data?.monthlyGraph ?? chartData[range];

  const invoicesData: InvoiceItem[] = (invoicesResp?.data ?? []) as InvoiceItem[];
  type PaymentMethod = { paymentMethod?: string; cardType?: string; cardLast4?: string };
  type BillingInfo = {
    paymentMethod?: PaymentMethod;
    billingName?: string;
    billingCompany?: string;
    billingAddress?: string;
    gstNumber?: string;
    nextBillingDate?: string;
  };
  const billingInfo = (billingResp?.data as BillingInfo) ?? undefined;
  const paymentMethod = billingInfo?.paymentMethod;
  const currentSubscription = currentPlanResp?.data;

  const filteredInvoices = useMemo(() => invoicesData, [invoicesData]);

  const formatCurrency = (value?: number) =>
    value !== undefined ? `₹${value.toLocaleString("en-IN")}` : "₹0";

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleInvoiceSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      clientName: invoiceDraft.clientName,
      invoiceNumber: invoiceDraft.invoiceNumber,
      amount: Number(invoiceDraft.amount) || 0,
      dueDate: invoiceDraft.dueDate,
      notes: invoiceDraft.notes,
    };
    createInvoice(payload)
      .then(() => {
        setInvoiceCreated(true);
        setInvoiceDraft({ clientName: "", invoiceNumber: "", amount: "", dueDate: "", notes: "" });
      })
      .catch(() => {
        alert("Failed to create invoice");
      });
  };

  const handleSelectInvoice = (id?: string) => {
    if (!id) return;
    setSelectedInvoiceId(id);
  };

  const handleDeleteInvoice = (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this invoice?")) return;
    deleteInvoice(id)
      .then(() => setSelectedInvoiceId(null))
      .catch(() => alert("Failed to delete invoice"));
  };

  const handleMarkPaid = (id?: string) => {
    if (!id) return;
    updateInvoice({ id, body: { invoiceStatus: "paid" } })
      .then(() => setSelectedInvoiceId(null))
      .catch(() => alert("Failed to update invoice"));
  };

  const handleEditBilling = async () => {
    const name = prompt("Billing name:", billingInfo?.billingName || "");
    const company = prompt("Company:", billingInfo?.billingCompany || "");
    const address = prompt("Address:", billingInfo?.billingAddress || "");
    const gst = prompt("GST number:", billingInfo?.gstNumber || "");
    if (name == null || company == null || address == null) return;
    try {
      await updateBilling({ billingName: name, billingCompany: company, billingAddress: address, gstNumber: gst || undefined });
      alert("Billing updated");
    } catch (e) {
      alert("Failed to update billing");
    }
  };

  const [openBillingPortal, { isLoading: openingPortal }] = useOpenBillingPortalMutation();

  const handleOpenBillingPortal = async () => {
    try {
      const resp = await openBillingPortal().unwrap();
      if (resp?.url) {
        // redirect to portal
        window.location.href = resp.url;
      } else {
        alert(resp?.message || "Failed to open billing portal");
      }
    } catch (err: unknown) {
      console.error("Failed to open billing portal:", err);
      let msg = "Failed to open billing portal";
      if (err && typeof err === "object") {
        const obj = err as Record<string, unknown>;
        if (typeof obj.message === "string") msg = obj.message;
      } else if (typeof err === "string") {
        msg = err;
      }
      alert(msg || "Failed to open billing portal");
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "payments":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Total Spend", value: formatCurrency(totalSpend), accent: "text-[#6B3E2B]" },
                { title: "Current Month", value: formatCurrency(monthSpend), accent: "" },
                { title: "Active Plan", value: currentPlan ?? "Free", accent: "text-blue-600" },
                { title: "Pending Payments", value: formatCurrency(pendingPayment), accent: "text-orange-600" },
              ].map((item) => (
                <div key={item.title} className="bg-white p-5 rounded-3xl border border-[#E0CFC3] shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{item.title}</p>
                  <p className={`text-xl font-bold mt-3 ${item.accent}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-5 lg:p-4 rounded-3xl border border-[#E0CFC3] shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="font-bold text-lg">Spending trends</h2>
                  <p className="text-sm text-gray-500">Track recruiter spend over time.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {(["30", "90", "365"] as RangeKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setRange(key)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                        range === key ? "bg-[#6B462F] text-white" : "text-gray-600 hover:text-[#6B462F]"
                      }`}
                    >
                      {key === "30" ? "30D" : key === "90" ? "90D" : "1Y"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyGraph}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: "#F9F3EE" }} contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {monthlyGraph.map((_, idx) => (
                        <Cell key={idx} fill={idx === monthlyGraph.length - 1 ? "#6B462F" : "#B07A55"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case "invoices":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E0CFC3] shadow-sm">
              <div>
                <h2 className="font-bold text-lg">Invoices</h2>
                <p className="text-sm text-gray-500">Review issued invoices and payment status.</p>
              </div>
              <button
                onClick={() => setActiveSection("create-invoice")}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#6B462F] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} /> Create Invoice
              </button>
            </div>

            <div className="grid gap-4">
              {selectedInvoiceResp?.data ? (
                <div className="bg-white p-5 rounded-3xl border border-[#E0CFC3] shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{selectedInvoiceResp?.data?.invoiceNumber}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedInvoiceResp?.data?.clientName}</p>
                      <p className="text-sm text-gray-500 mt-1">Amount: ₹{selectedInvoiceResp?.data?.totalAmount?.toLocaleString("en-IN")}</p>
                      <p className="text-sm text-gray-500 mt-1">Due: {formatDate(selectedInvoiceResp?.data?.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleMarkPaid(selectedInvoiceResp?.data?._id)} className="px-4 py-2 rounded-2xl bg-green-600 text-white">Mark Paid</button>
                      <button onClick={() => handleDeleteInvoice(selectedInvoiceResp?.data?._id)} className="px-4 py-2 rounded-2xl border">Delete</button>
                      <button onClick={() => setSelectedInvoiceId(null)} className="px-4 py-2 rounded-2xl">Close</button>
                    </div>
                  </div>
                </div>
              ) : null}

              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice, idx) => (
                  <div key={`${invoice.invoiceNumber}-${idx}`} className="bg-white p-5 rounded-3xl border border-[#E0CFC3] shadow-sm grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr] gap-4 items-center">
                    <div>
                      <p className="text-sm font-semibold">{invoice.invoiceNumber || `#INV-${idx + 1}`}</p>
                      <p className="text-sm text-gray-500 mt-1">{invoice.planName || invoice.paymentFor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Issued</p>
                      <p className="text-sm font-semibold mt-1">{formatDate(invoice.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-sm font-semibold mt-1">₹{invoice.totalAmount?.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${
                        invoice.status?.toLowerCase() === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {invoice.status || "Pending"}
                      </span>
                      <button onClick={() => handleSelectInvoice(invoice._id)} className="text-sm text-[#6B462F] font-semibold">View</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-4 rounded-3xl border border-[#E0CFC3] shadow-sm text-center text-sm text-gray-500">
                  No invoices available yet. Create your first invoice to bill clients and track payments.
                </div>
              )}
            </div>
          </div>
        );

      case "recruiters":
        const profile = recruitersResp?.data;
        return (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border border-[#E0CFC3] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Users size={20} className="text-[#6B462F]" />
                <div>
                  <h2 className="font-bold text-lg">Company Profile</h2>
                  <p className="text-sm text-gray-500">Your recruiter account details.</p>
                </div>
              </div>
              <div className="rounded-3xl border border-[#E0CFC3] bg-[#FFFAF7] p-5 grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Company Name</p>
                    <p className="font-semibold mt-1">{profile?.companyName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Company Email</p>
                    <p className="font-semibold mt-1">{profile?.companyEmail || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Current Plan</p>
                    <p className="font-semibold mt-1">{profile?.currentPlan || "Free"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Outstanding Balance</p>
                    <p className="font-semibold mt-1">₹{(profile?.outstandingBalance ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Profile Status</p>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mt-1 ${
                      profile?.profileStatus === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {profile?.profileStatus || "Incomplete"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#DDBA9D] bg-[#FFF7F0] p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5A35]">Current subscription</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#3E2F2A]">{currentSubscription?.planName || "Free"}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {currentSubscription?.status === "Active" && currentSubscription?.expiryDate
                      ? `Active until ${formatDate(currentSubscription.expiryDate)}`
                      : "Basic access with no paid subscription."}
                  </p>
                </div>
                <button onClick={() => router.push("/jobposter/jobupgrade")} className="rounded-2xl bg-[#6B462F] px-4 py-2.5 text-sm font-semibold text-white">
                  {currentSubscription?.planName && currentSubscription.planName !== "Free" ? "Manage plan" : "Upgrade plan"}
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                <div><p className="text-gray-500">Price</p><p className="mt-1 font-semibold">{currentSubscription?.price ? `₹${currentSubscription.price.toLocaleString("en-IN")}` : "Free"}</p></div>
                <div><p className="text-gray-500">Purchased</p><p className="mt-1 font-semibold">{formatDate(currentSubscription?.purchasedOn)}</p></div>
                <div><p className="text-gray-500">Payment method</p><p className="mt-1 font-semibold capitalize">{currentSubscription?.paymentMethod || "—"}</p></div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
<div className="bg-white p-4 rounded-3xl border border-[#E0CFC3] shadow-sm">  
                <div className="flex items-center gap-3 mb-4">
                  <Settings2 size={20} className="text-[#6B462F]" />
                  <div>
                    <h2 className="font-bold text-lg">Billing Settings</h2>
                    <p className="text-sm text-gray-500">Update payment details and billing profile.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-[#E0CFC3] p-4 bg-[#FFFAF7]">
                      <p className="text-xs uppercase tracking-wider text-gray-400">Current Payment Method</p>
                      <p className="mt-2 font-semibold">{paymentMethod?.paymentMethod || "—"}</p>
                      <p className="text-sm text-gray-500 mt-1">{paymentMethod?.cardType ? `${paymentMethod.cardType} • ${paymentMethod.cardLast4}` : "—"}</p>
                    </div>
                    <div className="rounded-3xl border border-[#E0CFC3] p-4 bg-[#FFFAF7]">
                      <p className="text-xs uppercase tracking-wider text-gray-400">GST Number</p>
                      <p className="mt-2 font-semibold">{billingInfo?.gstNumber || "—"}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-[#E0CFC3] p-4 bg-[#FFFAF7]">
                      <p className="text-xs uppercase tracking-wider text-gray-400">Billing Name</p>
                      <p className="mt-2 font-semibold">{billingInfo?.billingName || "—"}</p>
                    </div>
                    <div className="rounded-3xl border border-[#E0CFC3] p-4 bg-[#FFFAF7]">
                      <p className="text-xs uppercase tracking-wider text-gray-400">Company</p>
                      <p className="mt-2 font-semibold">{billingInfo?.billingCompany || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button onClick={handleEditBilling} className="w-full px-4 py-3 rounded-2xl bg-[#6B462F] text-white font-semibold">Edit Billing Info</button>
                  <button onClick={handleOpenBillingPortal} disabled={openingPortal} className="w-full px-4 py-3 rounded-2xl border border-[#E0CFC3] text-[#3E2F2A] font-semibold">
                    {openingPortal ? "Opening..." : "Manage Payment Methods"}
                  </button>
                </div>
              </div>

<div className="bg-white p-4 rounded-3xl border border-[#E0CFC3] shadow-sm">  
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard size={20} className="text-[#6B462F]" />
                  <div>
                    <h2 className="font-bold text-lg">Payment Summary</h2>
                    <p className="text-sm text-gray-500">Quick access to current billing details.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-[#E0CFC3] p-4 bg-[#FFFAF7]">
                    <p className="text-xs uppercase text-gray-400">Next Billing Date</p>
                    <p className="mt-2 font-semibold">{billingInfo?.nextBillingDate || "—"}</p>
                  </div>
                  <div className="rounded-3xl border border-[#E0CFC3] p-4 bg-[#FFFAF7]">
                    <p className="text-xs uppercase text-gray-400">Billing address</p>
                    <p className="mt-2 text-sm text-gray-600">{billingInfo?.billingAddress || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "create-invoice":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E0CFC3] shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="font-bold text-lg">Create Invoice</h2>
                  <p className="text-sm text-gray-500">Generate a new invoice for your client or recruiter partner.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection("invoices")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#E0CFC3] px-4 py-2 text-sm font-semibold text-[#3E2F2A]"
                >
                  <ChevronRight size={16} /> Back to invoices
                </button>
              </div>

              {invoiceCreated ? (
                <div className="rounded-3xl bg-[#ECFDF5] border border-[#D1FAE5] p-5 text-sm text-[#166534]">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={18} />
                    <p className="font-semibold">Invoice created successfully</p>
                  </div>
                  <p>Your invoice draft has been saved. Review it before sending it to the client.</p>
                </div>
              ) : null}

              <form onSubmit={handleInvoiceSubmit} className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm">
                    Client / Company
                    <input
                      value={invoiceDraft.clientName}
                      onChange={(e) => setInvoiceDraft({ ...invoiceDraft, clientName: e.target.value })}
                      placeholder="Client name"
                      className="w-full rounded-2xl border border-[#E0CFC3] bg-[#FAF8F6] px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Invoice Number
                    <input
                      value={invoiceDraft.invoiceNumber}
                      onChange={(e) => setInvoiceDraft({ ...invoiceDraft, invoiceNumber: e.target.value })}
                      placeholder="INV-2024-001"
                      className="w-full rounded-2xl border border-[#E0CFC3] bg-[#FAF8F6] px-4 py-3 text-sm outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm">
                    Amount
                    <input
                      type="number"
                      value={invoiceDraft.amount}
                      onChange={(e) => setInvoiceDraft({ ...invoiceDraft, amount: e.target.value })}
                      placeholder="₹0"
                      className="w-full rounded-2xl border border-[#E0CFC3] bg-[#FAF8F6] px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Due Date
                    <input
                      type="date"
                      value={invoiceDraft.dueDate}
                      onChange={(e) => setInvoiceDraft({ ...invoiceDraft, dueDate: e.target.value })}
                      className="w-full rounded-2xl border border-[#E0CFC3] bg-[#FAF8F6] px-4 py-3 text-sm outline-none"
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm">
                  Notes
                  <textarea
                    value={invoiceDraft.notes}
                    onChange={(e) => setInvoiceDraft({ ...invoiceDraft, notes: e.target.value })}
                    placeholder="Add any terms, descriptions, or payment notes"
                    rows={4}
                    className="w-full rounded-2xl border border-[#E0CFC3] bg-[#FAF8F6] px-4 py-3 text-sm outline-none resize-none"
                  />
                </label>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setInvoiceDraft({ clientName: "", invoiceNumber: "", amount: "", dueDate: "", notes: "" })}
                    className="px-5 py-3 rounded-2xl border border-[#E0CFC3] text-sm font-semibold text-[#3E2F2A]"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-2xl bg-[#6B462F] text-white text-sm font-semibold"
                  >
                    Save Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2E9E1] text-[#3E2F2A] overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <CareersHeader variant="jobposter" activeTab="Payments" />

      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#EFE6DE] border-r border-[#E0CFC3] p-6 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-6 pt-3">
            <div>
              <h2 className="font-bold text-xl text-[#6B3E2B]">Recruiter</h2>
              <p className="text-[10px] tracking-widest text-gray-500 font-bold mt-2">FINANCIAL HUB</p>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.key);
                    setInvoiceCreated(false);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-3xl px-4 py-4 text-left transition ${
                    isActive ? "bg-[#E6D4C7] text-[#6B3E2B] shadow-sm" : "text-gray-600 hover:bg-[#E6D4C7]/50"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-semibold">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-10">
            <div className="rounded-3xl bg-[#6B462F]/10 p-5 mb-4">
              <p className="text-xs font-bold text-[#6B3E2B]">Need Help?</p>
              <p className="text-[11px] text-gray-600 mt-1">Contact your account manager for billing queries.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection("create-invoice")}
              className="w-full rounded-3xl bg-[#6B462F] px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#523524]"
            >
              <span className="flex items-center justify-center gap-2">
                <Plus size={16} /> Create Invoice
              </span>
            </button>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto">
          <main className="p-4 lg:p-5 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <nav className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-2">
                  <span>Sahara</span>
                  <ChevronRight size={10} />
                  <span>Payments</span>
                  <ChevronRight size={10} />
                  <span>{activeSection === "create-invoice" ? "Create Invoice" : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</span>
                </nav>
                <h1 className="text-xl font-bold text-[#3E2F2A]">Payments & Invoicing</h1>
                <p className="text-sm text-gray-500 mt-2 max-w-2xl">
                  Manage invoices, recruiters, payment methods, and billing settings from one dashboard.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/jobposter/jobupgrade")}
                  className="inline-flex items-center gap-2 rounded-3xl bg-[#6B462F] px-5 py-3 text-sm font-semibold text-white shadow-sm"
                >
                  <TrendingUp size={16} /> Upgrade Plan
                </button>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="inline-flex items-center gap-2 rounded-3xl border border-[#E0CFC3] bg-white px-5 py-3 text-sm font-semibold text-[#3E2F2A] shadow-sm lg:hidden"
                >
                  <Wallet size={16} /> Menu
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-3xl border border-[#E0CFC3] bg-white p-4 text-center text-gray-500">Loading payment data...</div>
            ) : (
              renderSection()
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
