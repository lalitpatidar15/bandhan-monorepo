"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import {
  Badge,
  Button,
  Chip,
  EmptyState,
  Modal,
  PageHeader,
  Spinner,
  StatCard,
  statusTone,
} from "@bandhan/ui";
import Sidebar from "../../components/Sidebar";
import SellerHeader from "../../components/SellerHeader";
import { getCustomerName } from "../../lib/customer";
import {
  useApproveExtensionMutation,
  useCancelMutation,
  useCompleteMutation,
  useConfirmDeliveryMutation,
  useGetSellerRentalOrdersQuery,
  useInspectMutation,
  useInitiateReturnMutation,
  useRejectExtensionMutation,
} from "@/lib/store/api/rentalApi";
import type { RentalOrder, RentalStatus } from "@/lib/store/api/rentalApi";

type ApiError = {
  data?: { message?: string };
  message?: string;
};

const RETURN_CONDITIONS = ["excellent", "good", "fair", "poor", "damaged"];

const STATUS_GROUPS: Record<string, RentalStatus[]> = {
  All: [],
  Active: ["in_use"],
  Pending: ["pending_deposit", "deposit_paid", "reserved", "shipped"],
  Delivered: ["delivered"],
  Return: ["return_scheduled", "return_shipped", "returned", "inspection"],
  Completed: ["completed"],
  Overdue: ["overdue"],
};

const STAT_GROUPS: Record<
  string,
  { label: string; statuses: RentalStatus[]; tone: string }
> = {
  Active: { label: "Active", statuses: ["in_use"], tone: "success" },
  "Pending delivery": {
    label: "Pending delivery",
    statuses: ["shipped", "delivered"],
    tone: "warning",
  },
  "Return pending": {
    label: "Return pending",
    statuses: ["return_scheduled", "return_shipped", "returned", "inspection"],
    tone: "warning",
  },
  Overdue: { label: "Overdue", statuses: ["overdue"], tone: "danger" },
};

const formatCurrency = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDateRange = (start?: string, end?: string) => {
  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  return `${fmt(start)} → ${fmt(end)}`;
};

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const pendingExtension = (rental: RentalOrder): { index: number; req: NonNullable<RentalOrder["extensionRequests"]>[number] } | null => {
  const requests = rental.extensionRequests ?? [];
  const index = requests.findIndex((r) => r.status === "pending");
  if (index === -1) return null;
  return { index, req: requests[index] };
};

const actionVerb = (kind: string) => {
  switch (kind) {
    case "confirm-delivery":
      return "Confirm delivery";
    case "initiate-return":
      return "Initiate return";
    case "inspect":
      return "Inspect return";
    case "complete":
      return "Complete rental";
    case "cancel":
      return "Cancel rental";
    case "approve-extension":
      return "Approve extension";
    case "reject-extension":
      return "Reject extension";
    default:
      return "Confirm";
  }
};

type ActiveAction =
  | { kind: "confirm-delivery"; rental: RentalOrder }
  | { kind: "initiate-return"; rental: RentalOrder }
  | { kind: "complete"; rental: RentalOrder }
  | { kind: "cancel"; rental: RentalOrder }
  | { kind: "inspect"; rental: RentalOrder }
  | { kind: "approve-extension"; rental: RentalOrder; requestIndex: number }
  | { kind: "reject-extension"; rental: RentalOrder; requestIndex: number };

