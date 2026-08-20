"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Banknote } from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Modal, PageHeader, Spinner, statusTone } from "@bandhan/ui";
import Sidebar from "../../components/Sidebar";
import SellerHeader from "../../components/SellerHeader";
import { apiGet, apiPost } from "@/lib/api";

type SummaryResponse = {
  success: boolean;
  source?: string;
  totalEarnings?: number;
  availableBalance?: number;
  pendingPayouts?: number;
  orderRevenue?: number;
  commission?: number;
  totalOrders?: number;
};

type ProfileResponse = {
  success: boolean;
  data?: {
    fullName?: string;
    businessName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
    [key: string]: unknown;
  };
};

const formatCurrency = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function WithdrawPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [profile, setProfile] = useState<ProfileResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  const availableBalance = Number(summary?.availableBalance ?? 0);

  const [amount, setAmount] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = Number(amount.replace(/[^0-9.]/g, "")) || 0;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryRes, profileRes] = await Promise.all([
          apiGet<SummaryResponse>("/earnings/summary"),
          apiGet<ProfileResponse>("/profile"),
        ]);
        setSummary(summaryRes);
        setProfile(profileRes?.data ?? null);
      } catch (e: any) {
        toast.error(e?.data?.message || e?.message || "Failed to load payout details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setPercent = (percent: number) => {
    const value = percent >= 1 ? availableBalance : availableBalance * percent;
    setAmount(value > 0 ? String(Math.round(value)) : "");
  };

  const handleConfirm = async () => {
    if (numericAmount <= 0) {
      toast.error("Enter an amount greater than 0");
      return;
    }
    if (numericAmount > availableBalance) {
      toast.error("Amount exceeds available balance");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost<{ success: boolean; message?: string }>("/earnings/withdraw", { amount: numericAmount });
      toast.success("Withdrawal request submitted");
      router.push("/earnings/payouts");
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Withdrawal failed");
    } finally {
      setIsSubmitting(false);
      setConfirmOpen(false);
    }
  };

  const bankInfo = profile;

  return (
    <div className="flex min-h-screen bg-[var(--bhn-bg)]">
      <Sidebar />
      <div className="flex-1 w-full overflow-hidden px-4 sm:px-6 py-5">
        <SellerHeader />

        <PageHeader
          title="Withdraw Funds"
          subtitle="Request a payout of your available earnings."
          actions={
            <Button size="sm" variant="secondary" onClick={() => router.push("/earnings")}>
              Back to Earnings
            </Button>
          }
        />

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-[var(--bhn-text-muted)]">
            <Spinner /> Loading payout details...
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <Card>
                <CardHeader title="Available Balance" sub="Amount you can withdraw now." />
                <CardBody>
                  <div className="text-3xl font-display font-bold text-[var(--bhn-text)] mb-5">
                    {formatCurrency(availableBalance)}
                  </div>

                  <div className="space-y-1.5 mb-2">
                    <label className="block text-xs font-medium text-[var(--bhn-text)]">
                      Withdrawal amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bhn-text-muted)]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={availableBalance}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={String(availableBalance)}
                        className="bhn-input pl-7 w-full"
                      />
                    </div>
                    {numericAmount > availableBalance ? (
                      <p className="text-xs text-[var(--bhn-error-600)]">
                        Amount exceeds available balance.
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {[
                      { label: "25%", value: 0.25 },
                      { label: "50%", value: 0.5 },
                      { label: "75%", value: 0.75 },
                      { label: "Max", value: 1 },
                    ].map((chip) => (
                      <Button key={chip.label} size="sm" variant="outline" onClick={() => setPercent(chip.value)}>
                        {chip.label}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Button
                      variant={
                        numericAmount > 0 && numericAmount <= availableBalance ? "primary" : "secondary"
                      }
                      disabled={numericAmount <= 0 || numericAmount > availableBalance}
                      icon={<Banknote size={16} />}
                      onClick={() => setConfirmOpen(true)}
                    >
                      Request withdrawal
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Recent payout activity" />
                <CardBody>
                  <EmptyState
                    title="No payouts yet"
                    description="Your withdrawal history will appear here once you request a payout."
                  />
                </CardBody>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader title="Payout method" />
                <CardBody className="space-y-3">
                  {bankInfo && (bankInfo.bankName || bankInfo.accountNumber || bankInfo.ifscCode || bankInfo.upiId) ? (
                    <>
                      {bankInfo.bankName || bankInfo.accountNumber || bankInfo.ifscCode ? (
                        <div>
                          <p className="text-xs text-[var(--bhn-text-muted)]">Bank transfer</p>
                          <p className="text-sm font-medium text-[var(--bhn-text)]">
                            {bankInfo.bankName
                              ? `${bankInfo.bankName} •••• ${String(bankInfo.accountNumber || "").slice(-4)}`
                              : "Bank account"}
                          </p>
                          {bankInfo.ifscCode ? (
                            <p className="text-xs text-[var(--bhn-text-soft)]">IFSC: {bankInfo.ifscCode}</p>
                          ) : null}
                        </div>
                      ) : null}
                      {bankInfo.upiId ? (
                        <div>
                          <p className="text-xs text-[var(--bhn-text-muted)]">UPI</p>
                          <p className="text-sm font-medium text-[var(--bhn-text)]">{bankInfo.upiId}</p>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-[var(--bhn-text-muted)]">
                      No bank or UPI details found in your profile. Add them in Settings before withdrawing.
                    </p>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        <Modal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirm withdrawal"
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<Banknote size={16} />}
                onClick={handleConfirm}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm & request"}
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-sm">
            <p>
              You are requesting a withdrawal of <strong>{formatCurrency(numericAmount)}</strong> from an available
              balance of <strong>{formatCurrency(availableBalance)}</strong>.
            </p>
            {bankInfo ? (
              <div className="flex items-center gap-2 text-xs">
                <Badge tone={statusTone("verified")}>Payout method</Badge>
                {bankInfo.bankName ? <span>{bankInfo.bankName}</span> : null}
                {bankInfo.upiId ? <span>{bankInfo.upiId}</span> : null}
              </div>
            ) : null}
          </div>
        </Modal>
      </div>
    </div>
  );
}
