"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
    Settings,
    Bell,
    Search,
    Wallet,
    ShoppingBag,
    Clock,
    Star,
    Download,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { apiGet } from "@/lib/api";
import { getCustomerName } from "../../lib/customer";
import { useGetInventoryProductsQuery, useGetInventoryStatsQuery } from "@/lib/store/api/inventoryApi";
import { useGetSellerQuotesQuery } from "@/lib/store/api/chatApi";
import {
    StatCard,
    PageHeader,
    Badge,
    statusTone,
    Button,
    Card,
    SearchInput,
    SectionHeader,
    Skeleton,
} from "@bandhan/ui";

export default function SellerDashboard() {
    const [userName, setUserName] = useState("Seller");
    const [stats, setStats] = useState<Array<{
        title: string;
        value: string;
        badge?: string;
    }>>([]);
    const [recentOrders, setRecentOrders] = useState<Array<{
        id: string;
        customer: string;
        service: string;
        amount: string;
        status: string;
    }>>([]);
    const [dailyRevenue, setDailyRevenue] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
    const [topServices, setTopServices] = useState<Array<{ title: string; sales: string; image?: string }>>([]);
    const [recentActivities, setRecentActivities] = useState<Array<{ text: string; time: string; icon: string }>>([]);
    const { data: inventoryProductsData } = useGetInventoryProductsQuery({ limit: 100 });
    const { data: inventoryStatsData } = useGetInventoryStatsQuery();
    const { data: sellerQuotesData } = useGetSellerQuotesQuery();

    const getSafeImageSrc = (value?: string, fallback = "/Container3.png") => {
        if (typeof value !== "string") return fallback;
        const trimmed = value.trim();
        return trimmed ? trimmed : fallback;
    };

    useEffect(() => {
        const storedName = typeof window !== "undefined" ? localStorage.getItem("userName") : null;

        if (storedName) {
            setUserName(storedName);
        }

        const loadDashboard = async () => {
            try {
                const [ordersStats, ordersList, inventoryStats, inventoryProducts] = await Promise.all([
                    apiGet<{ success: boolean; data: { total?: number; pending?: number; confirmed?: number; completed?: number } }>('/orders/stats').catch(() => ({ success: false, data: { total: 0, pending: 0, confirmed: 0, completed: 0 } })),
                    apiGet<{ success: boolean; orders?: Array<Record<string, unknown>> }>('/orders').catch(() => ({ success: false, orders: [] })),
                    Promise.resolve(inventoryStatsData || { data: { total: 0 } }),
                    Promise.resolve(inventoryProductsData || { products: [] }),
                ]);

                const allOrders = Array.isArray(ordersList.orders) ? ordersList.orders : [];
                const toRecord = (value: unknown): Record<string, unknown> | null =>
                    typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

                const totalRevenue = allOrders.reduce((sum, item) => sum + Number(item.amount || 0), 0);

                const products = Array.isArray(inventoryProducts.products) ? inventoryProducts.products : [];
                const avgRating = products.length
                    ? products.reduce((sum, item) => sum + Number(item.rating || 0), 0) / products.length
                    : 0;

                const normalizeCustomerName = (order: Record<string, unknown>) => {
                    const buyer = toRecord(order.buyerId) || toRecord(order.customer) || toRecord(order.user);
                    return String(
                        order.customerName ||
                        order.buyerName ||
                        order.userName ||
                        buyer?.name ||
                        buyer?.fullName ||
                        "Customer"
                    );
                };

                setStats([
                    {
                        title: "TOTAL REVENUE",
                        value: `₹${Math.round(totalRevenue).toLocaleString()}`,
                        badge: "Live",
                    },
                    {
                        title: "TOTAL ORDERS",
                        value: String(ordersStats.data?.total || 0),
                    },
                    {
                        title: "PENDING ORDERS",
                        value: String(ordersStats.data?.pending || 0),
                    },
                    {
                        title: "SELLER RATING",
                        value: `${avgRating.toFixed(1)} / 5`,
                    },
                ]);

                setRecentOrders(
                    allOrders.slice(0, 5).map((item) => {
                        const orderRecord = item as Record<string, unknown>;
                        const buyer = toRecord(orderRecord.buyerId) || toRecord(orderRecord.customer) || toRecord(orderRecord.user);
                        const customerName = String(
                            orderRecord.customerName ||
                            orderRecord.buyerName ||
                            orderRecord.userName ||
                            buyer?.name ||
                            buyer?.fullName ||
                            "Customer"
                        );
                        return {
                            id: `#ORD-${String(orderRecord._id || orderRecord.id || "").slice(-5)}`,
                            customer: customerName,
                            service: String(orderRecord.service || orderRecord.productName || orderRecord.title || "Order"),
                            amount: `₹${Number(orderRecord.amount || 0).toLocaleString()}`,
                            status:
                                String(orderRecord.orderStatus || orderRecord.status || "pending").toLowerCase() === "confirmed"
                                    ? "Confirmed"
                                    : String(orderRecord.orderStatus || orderRecord.status || "pending").toLowerCase() === "completed"
                                        ? "Completed"
                                        : "Pending",
                        };
                    })
                );

                const dayTotals = [0, 0, 0, 0, 0, 0, 0];
                allOrders.forEach((o) => {
                    const created = o.createdAt || o.created_at;
                    if (created) {
                        const d = new Date(created as string);
                        const day = d.getDay();
                        dayTotals[day] += Number(o.amount || 0);
                    }
                });
                const maxDay = Math.max(...dayTotals, 1);
                setDailyRevenue(dayTotals.map((v) => Math.round((v / maxDay) * 120)));

                const sortedProducts = [...products]
                    .sort((a, b) => Number((b as any).sales || (b as any).orderCount || 0) - Number((a as any).sales || (a as any).orderCount || 0))
                    .slice(0, 3);
                setTopServices(
                    sortedProducts.length > 0
                        ? sortedProducts.map((p: any) => ({
                            title: p.title || p.name || "Service",
                            sales: `${p.sales || p.orderCount || 0} sales this month`,
                            image: p.images?.[0] || p.image || "",
                        }))
                        : []
                );

                const latestOrders = allOrders.slice(0, 3);
                const activities: Array<{ text: string; time: string; icon: string }> = [];
                latestOrders.forEach((o, i) => {
                    const status = String(o.orderStatus || o.status || "").toLowerCase();
                    if (status === "completed") {
                        activities.push({
                            text: `Order #ORD-${String(o._id || o.id || "").slice(-5)} completed.`,
                            time: `${i + 1} hour${i > 0 ? "s" : ""} ago`,
                            icon: "/Container1.png",
                        });
                    } else if (status === "confirmed" || status === "pending") {
                        activities.push({
                            text: `New order from ${getCustomerName(o)}.`,
                            time: `${i + 1} hour${i > 0 ? "s" : ""} ago`,
                            icon: "/Background2.png",
                        });
                    }
                });
                if (activities.length === 0) {
                    activities.push({
                        text: "No recent activity",
                        time: "",
                        icon: "/Background3.png",
                    });
                }
                setRecentActivities(activities);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
                setRecentOrders([]);
                setTopServices([]);
                setRecentActivities([{ text: "No recent activity", time: "", icon: "/Background3.png" }]);
            }
        };

        loadDashboard();
    }, [inventoryProductsData, inventoryStatsData, sellerQuotesData]);

    // Modern components
    const iconComponents = useMemo(() => [Wallet, ShoppingBag, Clock, Star], []);

    return (
        <div className="flex min-h-screen bg-[var(--bhn-bg)]">

            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN */}
            <main className="flex-1">

                {/* HEADER */}
                <header className="bg-[var(--bhn-surface-2)] border-b border-[var(--bhn-border)] px-4 sm:px-5 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    {/* SEARCH */}
                    <div className="relative w-full lg:w-[360px]">
                        <SearchInput
                            placeholder="Search orders or services..."
                            value=""
                            onChange={() => {}}
                        />
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center justify-end gap-5">

                        <button className="cursor-pointer">
                            <Bell size={20} className="text-[var(--bhn-text-muted)]" />
                        </button>

                        <Link
                            href="/settings"
                            aria-label="Open profile settings"
                            className="cursor-pointer"
                        >
                            <Settings size={20} className="text-[var(--bhn-text-muted)]" />
                        </Link>

                        <Link
                            href="/settings"
                            className="font-medium text-[var(--bhn-text)] hover:text-[var(--bhn-brand-700)] transition"
                        >
                            {userName}
                        </Link>

                        <Link href="/settings" aria-label="View seller profile">
                            <img
                                src="/profile.png"
                                alt="profile"
                                className="w-10 h-10 rounded-full object-cover ring-1 ring-[var(--bhn-border-strong)] hover:ring-[var(--bhn-brand-700)] transition"
                            />
                        </Link>
                    </div>
                </header>

                {/* CONTENT */}
                <div className="p-4 sm:p-5">

                    {/* TOP */}
                    <PageHeader
                        title={`Namaste, ${userName}`}
                        subtitle="Here's what's happening with your marketplace today."
                        actions={
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    alert("Report Exported Successfully!");
                                }}
                                icon={<Download size={16} />}
                            >
                                Export Report
                            </Button>
                        }
                    />

                    {/* STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-4">

                        {stats.map((item, i) => {
                            const Icon = iconComponents[i];
                            return (
                                <StatCard
                                    key={i}
                                    label={
                                        <>
                                            {item.title}
                                            {item.badge && (
                                                <Badge tone="success" className="ml-2">{item.badge}</Badge>
                                            )}
                                        </>
                                    }
                                    value={item.value}
                                    icon={<Icon key={i} size={18} />}
                                    accent={i === 0}
                                />
                            );
                        })}
                    </div>

                    {/* GRID */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* LEFT */}
                        <div className="xl:col-span-2 space-y-6">

                            {/* GRAPH */}
                            <Card padded className="p-4">

                                <SectionHeader
                                    title="Revenue Analytics"
                                    actionButtons={[
                                        {
                                            label: "Last 30 Days",
                                            variant: "secondary",
                                            size: "sm",
                                        },
                                    ]}
                                />

                                {/* BARS */}
                                <div className="h-[240px] flex items-end justify-between gap-3">

                                    {dailyRevenue.map((height, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center gap-3 flex-1"
                                        >
                                            <div
                                                className="w-full bg-[var(--bhn-brand-200)] rounded-md"
                                                style={{ height: `${Math.max(height, 2)}px` }}
                                            />

                                            <span className="text-xs text-[var(--bhn-text-soft)]">
                                                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][index]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* ORDERS */}
                            <Card>

                                <SectionHeader
                                    title="Recent Orders"
                                    actionButtons={[
                                        {
                                            label: "View All",
                                            onClick: () => {},
                                            href: "/orders",
                                            variant: "ghost",
                                            size: "sm",
                                        },
                                    ]}
                                />

                                <div className="bhn-table-wrap border-x-0 border-b-0 rounded-none">

                                    <table className="bhn-table min-w-[700px]">

                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>CUSTOMER</th>
                                                <th>SERVICE</th>
                                                <th>AMOUNT</th>
                                                <th>STATUS</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {recentOrders.map((order, index) => (
                                                <tr key={index}>
                                                    <td className="font-semibold text-[var(--bhn-text)]">
                                                        {order.id}
                                                    </td>

                                                    <td className="font-semibold text-[var(--bhn-text)]">
                                                        {order.customer}
                                                    </td>

                                                    <td className="text-[var(--bhn-text-muted)]">
                                                        {order.service}
                                                    </td>

                                                    <td className="font-semibold text-[var(--bhn-text)]">
                                                        {order.amount}
                                                    </td>

                                                    <td>
                                                        <Badge tone={statusTone(order.status)}>
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}

                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>

                        {/* RIGHT */}
                        <div className="space-y-6">

                            {/* WALLET */}
                            <Card>

                                <h3 className="text-[24px] font-display text-[var(--bhn-text)] mb-4">
                                    Financial Overview
                                </h3>

                                <p className="uppercase text-xs text-[var(--bhn-text-muted)]">
                                    Wallet Balance
                                </p>

                                <h2 className="text-[42px] font-semibold text-[var(--bhn-text)] mt-1">
                                    {stats[0]?.value || "₹0"}
                                </h2>

                                <div className="mt-4">

                                    <div className="flex justify-between text-sm text-[var(--bhn-text-muted)] mb-2">
                                        <span>Commission Goal</span>
                                        <span>₹{Math.round(Number(stats[0]?.value.replace(/[₹,]/g, "") || 0) * 0.1).toLocaleString()} / ₹{Math.round(Number(stats[0]?.value.replace(/[₹,]/g, "") || 0) * 0.2).toLocaleString()}</span>
                                    </div>

                                    <div className="w-full h-2 rounded-full bg-[var(--bhn-surface-3)]">
                                        <div className="h-full bg-[var(--bhn-brand-600)] rounded-full" style={{ width: "80%" }} />
                                    </div>

                                    <p className="text-xs text-[var(--bhn-text-soft)] mt-3">
                                        20% commission deducted at payout.
                                    </p>
                                </div>

                                <Button variant="primary" block className="mt-4">
                                    Withdraw Funds
                                </Button>
                            </Card>

                            {/* TOP SERVICES */}
                            <Card padded>

                                <h3 className="text-[24px] font-display text-[var(--bhn-text)] mb-5">
                                    Top Services
                                </h3>

                                <div className="space-y-5">

                                    {(topServices.length > 0 ? topServices : [
                                        { title: "No services yet", sales: "", image: "" },
                                    ]).map((item, i) => (
                                        <button
                                            key={i}
                                            className="w-full flex items-center justify-between hover:bg-[var(--bhn-surface-3)] rounded-xl p-2 transition"
                                        >
                                            <div className="flex items-center gap-4">

                                                <img
                                                    src={getSafeImageSrc(item.image, "/Container3.png")}
                                                    alt={item.title || "Service preview"}
                                                    className="w-12 h-12 rounded-xl object-cover"
                                                />

                                                <div className="text-left">
                                                    <p className="font-medium text-[var(--bhn-text)]">
                                                        {item.title}
                                                    </p>

                                                    <p className="text-sm text-[var(--bhn-text-muted)]">
                                                        {item.sales}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="text-[var(--bhn-text-soft)]">↗</span>
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            {/* ACTIVITY */}
                            <Card padded>

                                <h3 className="text-[24px] font-display text-[var(--bhn-text)] mb-6">
                                    Recent Activity
                                </h3>

                                <div className="space-y-6">

                                    {recentActivities.map((act, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--bhn-brand-50)] flex items-center justify-center flex-shrink-0">
                                                <img src={getSafeImageSrc(act.icon, "/Background3.png")} alt="Activity icon" className="w-6 h-6" />
                                            </div>

                                            <div>
                                                <p className="text-[var(--bhn-text)] font-medium">
                                                    {act.text}
                                                </p>

                                                {act.time && (
                                                    <p className="text-sm text-[var(--bhn-text-muted)]">
                                                        {act.time}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}