export default function RentalOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError, refetch } = useGetSellerRentalOrdersQuery({
    limit: 100,
  });

  const [confirmDelivery] = useConfirmDeliveryMutation();
  const [initiateReturn] = useInitiateReturnMutation();
  const [inspect] = useInspectMutation();
  const [complete] = useCompleteMutation();
  const [cancel] = useCancelMutation();
  const [approveExtension] = useApproveExtensionMutation();
  const [rejectExtension] = useRejectExtensionMutation();

  const [activeAction, setActiveAction] = useState<ActiveAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [inspectCondition, setInspectCondition] = useState("good");
  const [inspectNotes, setInspectNotes] = useState("");
  const [inspectDamage, setInspectDamage] = useState(false);
  const [inspectDamageFee, setInspectDamageFee] = useState("");

  const rentals: RentalOrder[] = useMemo(() => data?.data ?? [], [data]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    rentals.forEach((r) => {
      const status = r.rentalStatus;
      Object.entries(STAT_GROUPS).forEach(([key, group]) => {
        if (group.statuses.includes(status as RentalStatus)) counts[key] = (counts[key] ?? 0) + 1;
      });
    });
    return {
      Active: counts.Active ?? 0,
      "Pending delivery": counts["Pending delivery"] ?? 0,
      "Return pending": counts["Return pending"] ?? 0,
      Overdue: counts.Overdue ?? 0,
    };
  }, [rentals]);

  const filtered = useMemo(() => {
    const rows = rentals.filter((r) => {
      const matchesStatus =
        statusFilter === "All" || STATUS_GROUPS[statusFilter]?.includes(r.rentalStatus as RentalStatus);
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        r.productTitle?.toLowerCase().includes(query) ||
        getCustomerName(r).toLowerCase().includes(query) ||
        r.rentalId?.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
    return rows;
  }, [rentals, statusFilter, searchTerm]);

  const renderRowActions = (rental: RentalOrder) => {
    const actions: Array<{
      label: string;
      variant: "primary" | "secondary" | "outline" | "ghost" | "danger" | "soft";
      visible: boolean;
      kind: ActiveAction["kind"];
    }> = [
      {
        label: "Confirm Delivery",
        variant: "outline",
        kind: "confirm-delivery",
        visible: rental.rentalStatus === "shipped",
      },
      {
        label: "Initiate Return",
        variant: "outline",
        kind: "initiate-return",
        visible: rental.rentalStatus === "in_use",
      },
      {
        label: "Inspect",
        variant: "outline",
        kind: "inspect",
        visible: rental.rentalStatus === "return_shipped" || rental.rentalStatus === "returned",
      },
      {
        label: "Complete",
        variant: "primary",
        kind: "complete",
        visible: rental.rentalStatus === "inspection",
      },
      {
        label: "Cancel",
        variant: "danger",
        kind: "cancel",
        visible: !["returned", "completed", "cancelled"].includes(rental.rentalStatus || ""),
      },
    ];

    const visible = actions.filter((a) => a.visible);
    const ext = pendingExtension(rental);

    return (
      <div className="flex flex-col gap-1.5">
        {visible.map((a) => (
        <Button
          key={a.kind}
          size="sm"
          variant={a.variant}
          className="bhn-btn-block"
          onClick={() => setActiveAction({ kind: a.kind, rental } as ActiveAction)}
        >
          {a.label}
        </Button>
        ))}
        {ext ? (
          <>
            <Button
              size="sm"
              variant="soft"
              className="bhn-btn-block"
              onClick={() => setActiveAction({ kind: "approve-extension", rental, requestIndex: ext.index })}
            >
              Approve (+{ext.req.additionalDays ?? 0}d, +₹{formatCurrency(ext.req.additionalFee ?? 0)})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bhn-btn-block"
              onClick={() => setActiveAction({ kind: "reject-extension", rental, requestIndex: ext.index })}
            >
              Reject Extension
            </Button>
          </>
        ) : null}
      </div>
    );
  };

  const resetActionState = () => {
    setCancelReason("");
    setInspectCondition("good");
    setInspectNotes("");
    setInspectDamage(false);
    setInspectDamageFee("");
  };

  const handleConfirm = async () => {
    if (!activeAction) return;
    const { kind, rental } = activeAction;
    setIsSubmitting(true);
    try {
      if (kind === "confirm-delivery") {
        await confirmDelivery(rental._id).unwrap();
      } else if (kind === "initiate-return") {
        await initiateReturn(rental._id).unwrap();
      } else if (kind === "complete") {
        await complete(rental._id).unwrap();
      } else if (kind === "cancel") {
        await cancel({ id: rental._id, reason: cancelReason }).unwrap();
      } else if (kind === "inspect") {
        await inspect({
          id: rental._id,
          body: {
            returnCondition: inspectCondition,
            notes: inspectNotes,
            damageReported: inspectDamage,
            damageFee: Number(inspectDamageFee) || 0,
            damageDescription: inspectDamage ? inspectNotes : "",
          },
        }).unwrap();
      } else if (kind === "approve-extension") {
        await approveExtension({ id: rental._id, requestIndex: activeAction.requestIndex }).unwrap();
      } else if (kind === "reject-extension") {
        await rejectExtension({ id: rental._id, requestIndex: activeAction.requestIndex }).unwrap();
      }

      toast.success(`${actionVerb(kind)} successful`);
      await refetch();
      resetActionState();
      setActiveAction(null);
    } catch (e) {
      const err = e as ApiError;
      toast.error(err?.data?.message || err?.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    resetActionState();
    setActiveAction(null);
  };

  const modalTitle = activeAction ? actionVerb(activeAction.kind) : "";
  const modalBody = activeAction ? (
    <div className="space-y-3 text-sm text-[var(--bhn-text-muted)]">
      {activeAction.kind === "cancel" ? (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[var(--bhn-text)]">
            Cancellation reason (optional)
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Customer requested, item damaged..."
            className="bhn-textarea w-full"
            rows={3}
          />
        </div>
      ) : activeAction.kind === "inspect" ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--bhn-text)]">
              Return condition
            </label>
            <select
              value={inspectCondition}
              onChange={(e) => setInspectCondition(e.target.value)}
              className="bhn-select w-full"
            >
              {RETURN_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="damage"
              type="checkbox"
              checked={inspectDamage}
              onChange={(e) => setInspectDamage(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--bhn-border-strong)] text-[var(--bhn-brand-600)]"
            />
            <label htmlFor="damage" className="text-xs font-medium text-[var(--bhn-text)]">
              Damage reported
            </label>
          </div>
          {inspectDamage ? (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[var(--bhn-text)]">
                Damage fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={inspectDamageFee}
                onChange={(e) => setInspectDamageFee(e.target.value)}
                placeholder="0"
                className="bhn-input w-full"
              />
            </div>
          ) : null}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--bhn-text)]">
              Notes (optional)
            </label>
            <textarea
              value={inspectNotes}
              onChange={(e) => setInspectNotes(e.target.value)}
              placeholder="Inspection notes..."
              className="bhn-textarea w-full"
              rows={3}
            />
          </div>
        </div>
      ) : (
        <>
            <p>
              Are you sure you want to <strong>{actionVerb(activeAction.kind).toLowerCase()}</strong> for order{" "}
              <strong>{activeAction.rental.rentalId}</strong>?
            </p>
          {activeAction.kind === "approve-extension" && activeAction.rental.extensionRequests ? (
            <p className="text-xs">
              Extends by {activeAction.rental.extensionRequests[activeAction.requestIndex]?.additionalDays ?? 0}{" "}
              days (+₹{formatCurrency(activeAction.rental.extensionRequests[activeAction.requestIndex]?.additionalFee ?? 0)}).
            </p>
          ) : null}
        </>
      )}
    </div>
  ) : null;

  return (
    <div className="flex min-h-screen bg-[var(--bhn-bg)]">
      <Sidebar />
      <div className="flex-1 w-full overflow-hidden px-4 sm:px-6 py-5">
        <SellerHeader />

        <PageHeader
          title="Rental Orders"
          subtitle="Review, fulfill, and close rental workflows for items you've listed for rent."
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-auto">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]" />
                <input
                  type="text"
                  placeholder="Search rentals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bhn-input pl-9 w-60"
                />
              </div>
              <Button size="sm" variant="secondary" onClick={() => refetch()} disabled={isLoading}>
                Refresh
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard label="Active" value={stats.Active} accent />
          <StatCard label="Pending delivery" value={stats["Pending delivery"]} />
          <StatCard label="Return pending" value={stats["Return pending"]} />
          <StatCard label="Overdue" value={stats.Overdue} />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(STATUS_GROUPS) as string[]).map((chip) => (
            <Chip
              key={chip}
              selected={statusFilter === chip}
              onClick={() => setStatusFilter(chip)}
            >
              {chip}
            </Chip>
          ))}
        </div>

        {isError ? (
          <div className="p-6 text-center text-[var(--bhn-error-600)]">
            Failed to load rental orders.
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-[var(--bhn-text-muted)]">
            <Spinner /> Loading rental orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No rental orders found"
              description={
                searchTerm || statusFilter !== "All"
                  ? "Try adjusting your search or status filter."
                  : "When customers rent your products, rental orders will appear here."
              }
            />
          </div>
        ) : (
          <div className="bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="bhn-table w-full">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Date range</th>
                    <th>Daily rate</th>
                    <th>Deposit</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rental) => {
                    const productTitle =
                      rental.productTitle ||
                      (typeof rental.productId === "object" ? rental.productId?.title : "") ||
                      "Product";
                    const productImage =
                      rental.productImage ||
                      (typeof rental.productId === "object"
                        ? Array.isArray(rental.productId?.images)
                          ? rental.productId.images[0]
                          : undefined
                        : undefined) ||
                      "/image10.png";
                    const customerName = getCustomerName(rental as unknown as Record<string, unknown>);
                    const dailyRate = Number(rental.dailyRate || 0);
                    const deposit = Number(rental.securityDeposit || 0);
                    const ext = pendingExtension(rental);

                    return (
                      <tr key={rental._id} className="align-top">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <Image
                              src={productImage}
                              alt={productTitle}
                              width={56}
                              height={56}
                              className="rounded-lg object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium text-[var(--bhn-text)]">
                                {productTitle}
                              </p>
                              {rental.variantName ? (
                                <p className="text-xs text-[var(--bhn-text-muted)]">
                                  {rental.variantName}
                                </p>
                              ) : null}
                              <p className="text-xs text-[var(--bhn-text-muted)]">
                                {rental.rentalId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <p className="text-sm text-[var(--bhn-text)]">{customerName}</p>
                          {rental.shippingAddress?.city || rental.shippingAddress?.state ? (
                            <p className="text-xs text-[var(--bhn-text-muted)]">
                              {[rental.shippingAddress?.city, rental.shippingAddress?.state]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          ) : null}
                        </td>
                        <td className="py-3 whitespace-nowrap text-sm text-[var(--bhn-text-muted)]">
                          {formatDateRange(rental.rentalStart, rental.rentalEnd)}
                        </td>
                        <td className="py-3 whitespace-nowrap text-sm text-[var(--bhn-text)]">
                          {formatCurrency(dailyRate)}
                        </td>
                        <td className="py-3 whitespace-nowrap text-sm text-[var(--bhn-text)]">
                          {deposit > 0 ? formatCurrency(deposit) : "—"}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-col items-start gap-1.5">
                            <Badge tone={statusTone(rental.rentalStatus || "")} dot>
                              {(rental.rentalStatus || "pending").replace("_", " ")}
                            </Badge>
                            {ext ? (
                              <Badge tone="warning" dot>
                                Extension requested
                              </Badge>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3">
                          {renderRowActions(rental)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-[var(--bhn-border)] text-sm text-[var(--bhn-text-muted)]">
              Showing {filtered.length} of {rentals.length} rental orders
            </div>
          </div>
        )}

        <Modal
          open={!!activeAction}
          onClose={handleCloseModal}
          title={modalTitle}
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={activeAction?.kind === "cancel" ? "danger" : "primary"}
                onClick={handleConfirm}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Confirm"}
              </Button>
            </div>
          }
        >
          {modalBody}
        </Modal>
      </div>
    </div>
  );
}
