"use client";

import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Badge, Button, Card, CardBody, CardHeader, PageHeader, StatCard, Tabs, statusTone } from "@bandhan/ui";

type EarningsTransaction = {
  id: string;
  service: string;
  customer: string;
  reference: string;
  payerEmail?: string;
  payerPhone?: string;
  amount: number;
  commission: number;
  net: number;
  status: string;
  date: string;
};

// Helper to extract customer name safely
const getCustomerName = (record: Record<string, unknown>): string => {
  return String(
    record.customerName ||
      record.customer ||
      record.payerName ||
      record.buyerName ||
      record.userName ||
      "Guest Customer"
  );
};

const parseAmount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,]/g, "").trim();
    if (!cleaned) return 0;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const getFallbackTransactions = () =>
  [
    {
      id: "101",
      service: "Product Sale",
      customer: "Asha Patel",
      amount: 4800,
      commission: 480,
      net: 4320,
      status: "Completed",
      date: new Date().toISOString(),
    },
    {
      id: "102",
      service: "Service Booking",
      customer: "Rohan Mehta",
      amount: 6200,
      commission: 620,
      net: 5580,
      status: "Pending",
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "103",
      service: "Product Sale",
      customer: "Pooja Singh",
      amount: 7800,
      commission: 780,
      net: 7020,
      status: "Completed",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ] as EarningsTransaction[];

export default function EarningsPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("Amit Soni");
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingPayouts: 0,
    orderRevenue: 0,
    commission: 0,
    totalOrders: 0,
  });
  const [transactions, setTransactions] = useState<EarningsTransaction[]>(
    getFallbackTransactions()
  );

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);

    const loadEarnings = async () => {
      try {
        const [summaryResponse, txResponse] = await Promise.all([
          apiGet<{
            success: boolean;
            totalEarnings: number;
            availableBalance: number;
            pendingPayouts: number;
            orderRevenue: number;
            commission: number;
            totalOrders?: number;
          }>("/earnings/summary"),
          apiGet<{
            success: boolean;
            transactions: Array<Record<string, unknown>>;
          }>("/earnings/transactions"),
        ]);

        setSummary({
          totalEarnings: Number(summaryResponse.totalEarnings || 0),
          availableBalance: Number(summaryResponse.availableBalance || 0),
          pendingPayouts: Number(summaryResponse.pendingPayouts || 0),
          orderRevenue: Number(summaryResponse.orderRevenue || 0),
          commission: Number(summaryResponse.commission || 0),
          totalOrders: Number(summaryResponse.totalOrders || 0),
        });

        const tx = Array.isArray(txResponse.transactions)
          ? txResponse.transactions
          : [];
        const normalizedTransactions = tx.map((item) => {
          const record = item as Record<string, unknown>;
          const payerName = getCustomerName(record);
          const reference = String(
            record.orderId ||
              record.paymentReference ||
              record.referenceId ||
              record.transactionId ||
              ""
          );
          const payerEmail = String(
            record.payerEmail || record.email || record.buyerEmail || ""
          );
          const payerPhone = String(
            record.payerPhone || record.phone || record.buyerPhone || ""
          );

          return {
            id: String(record.transactionId || record._id || ""),
            service: String(
              record.serviceName ||
                record.service ||
                record.productName ||
                "Order"
            ),
            customer: payerName,
            reference,
            payerEmail: payerEmail || undefined,
            payerPhone: payerPhone || undefined,
            amount: parseAmount(record.amount),
            commission: parseAmount(record.commission),
            net: parseAmount(record.net),
            status: String(record.status || "Pending"),
            date: String(record.createdAt || record.transactionDate || ""),
          } as EarningsTransaction;
        });

        setTransactions(
          normalizedTransactions.length > 0
            ? normalizedTransactions
            : getFallbackTransactions()
        );
      } catch (error) {
        console.error("Failed to load earnings", error);
        setTransactions(getFallbackTransactions());
      }
    };

    loadEarnings();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(transactions.length / itemsPerPage));

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return transactions.slice(start, start + itemsPerPage);
  }, [transactions, currentPage, itemsPerPage]);

  const [activeTab, setActiveTab] = useState("Monthly");

  const chartData = useMemo(() => {
    const generatePath = (data: number[], h: number) => {
      if (data.length < 2) return `M20 ${h} L680 ${h}`;
      const max = Math.max(...data, 1);
      const xStep = 660 / (data.length - 1);
      const points = data.map((v, i) => ({
        x: 20 + i * xStep,
        y: h - (v / max) * (h - 40),
      }));
      let d = `M${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const cx = (points[i - 1].x + points[i].x) / 2;
        d += ` Q${cx} ${points[i - 1].y}, ${points[i].x} ${points[i].y}`;
      }
      return d;
    };

    const hourly = Array(24).fill(0);
    const weekly = Array(7).fill(0);
    const monthly = Array(4).fill(0);

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return;
      const amt = Number(String(tx.amount).replace(/[₹,]/g, "")) || 0;
      hourly[d.getHours()] += amt;
      weekly[d.getDay()] += amt;
      const weekOfMonth = Math.min(3, Math.floor((d.getDate() - 1) / 7));
      monthly[weekOfMonth] += amt;
    });

    return {
      Daily: generatePath(hourly, 220),
      Weekly: generatePath(weekly, 240),
      Monthly: generatePath(monthly, 235),
    };
  }, [transactions]);

  return (
    <div className="flex min-h-screen bg-[var(--bhn-bg)]">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 w-full overflow-hidden px-4 sm:px-6 py-5">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
          <input
            type="text"
            placeholder="Search transactions..."
            className="
             w-full
             md:w-[320px]
             bhn-input
          "
          />

          <div className="flex items-center justify-between md:justify-end gap-5">
            <Image src="/bell.png" alt="" width={18} height={18} />

            <div className="flex items-center gap-12">
              <p className="text-[13px] text-[var(--bhn-text)] font-medium">
                {userName}
              </p>

              <Image
                src="/profile.png"
                alt=""
                width={34}
                height={34}
                className="rounded-full"
              />
            </div>
          </div>
        </div>

        {/* TITLE */}
        <PageHeader
          title="Earnings"
          subtitle="Track your revenue and manage payouts with precision."
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="primary" onClick={() => router.push("/withdraw")}>
                Withdraw
              </Button>

              {/* DATE PICKER */}
              <div className="relative w-fit">
                {/* BUTTON */}
                <Button
                variant="secondary"
                onClick={() => setOpen(!open)}
                icon={<Calendar size={16} strokeWidth={1.8} />}
                iconRight={<ChevronDown size={14} strokeWidth={1.8} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />}
              >
                This Month
              </Button>

              {/* DROPDOWN */}
              {open && (
                <div
                  className="
            absolute
            top-[48px]
            left-0
            w-[170px]
            bg-[var(--bhn-surface)]
            border
            border-[var(--bhn-border)]
            rounded-xl
            shadow-[var(--bhn-shadow-lg)]
            overflow-hidden
            z-50
          "
                >
                  {[
                    "Today",
                    "This Week",
                    "This Month",
                    "This Year",
                  ].map((item) => (
                    <button
                      key={item}
                      className="
                w-full
                text-left
                px-4
                py-3
                text-sm
                text-[var(--bhn-text)]
                hover:bg-[var(--bhn-surface-2)]
                transition
              "
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        }
        />

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Earnings" value={`₹${summary.totalEarnings.toLocaleString()}`} delta={12} deltaLabel="increase" accent />
          <StatCard label="Available Balance" value={`₹${summary.availableBalance.toLocaleString()}`} />
          <StatCard label="Pending Payouts" value={`₹${summary.pendingPayouts.toLocaleString()}`} />
          <StatCard label="Order Revenue" value={`₹${summary.orderRevenue.toLocaleString()}`} />
          <StatCard label="Commission" value={`-₹${summary.commission.toLocaleString()}`} />
        </div>

        {/* GRAPH + RIGHT */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
          {/* GRAPH */}
          <Card className="xl:col-span-2" padding="lg">
            <CardHeader
              title="Revenue Growth"
              actions={
                <Tabs
                  items={[
                    { id: "Daily", label: "Daily" },
                    { id: "Weekly", label: "Weekly" },
                    { id: "Monthly", label: "Monthly" },
                  ]}
                  active={activeTab}
                  onChange={setActiveTab}
                />
              }
            />

            <CardBody>
              {/* CHART */}
              <div className="relative w-full h-[260px] sm:h-[320px] lg:h-[360px]">
                {/* GRID */}
                <div className="absolute inset-0 flex flex-col justify-between pb-10">
                  <div className="border-t border-dashed border-[var(--bhn-border-strong)]" />
                  <div className="border-t border-dashed border-[var(--bhn-border-strong)]" />
                  <div className="border-t border-dashed border-[var(--bhn-border-strong)]" />
                </div>

                {/* SVG */}
                <svg
                  viewBox="0 0 700 300"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-[85%]"
                  fill="none"
                >
                  {/* AREA */}
                  <path
                    d={`
              ${chartData[activeTab as keyof typeof chartData]}
              L680 300
              L20 300
              Z
            `}
                    fill="var(--bhn-brand-50)"
                  />

                  {/* CURVE */}
                  <path
                    d={chartData[activeTab as keyof typeof chartData]}
                    stroke="var(--bhn-brand-600)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* START DOT */}
                  <circle
                    cx="20"
                    cy={
                      activeTab === "Daily"
                        ? "220"
                        : activeTab === "Weekly"
                        ? "240"
                        : "235"
                    }
                    r="5"
                    fill="white"
                    stroke="var(--bhn-brand-600)"
                    strokeWidth="3"
                  />

                  {/* END DOT */}
                  <circle
                    cx="680"
                    cy={
                      activeTab === "Daily"
                        ? "140"
                        : activeTab === "Weekly"
                        ? "150"
                        : "125"
                    }
                    r="5"
                    fill="white"
                    stroke="var(--bhn-brand-600)"
                    strokeWidth="3"
                  />
                </svg>

                {/* MONTHS */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] sm:text-[13px] font-semibold tracking-wide text-[var(--bhn-text-muted)]">
                  <span>JAN</span>
                  <span>MAR</span>
                  <span>MAY</span>
                  <span>JUL</span>
                  <span>SEP</span>
                  <span>NOV</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            {/* BREAKDOWN */}
            <Card>
              <CardHeader title="Commission Breakdown" />
              <CardBody>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[16px] text-[var(--bhn-text-muted)]">Gross Revenue</p>

                  <span className="text-[16px] font-semibold text-[var(--bhn-text)]">
                    ₹{summary.orderRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-7">
                  <p className="text-[16px] text-[var(--bhn-text-muted)]">
                    Platform Commission
                  </p>

                  <span className="text-[16px] font-semibold text-[var(--bhn-error-600)]">
                    - ₹{summary.commission.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-[var(--bhn-border)] mb-6"></div>

                <div className="flex items-center justify-between mb-5">
                  <p className="text-[18px] font-semibold text-[var(--bhn-text)]">
                    Net Earnings
                  </p>

                  <span className="text-[18px] font-bold text-[var(--bhn-brand-700)]">
                    ₹{summary.totalEarnings.toLocaleString()}
                  </span>
                </div>

                <div className="w-full h-[6px] bg-[var(--bhn-surface-3)] rounded-full overflow-hidden mb-3">
                  <div className="w-[60%] h-full bg-[var(--bhn-brand-600)] rounded-full"></div>
                </div>

                <p className="text-[13px] text-[var(--bhn-text-muted)]">
                  60% of total revenue is yours.
                </p>
              </CardBody>
            </Card>

            {/* WALLET */}
            <Card className="bg-[var(--bhn-surface-2)]">
              <CardHeader title="Wallet Balance" />
              <CardBody>
                <h2 className="text-[32px] font-display text-[var(--bhn-text)] mt-2">
                  ₹{summary.availableBalance.toLocaleString()}
                </h2>

                <Button
                  onClick={() => router.push("/earnings")}
                  block
                  className="mt-5"
                >
                  Withdraw Now →
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* INFO BOX */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
          <div className="bg-[var(--bhn-surface-2)] border border-[var(--bhn-border)] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Image
              src="/matka1.png"
              alt=""
              width={52}
              height={52}
              className="rounded-full"
            />

            <div>
              <h3 className="text-[19px] font-medium text-[var(--bhn-text)]">
                Weekly Performance
              </h3>

              <p className="text-[16px] text-[var(--bhn-text-muted)] mt-1 leading-5">
                Your earnings increased
                <span className="text-[var(--bhn-brand-600)] font-medium"> 12% </span>
                this week.
              </p>
            </div>
          </div>

          <div className="bg-[var(--bhn-surface-2)] border border-[var(--bhn-border)] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Image
              src="/matka2.png"
              alt=""
              width={52}
              height={52}
              className="rounded-full"
            />

            <div>
              <h3 className="text-[19px] font-medium text-[var(--bhn-text)]">
                Payout Alerts
              </h3>

              <p className="text-[16px] text-[var(--bhn-text-muted)] mt-1 leading-5">
                You have ₹{summary.pendingPayouts.toLocaleString()} payouts
                pending verification.
              </p>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <Card padded={false}>
          <CardHeader
            title="Recent Transactions"
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/payouts")}
              >
                View All Payouts →
              </Button>
            }
          />

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="bhn-table w-full">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Commission</th>
                  <th>Net</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedTransactions && paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((item, i) => (
                    <tr
                      key={item.id || i}
                      onClick={() =>
                        router.push(`/earnings/commission?id=${item.id}`)
                      }
                      className="cursor-pointer"
                    >
                      <td className="text-[13px] text-[var(--bhn-text-muted)]">
                        #TRX-{item.id}
                      </td>
                      <td className="text-[13px] font-medium text-[var(--bhn-text)]">
                        {item.service}
                      </td>
                      <td className="text-[13px] text-[var(--bhn-text-muted)]">
                        {item.customer}
                        {item.payerEmail && (
                          <div className="text-[11px] text-[var(--bhn-text-soft)] mt-1">
                            {item.payerEmail}
                          </div>
                        )}
                        {item.payerPhone && !item.payerEmail && (
                          <div className="text-[11px] text-[var(--bhn-text-soft)] mt-1">
                            {item.payerPhone}
                          </div>
                        )}
                      </td>
                      <td className="text-[13px] text-[var(--bhn-text-muted)]">
                        {item.reference ? `#${item.reference}` : "-"}
                      </td>
                      <td className="text-[13px] text-[var(--bhn-text)]">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="text-[13px] text-[var(--bhn-error-600)]">
                        -{formatCurrency(item.commission)}
                      </td>
                      <td className="text-[13px] font-semibold text-[var(--bhn-brand-700)]">
                        {formatCurrency(item.net)}
                      </td>
                      <td>
                        <Badge tone={statusTone(item.status)}>
                          {String(item.status).toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-8 text-[var(--bhn-text-soft)] text-sm"
                    >
                      No transactions available for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden p-4 space-y-4">
            {paginatedTransactions && paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((item, i) => (
                <div
                  key={item.id || i}
                  onClick={() =>
                    router.push(`/earnings/commission?id=${item.id}`)
                  }
                  className="border border-[var(--bhn-border)] rounded-2xl p-4 bg-[var(--bhn-surface-2)] active:scale-[0.99] transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[11px] text-[var(--bhn-text-soft)]">
                        Transaction ID
                      </p>
                      <h4 className="text-[14px] font-semibold text-[var(--bhn-text)] mt-1">
                        #TRX-{item.id}
                      </h4>
                    </div>

                    <Badge tone={statusTone(item.status)}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-[var(--bhn-text-soft)]">Service</p>
                        <p className="text-[13px] font-medium text-[var(--bhn-text)] mt-1">
                          {item.service}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] text-[var(--bhn-text-soft)]">Customer</p>
                        <p className="text-[13px] text-[var(--bhn-text)] mt-1">
                          {item.customer}
                        </p>
                        {item.payerEmail && (
                          <p className="text-[11px] text-[var(--bhn-text-soft)] mt-1">
                            {item.payerEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[var(--bhn-border)]">
                      <div>
                        <p className="text-[10px] text-[var(--bhn-text-soft)]">
                          Order Reference
                        </p>
                        <p className="text-[13px] font-medium text-[var(--bhn-text)] mt-1">
                          {item.reference ? `#${item.reference}` : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--bhn-text-soft)]">Amount</p>
                        <p className="text-[13px] font-medium text-[var(--bhn-text)] mt-1">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--bhn-text-soft)]">Commission</p>
                        <p className="text-[13px] text-[var(--bhn-error-600)] mt-1">
                          -{formatCurrency(item.commission)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--bhn-text-soft)]">Net</p>
                        <p className="text-[13px] font-semibold text-[var(--bhn-brand-700)] mt-1">
                          {formatCurrency(item.net)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-[var(--bhn-text-soft)] text-sm">
                No transactions available for this period.
              </p>
            )}
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-center gap-2 py-5 bg-[var(--bhn-surface)] flex-wrap px-4">
            <button
              onClick={() =>
                currentPage > 1 && setCurrentPage((prev) => prev - 1)
              }
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-lg text-sm transition ${
                currentPage === 1
                  ? "bg-[var(--bhn-surface-3)] text-[var(--bhn-text-soft)] cursor-not-allowed"
                  : "bg-[var(--bhn-surface-2)] text-[var(--bhn-brand-700)] hover:bg-[var(--bhn-brand-100)]"
              }`}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm transition ${
                    currentPage === page
                      ? "bg-[var(--bhn-brand-600)] text-white"
                      : "bg-[var(--bhn-surface-2)] text-[var(--bhn-brand-700)] hover:bg-[var(--bhn-brand-100)]"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() =>
                currentPage < totalPages && setCurrentPage((prev) => prev + 1)
              }
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-lg text-sm transition ${
                currentPage === totalPages
                  ? "bg-[var(--bhn-surface-3)] text-[var(--bhn-text-soft)] cursor-not-allowed"
                  : "bg-[var(--bhn-surface-2)] text-[var(--bhn-brand-700)] hover:bg-[var(--bhn-brand-100)]"
              }`}
            >
              ›
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}