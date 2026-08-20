"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Package,
  RefreshCw,
  Timer,
  Truck,
} from "lucide-react";
import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import {
  useGetUserOrdersQuery,
  type UserOrderItem,
  type UserOrderRecord,
} from "@/store/api/userApi";
import {
  Badge,
  EmptyState,
  PageHeader,
  Spinner,
  StatCard,
  Tabs,
  statusTone,
} from "@bandhan/ui";

type OrderTab = "recent" | "pending" | "payment-pending";

const orderStatus = (order: UserOrderRecord) =>
  String(order.orderStatus || order.status || "pending").toLowerCase();

const paymentStatus = (order: UserOrderRecord) =>
  String(order.paymentStatus || order.payment || "pending").toLowerCase();

const shipmentStatus = (order: UserOrderRecord) =>
  String(order.shipping?.status || order.shipmentDetails?.status || "").toLowerCase();

const displayStatus = (value?: string) =>
  String(value || "pending").replace(/[_-]/g, " ").toUpperCase();

const formatOrderDate = (value?: string) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const firstItem = (order: UserOrderRecord): UserOrderItem | undefined =>
  Array.isArray(order.items) ? order.items[0] : undefined;

const itemTitle = (order: UserOrderRecord) => {
  const item = firstItem(order);
  return item?.title
    || item?.productSnapshot?.title
    || (typeof item?.productId === "object" ? item.productId.title : undefined)
    || order.productName
    || order.title
    || "Order";
};

const itemImage = (order: UserOrderRecord) => {
  const item = firstItem(order);
  return item?.image
    || item?.productSnapshot?.images?.[0]
    || (typeof item?.productId === "object" ? item.productId.images?.[0] : undefined)
    || order.image
    || "/placeholder.jpg";
};

const resolvedOrderId = (order: UserOrderRecord) =>
  String(order._id || order.orderId || "");

