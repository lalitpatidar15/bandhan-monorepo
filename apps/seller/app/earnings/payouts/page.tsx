"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import SellerHeader from "../../../components/SellerHeader";
import { apiGet } from "@/lib/api";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, PageHeader, Spinner, statusTone } from "@bandhan/ui";

type Transaction = {
  _id: string;
  transactionId?: string;
  orderId?: string;
  serviceName?: string;
  customerName?: string;
  amount?: number;
  commission?: number;
  net?: number;
  status?: string;
  transactionDate?: string;
  createdAt?: string;
  type?: string;
  referenceId?: string;
};

type TransactionsResponse = {
  success: boolean;
  transactions: Transaction[];
};

const formatCurrency = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const resolveCustomer = (tx: Transaction): string => {
  if (tx.customerName && tx.customerName !== "Anonymous" && tx.customerName !== "Customer") {
    return tx.customerName;
  }
  return "Guest Customer";
};

export default function PayoutsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiGet<TransactionsResponse>("/earnings/transactions");
        const rows = Array.isArray(res.transactions) ? res.transactions : [];
        setTransactions(rows);
      } catch (e: any) {
        console.error("Failed to load transactions", e);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return transactions;
    return transactions.filter(
      (tx) =>
        String(tx.transactionId || "").toLowerCase().includes(query) ||
        String(tx.serviceName || "").toLowerCase().includes(query) ||
        String(tx.customerName || "").toLowerCase().includes(query) ||
        String(tx.orderId || "").toLowerCase().includes(query)
    );
  }, [transactions, search]);

  const rows = useMemo(
    () =>
      filtered.map((tx) => ({
        id: String(tx.transactionId || tx._id || ""),
        service: String(tx.serviceName || "Service"),
        customer: resolveCustomer(tx),
        reference: String(tx.orderId || tx.referenceId || tx.transactionId || ""),
        amount: Number(tx.amount || 0),
        commission: Number(tx.commission || 0),
        net: Number(tx.net || 0),
        status: String(tx.status || "Pending"),
        date: String(tx.transactionDate || tx.createdAt || ""),
      })),
    [filtered]
  );

  return (
    <div className="flex min-h-screen bg-[var(--bhn-bg)]">
      <Sidebar />
      <div className="flex-1 w-full overflow-hidden px-4 sm:px-6 py-5">
        <SellerHeader />

        <PageHeader
          title="Payouts & Transactions"
          subtitle="History of your earnings, commissions, and payout requests."
          actions={
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bhn-input w-60"
              />
            </div>
          }
        />

        <Card>
          <CardHeader title="Transaction history" />
          <CardBody className="p-0">
            {loading ? (
              <div className="flex items-center gap-2 py-10 text-[var(--bhn-text-muted)]">
                <Spinner /> Loading transactions...
              </div>
            ) : rows.length === 0 ? (
              <div className="py-10">
                <EmptyState
                  title="No transactions found"
                  description="Completed payouts and earnings records will appear here."
                />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="bhn-table w-full">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Service</th>
                        <th>Customer</th>
                        <th className="text-right">Amount</th>
                        <th className="text-right">Commission</th>
                        <th className="text-right">Net</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((tx) => (
                        <tr key={tx.id}>
                          <td className="font-medium text-[var(--bhn-text)]">#{tx.reference}</td>
                          <td>{tx.service}</td>
                          <td>{tx.customer}</td>
                          <td className="text-right">{formatCurrency(tx.amount)}</td>
                          <td className="text-right text-[var(--bhn-error-600)]">
                            -{formatCurrency(tx.commission)}
                          </td>
                          <td className="text-right font-semibold text-[var(--bhn-brand-700)]">
                            {formatCurrency(tx.net)}
                          </td>
                          <td className="whitespace-nowrap text-[var(--bhn-text-muted)]">
                            {tx.date ? new Date(tx.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                          </td>
                          <td>
                            <Badge tone={statusTone(tx.status)} dot>
                              {tx.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 sm:px-6 py-3 border-t border-[var(--bhn-border)] text-sm text-[var(--bhn-text-muted)]">
                  Showing {rows.length} of {transactions.length} transactions
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
