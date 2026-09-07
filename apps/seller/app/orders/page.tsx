"use client";

import Image from "next/image";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import SellerHeader from "../../components/SellerHeader";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { getCustomerName } from "../../lib/customer";
import {
    Badge,
    Button,
    Modal,
    PageHeader,
    statusTone,
    DataTable,
    FilterBar,
    StatCard,
    Card,
} from "@bandhan/ui";

type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    price?: string;
    image: string;
};

type ShipmentDetails = {
    shiprocketOrderId?: string;
    shipmentId?: string;
    awbCode?: string;
    courierName?: string;
    pickupScheduledDate?: string;
    trackingUrl?: string;
    status?: string;
    trackingStatus?: string;
};

type Order = {
    id: string;
    first: string;
    last: string;
    email?: string;
    service: string;
    location: string;
    date: string;
    amount: string;
    payment: "PAID" | "PENDING" | "PARTIAL";
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    productImage: string;
    buyerPhone: string;
    shipmentDetails?: ShipmentDetails;
    items: OrderItem[];
};

type OrderWithItems = Order & { items: OrderItem[] };

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [trackingData, setTrackingData] = useState<Record<string, unknown> | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const [ordersResponse, statsResponse] = await Promise.all([
                    apiGet<{ success: boolean; orders: Array<Record<string, unknown>> }>("/orders"),
                    apiGet<{ success: boolean; data: { total: number; pending: number; confirmed: number; completed: number; cancelled: number } }>("/orders/stats"),
                ]);

                const data = Array.isArray(ordersResponse.orders) ? ordersResponse.orders : [];

                const toRecord = (value: unknown): Record<string, unknown> | null => {
                    return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
                };

                // Backend already filters orders & items per seller. Just map the data.
                setOrders(
                    data.map((order) => {
                        const orderRecord = order as Record<string, unknown>;
                        const buyerRecord = toRecord(orderRecord.buyerId) || toRecord(orderRecord.user) || toRecord(orderRecord.buyer) || toRecord(orderRecord.customer);
                        const shippingAddress = toRecord(orderRecord.shippingAddress) || toRecord(orderRecord.shipping_address) || {};
                        const itemCustomerName = Array.isArray(orderRecord.items)
                            ? String((orderRecord.items as Array<Record<string, unknown>>)[0]?.customerName || "")
                            : "";
                        const fullName = getCustomerName({
                            ...orderRecord,
                            buyerId: buyerRecord,
                            user: buyerRecord,
                            shippingAddress,
                            customerName: orderRecord.customerName || orderRecord.buyerName || itemCustomerName || undefined,
                        });
                        const [first, ...rest] = fullName.split(" ");
                        const normalizedStatus = String(orderRecord.orderStatus ?? orderRecord.status ?? "pending").toUpperCase();
                        const normalizedPaymentRaw = String(orderRecord.paymentStatus ?? "pending").toUpperCase();
                        const normalizedPayment =
                            normalizedPaymentRaw === "PARTIALLY_REFUNDED"
                                ? "PARTIAL"
                                : normalizedPaymentRaw === "PAID"
                                    ? "PAID"
                                    : "PENDING";

                        const items = Array.isArray(orderRecord.items) ? (orderRecord.items as Array<Record<string, unknown>>) : [];

                        const normalizedItem = (item: Record<string, unknown>) => {
                            const productSnapshotRecord = toRecord(item.productSnapshot);
                            const productIdRecord = toRecord(item.productId);
                            const name = String(item.title || productSnapshotRecord?.title || productIdRecord?.title || "Order item");
                            const qty = Number(item.quantity ?? item.qty ?? 1) || 1;
                            const priceValue = item.price ?? item.amount ?? item.selling_price ?? item.sellingPrice ?? productSnapshotRecord?.price ?? productIdRecord?.price;
                            const price = typeof priceValue === "number"
                                ? `₹${priceValue.toLocaleString()}`
                                : typeof priceValue === "string"
                                    ? priceValue
                                    : "";
                            // Get image from multiple sources
                            const imgSrc = item.image || "";
                            const snapImages = productSnapshotRecord?.images;
                            const prodImages = productIdRecord?.images;
                            const image = String(
                                imgSrc ||
                                (Array.isArray(snapImages) ? snapImages[0] : undefined) ||
                                (Array.isArray(prodImages) ? prodImages[0] : undefined) ||
                                "/image10.png"
                            );

                            return {
                                id: String(item._id || item.id || name),
                                name,
                                quantity: qty,
                                price,
                                image,
                                variant: String(item.variant || item.variantName || ""),
                            };
                        };

                        const orderItems = items.map(normalizedItem);
                        const firstItem = orderItems[0];
                        const productImage = firstItem?.image || "/image10.png";
                        const serviceText = orderItems.length
                            ? orderItems.map(i => i.name).join(", ")
                            : String(orderRecord.service || orderRecord.productName || "Order");
                        const location = [shippingAddress.street, shippingAddress.city, shippingAddress.state, shippingAddress.pincode]
                            .filter(Boolean)
                            .join(", ");
                        const buyerEmail = String(
                            (buyerRecord && typeof buyerRecord.email === "string" ? buyerRecord.email : "") ||
                            (typeof shippingAddress.email === "string" ? shippingAddress.email : "") ||
                            ""
                        );
                        const buyerPhone = String(
                            (buyerRecord && typeof buyerRecord.phone === "string" ? buyerRecord.phone : "") ||
                            (typeof shippingAddress.phone === "string" ? shippingAddress.phone : "") ||
                            ""
                        );
                        const shipmentDetails = toRecord(orderRecord.shipmentDetails) ?? undefined;

                        return {
                            id: String(orderRecord._id || orderRecord.id || ""),
                            first: first || "Bandhan",
                            last: rest.join(" ") || "Customer",
                            email: buyerEmail || undefined,
                            service: serviceText,
                            location: location || "Address not provided",
                            buyerPhone,
                            date: new Date(String(orderRecord.createdAt || Date.now())).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                            }),
                            amount: `₹${Number(orderRecord.amount || 0).toLocaleString()}`,
                            payment: normalizedPayment,
                            status:
                                normalizedStatus === "CONFIRMED" || normalizedStatus === "COMPLETED" || normalizedStatus === "CANCELLED"
                                    ? normalizedStatus
                                    : "PENDING",
                            productImage,
                            items: orderItems,
                            shipmentDetails: shipmentDetails ? {
                                shiprocketOrderId: String(shipmentDetails.shiprocketOrderId || ""),
                                shipmentId: String(shipmentDetails.shipmentId || ""),
                                awbCode: String(shipmentDetails.awbCode || shipmentDetails.awb || ""),
                                courierName: String(shipmentDetails.courierName || ""),
                                pickupScheduledDate: String(shipmentDetails.pickupScheduledDate || ""),
                                trackingUrl: String(shipmentDetails.trackingUrl || ""),
                                status: String(shipmentDetails.status || "NOT_SHIPPED"),
                                trackingStatus: String(shipmentDetails.trackingStatus || ""),
                            } : undefined,
                        };
                    })
                );

                if (statsResponse?.data) {
                setStats(statsResponse.data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            setOrders([]);
        }
    };

    loadOrders();
    }, []);

    const filteredOrders = useMemo(() => orders.filter((order) => {

        const fullName =
            `${order.first} ${order.last}`.toLowerCase();

        const matchesSearch =
            order.id.includes(searchTerm) ||
            fullName.includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "All" ||
            order.status === statusFilter;

        const matchesDate =
            !dateFilter ||
            new Date(order.date).toISOString().split("T")[0] === dateFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesDate
        );
    }), [orders, searchTerm, statusFilter, dateFilter]);

    const growthRate = useMemo(() => {
        return stats.total > 0 ? ((stats.confirmed / stats.total) * 100).toFixed(1) : "0";
    }, [stats.total, stats.confirmed]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        if (!toast) return;
        const timer = window.setTimeout(() => setToast(null), 3000);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const handleOpenDetails = (order: Order) => {
        setSelectedOrder({
            ...order,
            items: order.items ?? [],
        });
        setTrackingData(null);
        setIsModalOpen(true);
    };

    const orderColumns = useMemo(() => [
        {
            key: "id",
            header: "Order ID",
            accessor: (order: Order) => `#ORD-${order.id}`,
            sortable: true,
        },
        {
            key: "customer",
            header: "Customer",
            accessor: (order: Order) => (
                <div className="flex items-center gap-3">
                    <Image
                        src="/image10.png"
                        width={36}
                        height={36}
                        alt=""
                        className="rounded-full border"
                    />
                    <div>
                        <p className="font-medium text-[var(--bhn-text)]">
                            {order.first} {order.last}
                        </p>
                        {order.buyerPhone && (
                            <p className="text-xs text-[var(--bhn-text-muted)]">{order.buyerPhone}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "service",
            header: "Service",
            accessor: (order: Order) => (
                <div className="flex items-center gap-3">
                    <img
                        src={order.productImage}
                        alt={order.service}
                        className="h-10 w-10 rounded-lg object-cover border"
                    />
                    <span className="max-w-55 truncate">{order.service}</span>
                </div>
            ),
        },
        {
            key: "date",
            header: "Date",
            accessor: (order: Order) => order.date,
        },
        {
            key: "location",
            header: "Address",
            accessor: (order: Order) => order.location,
        },
        {
            key: "amount",
            header: "Amount",
            accessor: (order: Order) => order.amount,
        },
        {
            key: "payment",
            header: "Payment",
            cell: (order: Order) => (
                <Badge tone={order.payment === "PAID" ? "success" : order.payment === "PARTIAL" ? "warning" : "neutral"}>
                    {order.payment}
                </Badge>
            ),
        },
        {
            key: "status",
            header: "Status",
            cell: (order: Order) => (
                <Badge tone={statusTone(order.status)}>
                    {order.status}
                </Badge>
            ),
        },
        {
            key: "action",
            header: "Action",
            cell: (order: Order) => (
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDetails(order)}
                        aria-label="View order"
                    >
                        👁
                    </Button>

                    {order.status === "PENDING" && (
                        <>
                            <Button size="sm" onClick={() => handleOpenDetails(order)}>
                                Accept
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDetails(order)}
                                className="text-[var(--bhn-text-soft)] hover:text-[var(--bhn-error-600)]"
                            >
                                ✕
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ], [handleOpenDetails]);

    const handleShiprocketAction = async (action: "create-order" | "generate-awb" | "track") => {
        if (!selectedOrder?.id) return;
        setIsSubmitting(true);
        try {
            if (action === "create-order") {
                const payload = {
                    orderId: selectedOrder.id,
                    order_id: selectedOrder.id,
                    order_items: [{ name: selectedOrder.service, sku: selectedOrder.id, units: 1, selling_price: Number(String(selectedOrder.amount).replace(/[^\d.]/g, "")) || 0 }],
                    shippingAddress: {
                        street: selectedOrder.location,
                        city: "",
                        state: "",
                        pincode: "",
                        phone: selectedOrder.buyerPhone || "",
                    },
                };
                const response = await apiPost<{ success: boolean; message?: string; shipment?: Record<string, unknown>; data?: Record<string, unknown> }>("/shiprocket/create-order", payload);
                if (response?.success) {
                    const shipment = (response.shipment || response.data || {}) as Record<string, unknown>;
                    const awb = String(shipment.awbCode || "");
                    setToast(awb ? `Shipment created successfully. AWB: ${awb}` : "Shipment created successfully");
                    const updatedOrders = orders.map((order) => order.id === selectedOrder.id ? { ...order, shipmentDetails: { ...order.shipmentDetails, shiprocketOrderId: String(shipment.shiprocketOrderId || order.shipmentDetails?.shiprocketOrderId || ""), shipmentId: String(shipment.shipmentId || order.shipmentDetails?.shipmentId || ""), awbCode: String(shipment.awbCode || order.shipmentDetails?.awbCode || ""), courierName: String(shipment.courierName || order.shipmentDetails?.courierName || "Shiprocket"), status: String(shipment.status || order.shipmentDetails?.status || "CREATED") } } : order);
                    setOrders(updatedOrders);
                    setSelectedOrder((prev) => prev ? { ...prev, shipmentDetails: { ...prev.shipmentDetails, shiprocketOrderId: String(shipment.shiprocketOrderId || prev.shipmentDetails?.shiprocketOrderId || ""), shipmentId: String(shipment.shipmentId || prev.shipmentDetails?.shipmentId || ""), awbCode: String(shipment.awbCode || prev.shipmentDetails?.awbCode || ""), courierName: String(shipment.courierName || prev.shipmentDetails?.courierName || "Shiprocket"), status: String(shipment.status || prev.shipmentDetails?.status || "CREATED") } } : prev);
                } else {
                    throw new Error(response?.message || "Shiprocket request failed");
                }
            }

            if (action === "generate-awb") {
                const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>("/shiprocket/generate-awb", {
                    orderId: selectedOrder.id,
                    shipmentId: selectedOrder.shipmentDetails?.shipmentId || "",
                });
                if (response?.success) {
                    setToast("Label request sent successfully");
                    const updatedOrders = orders.map((order) => order.id === selectedOrder.id ? { ...order, shipmentDetails: { ...order.shipmentDetails, trackingUrl: String(response.data?.labelUrl || order.shipmentDetails?.trackingUrl || "") } } : order);
                    setOrders(updatedOrders);
                    setSelectedOrder((prev) => prev ? { ...prev, shipmentDetails: { ...prev.shipmentDetails, trackingUrl: String(response.data?.labelUrl || prev.shipmentDetails?.trackingUrl || "") } } : prev);
                } else {
                    throw new Error(response?.message || "AWB generation failed");
                }
            }

            if (action === "track") {
                if (!selectedOrder.shipmentDetails?.awbCode) {
                    throw new Error("AWB is not available yet");
                }
                const response = await apiGet<{ success: boolean; shipment?: Record<string, unknown>; data?: Record<string, unknown> }>(`/orders/shipping/track/${selectedOrder.id}`);
                if (response?.success) {
                    setTrackingData(response.data || null);
                    setToast("Tracking data loaded");
                } else {
                    throw new Error("Tracking request failed");
                }
            }
        } catch (error) {
            console.error(error);
            setToast(error instanceof Error ? error.message : "Shiprocket action failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const exportToCSV = () => {
        const headers = [
            "Order ID",
            "Customer Name",
            "Service",
            "Event Date",
            "Amount",
            "Payment Status",
            "Order Status",
        ];

        const rows = orders.map((order) => [
            `#ORD-${order.id}`,
            `${order.first} ${order.last}`,
            order.service,
            order.date,
            order.amount,
            order.payment,
            order.status,
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.setAttribute("download", "orders.csv");

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    };


    return (
        <div className="flex min-h-screen bg-[var(--bhn-bg)]">

            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <div className="flex-1 w-full overflow-hidden">

                <div className="p-4 sm:p-6 min-h-full">
                    <SellerHeader />

                    {/* Title */}
                    <PageHeader
                        title="Orders"
                        subtitle="Track, manage, and fulfill customer orders"
                        actions={
                            <Button variant="secondary" onClick={exportToCSV}>
                                Export CSV
                            </Button>
                        }
                    />

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

                        {([
                            {
                                name: "TOTAL ORDERS",
                                value: String(stats.total),
                                delta: null,
                            },
                            {
                                name: "PENDING",
                                value: String(stats.pending),
                                delta: null,
                            },
                            {
                                name: "CONFIRMED",
                                value: String(stats.confirmed),
                                delta: null,
                            },
                            {
                                name: "COMPLETED",
                                value: String(stats.completed),
                                delta: null,
                            },
                            {
                                name: "CANCELLED",
                                value: String(stats.cancelled),
                                delta: null,
                            },
                        ]).map((item, i) => (
                            <StatCard
                                key={i}
                                label={item.name}
                                value={item.value}
                                accent={i === 0}
                            />
                        ))}

                    </div>

                    {/* Filters */}
                    <FilterBar
                        filters={[
                            {
                                key: "search",
                                label: "Search",
                                type: "text",
                                placeholder: "Filter by Order ID or Name...",
                                value: searchTerm,
                                onChange: (value) => {
                                    setSearchTerm(value as string);
                                    setCurrentPage(1);
                                },
                            },
                            {
                                key: "status",
                                label: "Status",
                                type: "select",
                                options: [
                                    { value: "All", label: "All" },
                                    { value: "PENDING", label: "Pending" },
                                    { value: "CONFIRMED", label: "Confirmed" },
                                    { value: "COMPLETED", label: "Completed" },
                                    { value: "CANCELLED", label: "Cancelled" },
                                ],
                                value: statusFilter,
                                onChange: (value) => {
                                    setStatusFilter(value as string);
                                    setCurrentPage(1);
                                },
                            },
                            {
                                key: "date",
                                label: "Date",
                                type: "text",
                                placeholder: "Select date...",
                                value: dateFilter,
                                onChange: (value) => {
                                    setDateFilter(value as string);
                                    setCurrentPage(1);
                                },
                            },
                        ]}
                        activeCount={(searchTerm ? 1 : 0) + (statusFilter !== "All" ? 1 : 0) + (dateFilter ? 1 : 0)}
                        onClearAll={() => {
                            setSearchTerm("");
                            setStatusFilter("All");
                            setDateFilter("");
                            setCurrentPage(1);
                        }}
                    />

{/* Table */}
                    <Card>

                        <DataTable
                            columns={orderColumns}
                            data={filteredOrders}
                            keyAccessor={(order) => order.id}
                            pagination={{
                                page: safeCurrentPage,
                                pageSize,
                                total: filteredOrders.length,
                                onPageChange: handlePageChange,
                                pageSizeOptions: [10, 25, 50],
                            }}
                            selectable={false}
                            loading={false}
                            emptyMessage="No orders found"
                        />

                    </Card>

                    {/* Bottom Cards */}
                    <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 mt-6">

                        {/* Revenue Card */}
                        <div className="bg-[var(--bhn-surface-2)] p-4 rounded-xl flex flex-col md:flex-row justify-between gap-6 min-h-50 border border-[var(--bhn-border)]">

                            {/* LEFT TEXT */}
                            <div className="flex flex-col justify-between">

                                <div>
                                    <h2 className="text-xl sm:text-2xl font-semibold text-[var(--bhn-brand-700)]">
                                        Revenue Insights
                                    </h2>

                                    <p className="text-sm text-[var(--bhn-text-muted)] mt-2 max-w-md">
                                        Your revenue has increased by {growthRate}% compared to last month.
                                        Consider promoting your 'Photography' packages for the
                                        upcoming event season.
                                    </p>
                                </div>

                                <Link
                                    href="/earnings"
                                    className="text-[var(--bhn-brand-700)] text-sm font-medium mt-4"
                                >
                                    View detailed analytics →
                                </Link>

                            </div>

                            {/* RIGHT PERCENTAGE */}
                            <div className="flex flex-col items-start md:items-end justify-between">

                                <div className="text-left md:text-right">
                                    <p className="text-xl sm:text-2xl font-bold text-[var(--bhn-brand-700)]">
                                        {growthRate}%
                                    </p>

                                    <p className="text-xs text-[var(--bhn-text-muted)] tracking-wider">
                                        GROWTH RATE
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* Second Card */}
                        <div className="bhn-hero min-h-50">

                            <div className="bhn-hero-body flex flex-col justify-between gap-4 py-6 h-full">

                                <div className="flex items-start gap-3">

                                    <Image
                                        src="/image.png"
                                        width={24}
                                        height={24}
                                        alt="Rocket Icon"
                                    />

                                    <h2 className="text-xl sm:text-2xl font-semibold leading-snug">
                                        Ready to expand your catalog?
                                    </h2>

                                </div>

                                <p className="text-sm sm:text-base">
                                    New sellers who list at least 5 products in their first month see
                                    2x faster order growth.
                                </p>

                                <Button variant="secondary" className="mt-4 w-full sm:w-fit">
                                    ADD NEW PRODUCT
                                </Button>

                            </div>

                        </div>

                    </div>
                </div>

            </div>

            {toast && (
                <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-[var(--bhn-text)] px-4 py-3 text-sm text-[var(--bhn-surface)] shadow-lg">
                    {toast}
                </div>
            )}

            {isModalOpen && selectedOrder && (
                <Modal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={
                        <div>
                            <p className="text-sm text-[var(--bhn-text-muted)] font-normal">Order #{selectedOrder.id}</p>
                            <span className="text-xl font-semibold text-[var(--bhn-text)]">{selectedOrder.first} {selectedOrder.last}</span>
                        </div>
                    }
                    size="lg"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-4">
                            <p className="text-xs uppercase text-[var(--bhn-text-muted)]">Buyer Info</p>
                            <p className="mt-2 font-semibold text-[var(--bhn-text)]">{selectedOrder.first} {selectedOrder.last}</p>
                            {selectedOrder.email && (
                                <p className="text-sm text-[var(--bhn-text-muted)]">{selectedOrder.email}</p>
                            )}
                            <p className="text-sm text-[var(--bhn-text-muted)]">{selectedOrder.buyerPhone || "No phone provided"}</p>
                        </div>
                        <div className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-4">
                            <p className="text-xs uppercase text-[var(--bhn-text-muted)]">Shipping Address</p>
                            <p className="mt-2 text-sm text-[var(--bhn-text-muted)]">{selectedOrder.location}</p>
                            <p className="mt-2 text-xs uppercase text-[var(--bhn-text-muted)]">Order Value</p>
                            <p className="text-sm font-semibold text-[var(--bhn-text)]">{selectedOrder.amount}</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4">
                        <p className="text-xs uppercase text-[var(--bhn-text-muted)]">Order Items</p>
                        <div className="mt-3 space-y-3">
                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                selectedOrder.items.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-[var(--bhn-border)] p-4 bg-[var(--bhn-surface-2)]">
                                        <div className="flex items-start gap-3">
                                            <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover border" />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[var(--bhn-text)] truncate">{item.name}</p>
                                                <p className="text-sm text-[var(--bhn-text-muted)]">Qty: {item.quantity}</p>
                                                {item.price && <p className="text-sm text-[var(--bhn-text-muted)]">Price: {item.price}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="mt-2 text-sm text-[var(--bhn-text)]">{selectedOrder.service}</p>
                            )}
                        </div>
                    </div>

                    {/* SHIPPING SECTION - Only show when there are actual shipment details or items need shipping */}
                    {(selectedOrder.items.length > 0) && (
                        <div className="mt-6 rounded-xl border border-[var(--bhn-border-strong)] bg-[var(--bhn-surface-2)] p-4">
                            <p className="text-sm font-semibold text-[var(--bhn-text)] mb-4">Shipping</p>
                            <div className="rounded-lg border border-[var(--bhn-border-strong)] bg-[var(--bhn-surface)] p-3 text-sm text-[var(--bhn-text)]">
                                <p className="font-semibold">Customer: {selectedOrder.first} {selectedOrder.last}</p>
                                <p className="mt-1">Product / Service: {selectedOrder.service}</p>
                                <p className="mt-1">AWB: {selectedOrder.shipmentDetails?.awbCode || "Pending"}</p>
                                <p className="mt-1">Status: {selectedOrder.shipmentDetails?.status || "Not shipped yet"}</p>
                            </div>

                            <div className="space-y-3 mt-3">
                                {!selectedOrder.shipmentDetails?.shiprocketOrderId && !selectedOrder.shipmentDetails?.shipmentId && !selectedOrder.shipmentDetails?.awbCode && (
                                    <Button
                                        onClick={() => handleShiprocketAction("create-order")}
                                        disabled={isSubmitting}
                                        block
                                    >
                                        {isSubmitting ? "Processing..." : "Create Shipment ID"}
                                    </Button>
                                )}

                                {(selectedOrder.shipmentDetails?.shiprocketOrderId || selectedOrder.shipmentDetails?.shipmentId) && !selectedOrder.shipmentDetails?.awbCode && (
                                    <div className="rounded-lg border border-[var(--bhn-border-strong)] bg-[var(--bhn-surface)] p-3">
                                        <p className="text-sm font-medium text-[var(--bhn-text)]">
                                            Shipment ID: {selectedOrder.shipmentDetails.shipmentId || selectedOrder.shipmentDetails.shiprocketOrderId || "Pending"}
                                        </p>
                                        <Button
                                            onClick={() => handleShiprocketAction("generate-awb")}
                                            disabled={isSubmitting}
                                            block
                                            className="mt-3"
                                        >
                                            {isSubmitting ? "Processing..." : "Generate AWB Code"}
                                        </Button>
                                    </div>
                                )}

                                {selectedOrder.shipmentDetails?.awbCode && (
                                    <div className="rounded-lg border border-[var(--bhn-border-strong)] bg-[var(--bhn-surface)] p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-[var(--bhn-text)]">AWB Code: {selectedOrder.shipmentDetails.awbCode}</p>
                                                <p className="text-sm text-[var(--bhn-text-muted)]">Courier: {selectedOrder.shipmentDetails.courierName || "Shiprocket"}</p>
                                            </div>
                                            <Badge tone="success">SHIPPED</Badge>
                                        </div>
                                        <Button
                                            onClick={() => handleShiprocketAction("track")}
                                            disabled={isSubmitting}
                                            variant="secondary"
                                            block
                                            className="mt-3"
                                        >
                                            {isSubmitting ? "Loading..." : "Track Live Status"}
                                        </Button>
                                    </div>
                                )}

                                {trackingData && (
                                    <div className="rounded-lg border border-[var(--bhn-border-strong)] bg-[var(--bhn-surface)] p-3 text-sm text-[var(--bhn-text)]">
                                        <p className="font-semibold">Tracking Snapshot</p>
                                        <p className="mt-1">Status: {String(trackingData.status || trackingData.shipment_status || "Tracking available")}</p>
                                        <p className="mt-1">Current Location: {String(trackingData.current_location || trackingData.last_location || "Awaiting scan")}</p>
                                        <p className="mt-1">Estimated Delivery: {String(trackingData.estimated_delivery_date || trackingData.estimated_delivery || "Pending")}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}