export default function OrdersPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetUserOrdersQuery();
  const [activeTab, setActiveTab] = useState<OrderTab>("recent");
  const orders = useMemo(
    () => (Array.isArray(data?.orders) ? data.orders : []),
    [data],
  );

  const stats = useMemo(() => ({
    total: orders.length,
    awaitingConfirmation: orders.filter((order) => orderStatus(order) === "pending").length,
    inTransit: orders.filter((order) =>
      ["shipped", "in transit", "in_transit", "out for delivery", "out_for_delivery"].includes(shipmentStatus(order)),
    ).length,
    fulfilled: orders.filter((order) =>
      orderStatus(order) === "completed" || ["delivered", "completed"].includes(shipmentStatus(order)),
    ).length,
  }), [orders]);

  const filtered = useMemo(() => orders.filter((order) => {
    if (activeTab === "pending") return orderStatus(order) === "pending";
    if (activeTab === "payment-pending") return paymentStatus(order) === "pending";
    return true;
  }), [activeTab, orders]);

  const deliveryUpdates = useMemo(() => orders.filter((order) => {
    const status = shipmentStatus(order);
    return Boolean(status)
      && !["not_shipped", "not shipped", "delivered", "completed", "cancelled"].includes(status)
      && !["completed", "cancelled"].includes(orderStatus(order));
  }).slice(0, 3), [orders]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 py-6">
        <PageHeader
          title="My orders"
          subtitle="Track verified order, payment, and carrier statuses returned by the platform."
        />

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="bhn-card p-8 text-center">
            <AlertCircle className="mx-auto text-[var(--bhn-error-600)]" size={32} />
            <h2 className="mt-3 font-semibold text-[var(--bhn-text)]">Orders unavailable</h2>
            <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">We could not load your saved orders.</p>
            <button type="button" onClick={() => refetch()} className="bhn-btn bhn-btn-primary mt-5 gap-2">
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package size={24} />}
            title="No orders yet"
            description="Completed product checkouts will appear here."
            action={<Link href="/products" className="bhn-btn bhn-btn-primary">Browse products</Link>}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="All orders" value={stats.total} icon={<Package size={18} />} accent />
              <StatCard label="Awaiting confirmation" value={stats.awaitingConfirmation} icon={<Timer size={18} />} />
              <StatCard label="In transit" value={stats.inTransit} icon={<Truck size={18} />} />
              <StatCard label="Fulfilled" value={stats.fulfilled} icon={<CheckCircle2 size={18} />} />
            </div>

            <Tabs
              items={[
                { id: "recent", label: "All" },
                { id: "pending", label: "Order pending" },
                { id: "payment-pending", label: "Payment pending" },
              ]}
              active={activeTab}
              onChange={(id) => setActiveTab(id as OrderTab)}
            />

            {filtered.length === 0 ? (
              <EmptyState
                icon={<Package size={24} />}
                title="No orders in this status"
                description="Choose another tab to view your other orders."
              />
            ) : (
              <div className={`grid gap-6 ${deliveryUpdates.length ? "lg:grid-cols-[minmax(0,1fr)_300px]" : ""}`}>
                <div className="bhn-card overflow-hidden">
                  <div className="hidden lg:block">
                    <div className="bhn-table-wrap">
                      <table className="bhn-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Item</th>
                            <th>Order status</th>
                            <th>Payment</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((order) => {
                            const id = resolvedOrderId(order);
                            const count = Array.isArray(order.items) ? order.items.length : 0;
                            return (
                              <tr key={id}>
                                <td className="font-medium text-[var(--bhn-brand-700)]">#{id.slice(-8).toUpperCase()}</td>
                                <td>
                                  <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-[var(--bhn-surface-3)]">
                                      <Image src={itemImage(order)} alt={itemTitle(order)} width={48} height={48} unoptimized className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-[var(--bhn-text)]">{itemTitle(order)}</p>
                                      <p className="text-xs text-[var(--bhn-text-muted)]">{count} item{count === 1 ? "" : "s"}</p>
                                    </div>
                                  </div>
                                </td>
                                <td><Badge tone={statusTone(orderStatus(order))}>{displayStatus(orderStatus(order))}</Badge></td>
                                <td className="font-medium text-[var(--bhn-text)]">{displayStatus(paymentStatus(order))}</td>
                                <td className="text-[var(--bhn-text-muted)]">{formatOrderDate(order.createdAt || order.date)}</td>
                                <td className="font-semibold text-[var(--bhn-text)]">₹{Number(order.total || order.amount || 0).toLocaleString("en-IN")}</td>
                                <td>
                                  <Link href={`/userdashboard/orders/${id}`} className="font-medium text-[var(--bhn-brand-700)] hover:underline">View</Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 lg:hidden">
                    {filtered.map((order) => {
                      const id = resolvedOrderId(order);
                      return (
                        <article key={id} className="rounded-xl border border-[var(--bhn-border)] p-4">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <p className="font-semibold text-[var(--bhn-brand-700)]">#{id.slice(-8).toUpperCase()}</p>
                            <Badge tone={statusTone(orderStatus(order))}>{displayStatus(orderStatus(order))}</Badge>
                          </div>
                          <div className="mb-4 flex items-center gap-3">
                            <div className="h-11 w-11 overflow-hidden rounded-lg bg-[var(--bhn-surface-3)]">
                              <Image src={itemImage(order)} alt={itemTitle(order)} width={44} height={44} unoptimized className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--bhn-text)]">{itemTitle(order)}</p>
                              <p className="text-xs text-[var(--bhn-text-muted)]">{formatOrderDate(order.createdAt || order.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Link href={`/userdashboard/orders/${id}`} className="bhn-btn bhn-btn-secondary bhn-btn-sm flex-1">View order</Link>
                            <p className="font-semibold text-[var(--bhn-text)]">₹{Number(order.total || order.amount || 0).toLocaleString("en-IN")}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                {deliveryUpdates.length > 0 && (
                  <aside className="bhn-card h-max p-4">
                    <h2 className="text-sm font-semibold text-[var(--bhn-text)]">Carrier updates</h2>
                    <div className="mt-3 space-y-4">
                      {deliveryUpdates.map((order) => {
                        const id = resolvedOrderId(order);
                        return (
                          <Link key={id} href={`/userdashboard/orders/${id}`} className="flex items-start gap-3 rounded-lg p-2 hover:bg-[var(--bhn-surface-2)]">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--bhn-surface-3)]">
                              <Image src={itemImage(order)} alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[var(--bhn-text)]">{itemTitle(order)}</p>
                              <p className="mt-0.5 text-xs text-[var(--bhn-brand-700)]">{displayStatus(shipmentStatus(order))}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </aside>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
