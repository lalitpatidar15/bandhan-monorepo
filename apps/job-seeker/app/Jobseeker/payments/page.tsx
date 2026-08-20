"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

import { CareersHeader } from "@/components/CareersHeader";
import { Footer } from "../../../components/ui/Footer";
import { Card } from "../../../components/ui/card";
import {
  useExportPaymentHistoryMutation,
  useGetJobSeekerPaymentDashboardQuery,
  useGetJobSeekerPaymentHistoryQuery,
} from "../redux/services/JobsApi";

interface PaymentMethod {
  method?: string;
  cardType?: string;
  cardLast4?: string;
  wallet?: string;
  vpa?: string;
  lastUsed?: string;
}

interface CurrentPlan {
  planName?: string;
  price?: number;
  duration?: number;
  remainingDays?: number;
  features?: string[];
}

interface PaymentHistoryItem {
  paymentId?: string;
  date?: string;
  description?: string;
  amount?: number;
  currency?: string;
  status?: string;
  paymentMethod?: string;
  receipt?: string;
  transactionId?: string;
}

interface PaymentDashboardData {
  overview?: {
    totalSpent?: number;
    activePlan?: string;
    nextBillingDate?: string | null;
  };
  currentPlan?: CurrentPlan;
  paymentMethod?: PaymentMethod | null;
  recentTransactions?: PaymentHistoryItem[];
}

export default function PaymentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: dashboardData,
    isFetching: dashboardLoading,
    error: dashboardErrorInfo,
  } = useGetJobSeekerPaymentDashboardQuery();

  const {
    data: historyData,
    isFetching: historyLoading,
    error: historyErrorInfo,
  } = useGetJobSeekerPaymentHistoryQuery({ page, limit: 10 });

  const [exportPaymentHistory, { isLoading: exporting }] = useExportPaymentHistoryMutation();

  const overview = dashboardData?.data?.overview;
  const currentPlan = dashboardData?.data?.currentPlan;
  const paymentMethod = dashboardData?.data?.paymentMethod;
  const transactions = historyData?.data ?? [];
  const totalPages = historyData?.totalPages ?? 1;

  const totalSpent = overview?.totalSpent ?? 0;
  const activePlan = overview?.activePlan ?? currentPlan?.planName ?? "Free";
  const nextBillingDate = overview?.nextBillingDate ?? "Not set";
  const paymentMethodLabel = paymentMethod?.method
    ? paymentMethod.method === "upi"
      ? paymentMethod.vpa
      : paymentMethod.method === "card"
      ? `${paymentMethod.cardType || "Card"} • ${paymentMethod.cardLast4 || "****"}`
      : paymentMethod.method
    : "No payment method";

  const loadHistory = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const downloadCsv = async () => {
    setErrorMessage(null);
    try {
      const blobResult = await exportPaymentHistory().unwrap();
      const url = URL.createObjectURL(blobResult);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payment-history-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      setErrorMessage(error?.data?.message || error?.message || "Unable to export CSV.");
    }
  }
  return (
    <div className="min-h-screen bg-[#F6EFEA] text-[#3E2F2B]">
      <CareersHeader variant="jobs" activeTab="Payments" />
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-6">
        <div>
          <p className="text-sm text-[#9C8B84]">Dashboard / Payments</p>
          <h1 className="text-[28px] font-semibold mt-1">Financial Overview</h1>
          <p className="text-sm text-[#9C8B84] mt-2">
            Manage your subscriptions and transaction history with complete transparency.
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-[#E6DAD2] bg-[#FFF3EA] px-4 py-3 text-sm text-[#9A4D1B]">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid md:grid-cols-3 gap-5">
          <Card className="bg-white border border-[#E8DDD7] rounded-2xl p-5">
            <p className="text-xs text-[#9C8B84] uppercase">Total Spent</p>
            <h2 className="text-2xl font-semibold mt-2">₹{totalSpent}</h2>
            <p className="text-xs text-[#C1B3AC] mt-1">Transaction summary for the current period</p>
          </Card>

          <Card className="bg-white border border-[#E8DDD7] rounded-2xl p-5">
            <p className="text-xs text-[#9C8B84] uppercase">Active Plan</p>
            <h2 className="text-xl font-semibold mt-2">{activePlan}</h2>
            <span className="mt-2 inline-block text-[10px] bg-[#E6F4EA] text-[#2E7D32] px-2 py-1 rounded">
              ACTIVE
            </span>
          </Card>

          <Card className="bg-white border border-[#E8DDD7] rounded-2xl p-5">
            <p className="text-xs text-[#9C8B84] uppercase">Next Billing Date</p>
            <h2 className="text-xl font-semibold mt-2">{nextBillingDate || "Not set"}</h2>
            <p className="text-xs text-[#C1B3AC] mt-1">Renewal schedule</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-5">
            <Card className="bg-[#FAF1EC] border border-[#E8DDD7] rounded-2xl p-5">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold">{activePlan} Job Seeker</h3>
                <span className="text-[10px] bg-[#FAD8C7] text-[#9A3412] px-2 py-1 rounded">
                  CURRENT
                </span>
              </div>

              <h2 className="text-2xl font-bold mt-3">₹{currentPlan?.price ?? 0}</h2>
              <p className="text-xs text-[#9C8B84]">/ {currentPlan?.duration ?? 30} days</p>

              <ul className="mt-4 space-y-2 text-sm text-[#6F5B55]">
                {(currentPlan?.features ?? ["Basic listing", "Limited visibility"]).map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => router.push("/Jobseeker/jobupgrade")}
                className="w-full mt-5 bg-[#6B3E2E] text-white py-2 rounded-xl text-sm cursor-pointer"
              >
                Upgrade Plan
              </button>

              <button
                type="button"
                onClick={() => router.push("/Jobseeker/jobupgrade")}
                className="w-full mt-2 border border-[#D8C7C0] py-2 rounded-xl text-sm"
              >
                Manage Subscription
              </button>
            </Card>

            <Card className="bg-white border border-[#E8DDD7] rounded-2xl p-5">
              <p className="text-sm font-medium mb-3">Payment Method</p>
              <div className="bg-[#F7EFEA] p-4 rounded-xl">
                <p className="text-sm font-semibold">{paymentMethod?.method?.toUpperCase() ?? "Payment Method"}</p>
                <p className="text-sm text-[#6F5B55] mt-1">{paymentMethodLabel}</p>
                <p className="text-xs text-[#C1B3AC] mt-1">
                  Last used: {paymentMethod?.lastUsed ?? "Not available"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/Jobseeker/payments")}
                className="text-sm text-[#6B3E2E] mt-3"
              >
                Update Payment Method ✏️
              </button>
            </Card>

            <Card className="bg-[#F7EFEA] border border-[#E8DDD7] rounded-2xl p-4 flex items-center gap-2 text-sm text-[#2E7D32]">
              🔒 All payments are secure
            </Card>
          </div>

          <Card className="bg-white border border-[#E8DDD7] rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Transaction History</h2>
              <button
                type="button"
                disabled={exporting}
                onClick={downloadCsv}
                className="text-sm text-[#6B3E2E] disabled:opacity-50"
              >
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>

            <div className="grid grid-cols-5 text-xs text-[#9C8B84] mt-6 pb-2 border-b">
              <p>Date</p>
              <p>Description</p>
              <p>Amount</p>
              <p>Status</p>
              <p>Receipt</p>
            </div>

            <div className="divide-y mt-2">
              {historyLoading ? (
                <div className="py-8 text-center text-sm text-[#9C8B84]">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#9C8B84]">No transactions found.</div>
              ) : (
                transactions.map((t, i) => (
                  <div key={t.paymentId || i} className="grid grid-cols-5 items-center py-4 text-sm gap-2">
                    <p>{t.date ? new Date(t.date).toLocaleDateString() : "-"}</p>
                    <p>{t.description || "-"}</p>
                    <p>₹{t.amount ?? 0}</p>
                    <span
                      className={`text-[11px] px-2 py-1 rounded w-fit ${
                        t.status === "completed" || t.status?.toLowerCase() === "paid"
                          ? "bg-[#E6F4EA] text-[#2E7D32]"
                          : "bg-[#FDE8D7] text-[#B45309]"
                      }`}
                    >
                      {t.status ?? "Unknown"}
                    </span>
                    <button
                      type="button"
                      onClick={() => t.receipt && window.open(t.receipt, "_blank")}
                      className="text-[#9C8B84] hover:text-[#6B3E2E]"
                      disabled={!t.receipt}
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 ? (
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => loadHistory(page - 1)}
                  className="rounded-lg border border-[#D8C7C0] px-4 py-2 text-sm"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => loadHistory(page + 1)}
                  className="rounded-lg border border-[#D8C7C0] px-4 py-2 text-sm"
                >
                  Next
                </button>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
