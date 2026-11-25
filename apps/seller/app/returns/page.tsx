"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import SellerHeader from "../../components/SellerHeader";
import { getCustomerName } from "../../lib/customer";
import { apiGet, apiPut } from "@/lib/api";

type ReturnItem = {
    id: string;
    name: string;
    order: string;
    product: string;
    sku: string;
    type: string;
    reason: string;
    amountNumber: number;
    amount: string;
    status: "Pending" | "Approved" | "Refunded" | "Rejected" | string;
    date: string;
    rawDate: string;
};

export default function ReturnsPage() {
    /* =========================
        STATES
    ========================= */
    const [allRequests, setAllRequests] = useState<ReturnItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [reasonFilter, setReasonFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    /* =========================
        FETCH DATA
    ========================= */
    const loadReturns = async () => {
        setLoading(true);
        try {
            const list = await apiGet<{ success: boolean; returns: Array<Record<string, unknown>> }>("/returns");

            const rows = Array.isArray(list.returns) ? list.returns : [];
            const toRecord = (value: unknown): Record<string, unknown> | null =>
                typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

            const formattedRows: ReturnItem[] = rows.map((item) => {
                const row = item as Record<string, unknown>;
                const buyer = toRecord(row.buyerId) || toRecord(row.customer) || toRecord(row.user);
                const amt = Number(row.amount || 0);
                const rawDateStr = String(row.requestDate || row.createdAt || new Date().toISOString());

                return {
                    id: String(row._id || row.requestId || ""),
                    name: getCustomerName(row),
                    order: String(row.orderId || (toRecord(row.order)?.id) || (toRecord(row.order)?.orderId) || "N/A"),
                    product: String(row.productName || row.product || row.itemName || "Product"),
                    sku: String(row.sku || "SKU-NA"),
                    type: String(row.type || "Product"),
                    reason: String(row.reason || "NA"),
                    amountNumber: amt,
                    amount: `₹${amt.toLocaleString("en-IN")}`,
                    status: String(row.status || "Pending"),
                    date: new Date(rawDateStr).toLocaleDateString("en-IN"),
                    rawDate: rawDateStr.split("T")[0],
                };
            });

            setAllRequests(formattedRows);
        } catch (error: any) {
            const status = error?.status || error?.response?.status || 500;
            const msg = error?.data?.message || error?.response?.data?.message || error?.message || 'Failed to load returns';
            console.error('Failed to load returns:', { status, msg, error });
            if (process.env.NODE_ENV !== 'production') alert(`Failed to load returns (${status}): ${msg}`);
            setAllRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReturns();
    }, []);

    /* =========================
        DYNAMIC SUMMARY CALCULATIONS
    ========================= */
    const summary = useMemo(() => {
        const totalRequests = allRequests.length;
        let pending = 0;
        let approved = 0;
        let rejected = 0;
        let refundedAmount = 0;

        allRequests.forEach((req) => {
            const status = req.status.toLowerCase();
            if (status === "pending") pending++;
            else if (status === "approved") approved++;
            else if (status === "rejected") rejected++;

            if (status === "refunded") {
                refundedAmount += req.amountNumber;
            }
        });

        return { totalRequests, pending, approved, rejected, refundedAmount };
    }, [allRequests]);

    /* =========================
        UPDATE STATUS (API + LOCAL)
    ========================= */
    const updateReturnStatus = async (id: string, nextStatus: "Approved" | "Rejected" | "Refunded") => {
        try {
            const endpoint = nextStatus.toLowerCase();
            await apiPut(`/returns/${endpoint}/${id}`, {});

            setAllRequests((current) =>
                current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
            );
        } catch (error: any) {
            const status = error?.status || error?.response?.status || 500;
            const msg = error?.data?.message || error?.response?.data?.message || error?.message || `Failed to ${nextStatus} return`;
            console.error(`Failed to ${nextStatus} return:`, { status, msg, error });
            alert(`Error (${status}): ${msg}`);
        }
    };

    /* =========================
        BULK ACTIONS
    ========================= */
    const handleBulkAction = async (nextStatus: "Approved" | "Rejected") => {
        if (selectedRows.length === 0) return;

        try {
            await Promise.all(
                selectedRows.map((id) => apiPut(`/returns/${nextStatus.toLowerCase()}/${id}`, {}))
            );

            setAllRequests((current) =>
                current.map((item) =>
                    selectedRows.includes(item.id) ? { ...item, status: nextStatus } : item
                )
            );
            setSelectedRows([]);
        } catch (error: any) {
            const status = error?.status || error?.response?.status || 500;
            const msg = error?.data?.message || error?.response?.data?.message || error?.message || 'Bulk action failed';
            console.error('Bulk action failed:', { status, msg, error });
            alert(`Bulk action failed (${status}): ${msg}`);
        }
    };

    /* =========================
        FILTERS
    ========================= */
    const filteredRequests = useMemo(() => {
        return allRequests.filter((item) => {
            const matchSearch =
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.id.toLowerCase().includes(search.toLowerCase()) ||
                item.order.toLowerCase().includes(search.toLowerCase());

            const matchStatus = statusFilter === "All" || item.status === statusFilter;
            const matchReason = reasonFilter === "All" || item.reason === reasonFilter;
            const matchDate = !dateFilter || item.rawDate === dateFilter;

            return matchSearch && matchStatus && matchReason && matchDate;
        });
    }, [allRequests, search, statusFilter, reasonFilter, dateFilter]);

    /* =========================
        CSV EXPORT
    ========================= */
    const exportCSV = () => {
        const headers = ["Request ID", "Customer", "Order", "Product", "Type", "Reason", "Amount", "Status", "Date"];
        const rows = filteredRequests.map((item) => [
            item.id,
            `"${item.name}"`,
            item.order,
            `"${item.product}"`,
            item.type,
            `"${item.reason}"`,
            item.amountNumber,
            item.status,
            item.date,
        ]);

        const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `returns_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* =========================
        SELECTION HANDLERS
    ========================= */
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(filteredRequests.map((item) => item.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelect = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("All");
        setReasonFilter("All");
        setDateFilter("");
    };

    return (
        <div className="flex min-h-screen bg-[var(--bhn-bg)]">
            <Sidebar />

            <div className="flex-1 w-full overflow-hidden">
                <div className="p-4 sm:p-6 min-h-screen">
                    <SellerHeader />

                    {/* HEADING */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
                        <div className="w-full">
                            <h1 className="text-lg sm:text-base lg:text-xl font-serif font-semibold text-[var(--bhn-text)] leading-tight">
                                Returns & Refunds
                            </h1>
                            <p className="text-[var(--bhn-text-muted)] text-sm sm:text-[15px] mt-2 max-w-[620px] leading-6">
                                Manage your post-purchase workflows. Review return requests, process refunds, and track customer satisfaction trends.
                            </p>
                        </div>

                        {/* RIGHT ACTION BUTTONS */}
                        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button className="bhn-btn bhn-btn-secondary h-[42px]">
                                Orders
                            </button>
                            <button className="bhn-btn bhn-btn-secondary h-[42px]">
                                Shipping
                            </button>
                            <button className="bhn-btn bhn-btn-primary h-[42px]">
                                Returns
                            </button>
                        </div>
                    </div>

                    {/* DYNAMIC STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                        {[
                            {
                                title: "TOTAL REQUESTS",
                                value: String(summary.totalRequests),
                                sub: "Live from returns API",
                                subColor: "text-[var(--bhn-text-muted)]",
                            },
                            {
                                title: "PENDING APPROVALS",
                                value: String(summary.pending),
                                sub: "Requires immediate action",
                                subColor: "text-[var(--bhn-text)]",
                            },
                            {
                                title: "APPROVED RETURNS",
                                value: String(summary.approved),
                                sub: "Approved by seller",
                                subColor: "text-[var(--bhn-text-muted)]",
                            },
                            {
                                title: "REJECTED",
                                value: String(summary.rejected),
                                sub: "Policy non-compliance",
                                subColor: "text-[var(--bhn-text-muted)]",
                            },
                            {
                                title: "REFUNDED AMOUNT",
                                value: `₹${summary.refundedAmount.toLocaleString("en-IN")}`,
                                sub: "YTD financial impact",
                                subColor: "text-[var(--bhn-text-muted)]",
                                bg: "bg-[var(--bhn-brand-50)]",
                            },
                        ].map((item, i) => (
                            <div key={i} className={`${item.bg || "bg-[var(--bhn-surface)]"} rounded-2xl p-5 border border-[var(--bhn-border)]`}>
                                <p className="text-[11px] text-[var(--bhn-text-muted)] tracking-wide">{item.title}</p>
                                <h2 className="text-[28px] font-semibold text-[var(--bhn-text)] mt-2">{item.value}</h2>
                                <p className={`text-xs mt-2 ${item.subColor}`}>{item.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* FILTERS */}
                    <div className="bg-[var(--bhn-surface-2)] rounded-2xl p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                            <div className="flex items-center bg-[var(--bhn-surface)] border rounded-lg px-4">
                                <Image src="/image9.png" width={15} height={15} alt="search" />
                                <input
                                    type="text"
                                    placeholder="ID or Customer Name"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-3 py-3 outline-none text-sm"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-[var(--bhn-surface)] border rounded-lg px-4 py-3 text-sm outline-none"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Refunded">Refunded</option>
                                <option value="Rejected">Rejected</option>
                            </select>

                            <select
                                value={reasonFilter}
                                onChange={(e) => setReasonFilter(e.target.value)}
                                className="bg-[var(--bhn-surface)] border rounded-lg px-4 py-3 text-sm outline-none"
                            >
                                <option value="All">All Reasons</option>
                                <option value="Damaged">Damaged</option>
                                <option value="Cancellation">Cancellation</option>
                                <option value="Wrong Item">Wrong Item</option>
                                <option value="Late Delivery">Late Delivery</option>
                            </select>

                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="bg-[var(--bhn-surface)] border rounded-lg px-4 py-3 text-sm outline-none"
                            />

                            <button onClick={clearFilters} className="bhn-btn bhn-btn-secondary">
                                Clear Filters
                            </button>

                            <button onClick={loadReturns} className="bhn-btn bhn-btn-primary">
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* TABLE CONTAINER */}
                    <div className="bg-[var(--bhn-surface)] rounded-2xl border border-[var(--bhn-border)] overflow-hidden">
                        {/* TOP BAR */}
                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 px-4 sm:px-6 py-5 border-b border-[var(--bhn-border)]">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <h2 className="text-sm font-semibold text-[var(--bhn-text)]">Request Queue</h2>
                                <span className="w-fit text-xs bg-[var(--bhn-brand-50)] text-[var(--bhn-text)] px-3 py-1 rounded-full font-medium">
                                    {summary.pending} Actions Required
                                </span>
                            </div>

                            {/* BULK ACTIONS & EXPORT */}
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => handleBulkAction("Approved")}
                                    disabled={selectedRows.length === 0}
                                    className="h-[38px] px-4 rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] text-sm font-medium text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-brand-50)] disabled:opacity-50 transition"
                                >
                                    ✔ Bulk Approve ({selectedRows.length})
                                </button>

                                <button
                                    onClick={() => handleBulkAction("Rejected")}
                                    disabled={selectedRows.length === 0}
                                    className="h-[38px] px-4 rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] text-sm font-medium text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-brand-50)] disabled:opacity-50 transition"
                                >
                                    ✖ Bulk Reject ({selectedRows.length})
                                </button>

                                <button
                                    onClick={exportCSV}
                                    className="h-[38px] px-4 rounded-lg bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] text-sm font-medium hover:bg-[var(--bhn-brand-500)] transition"
                                >
                                    ⬇ Export CSV
                                </button>
                            </div>
                        </div>

                        {/* MOBILE CARDS */}
                        <div className="block lg:hidden">
                            {loading ? (
                                <p className="p-5 text-center text-sm text-[var(--bhn-text-muted)]">Loading requests...</p>
                            ) : filteredRequests.length === 0 ? (
                                <p className="p-5 text-center text-sm text-[var(--bhn-text-muted)]">No requests found</p>
                            ) : filteredRequests.map((item) => (
                                <div key={item.id} className="p-4 border-b border-[var(--bhn-border)]">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--bhn-text)]">#RET-{item.id}</p>
                                            <h3 className="font-semibold text-[var(--bhn-text)] mt-1">{item.name}</h3>
                                            <p className="text-xs text-[var(--bhn-text-muted)] mt-1">Order: {item.order}</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(item.id)}
                                            onChange={() => handleSelect(item.id)}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-sm text-[var(--bhn-text-muted)] leading-6">{item.product}</p>
                                        <p className="text-xs text-[var(--bhn-text-muted)] mt-1">SKU: {item.sku}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 mt-4">
                                        <span className="text-[10px] px-2 py-1 rounded font-medium bg-[var(--bhn-brand-50)] text-[var(--bhn-text)]">
                                            {item.type}
                                        </span>
                                        <span className="text-xs px-3 py-1 rounded-full font-medium bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]">
                                            ● {item.status}
                                        </span>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-xs text-[var(--bhn-text-muted)]">Reason: "{item.reason}"</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--bhn-text)]">{item.amount}</p>
                                            <p className="text-xs text-[var(--bhn-text-muted)] mt-1">{item.date}</p>
                                        </div>

                                        {item.status === "Pending" && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateReturnStatus(item.id, "Approved")}
                                                    className="px-2 py-1 bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] rounded text-xs"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => updateReturnStatus(item.id, "Rejected")}
                                                    className="px-2 py-1 border text-[var(--bhn-text)] rounded text-xs"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[var(--bhn-neutral-50)]">
                                    <tr className="text-[11px] uppercase tracking-wide text-[var(--bhn-text-muted)]">
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.length === filteredRequests.length && filteredRequests.length > 0}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left">Request ID</th>
                                        <th className="px-6 py-4 text-left">Customer & Order</th>
                                        <th className="px-6 py-4 text-left">Product / Service</th>
                                        <th className="px-6 py-4 text-left">Type & Reason</th>
                                        <th className="px-6 py-4 text-left">Amount</th>
                                        <th className="px-6 py-4 text-left">Request Date</th>
                                        <th className="px-6 py-4 text-left">Status</th>
                                        <th className="px-6 py-4 text-left">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-8 text-center text-sm text-[var(--bhn-text-muted)]">
                                                Loading requests...
                                            </td>
                                        </tr>
                                    ) : filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-8 text-center text-sm text-[var(--bhn-text-muted)]">
                                                No returns match your filter criteria.
                                            </td>
                                            </tr>
                                    ) : filteredRequests.map((item) => (
                                        <tr key={item.id} className="border-t hover:bg-[var(--bhn-neutral-50)] transition">
                                            <td className="px-6 py-5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(item.id)}
                                                    onChange={() => handleSelect(item.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-[var(--bhn-text)] font-medium">
                                                #RET-{item.id}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-medium text-[var(--bhn-text)]">{item.name}</div>
                                                <div className="text-xs text-[var(--bhn-text-muted)] mt-1">Order: {item.order}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[10px] px-2 py-1 rounded font-medium bg-[var(--bhn-brand-50)] text-[var(--bhn-text)]">
                                                    {item.type}
                                                </span>
                                                <div className="text-xs text-[var(--bhn-text-muted)] mt-2">"{item.reason}"</div>
                                            </td>
                                            <td className="px-6 py-5 font-medium whitespace-nowrap">{item.amount}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-[var(--bhn-text-muted)]">{item.date}</td>
                                            <td className="px-6 py-5">
                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full font-medium inline-flex items-center gap-2 ${
                                                        item.status === "Pending"
                                                            ? "bg-[var(--bhn-brand-50)] text-[var(--bhn-text)]"
                                                            : item.status === "Approved"
                                                                ? "bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]"
                                                                : item.status === "Refunded"
                                                                    ? "bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]"
                                                                    : "bg-[var(--bhn-neutral-100)] text-[var(--bhn-text-muted)]"
                                                    }`}
                                                >
                                                    ● {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                {item.status === "Pending" ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateReturnStatus(item.id, "Approved")}
                                                            className="rounded-md bg-[var(--bhn-brand-600)] px-2 py-1 text-xs text-[var(--bhn-text-on-brand)] hover:bg-[var(--bhn-brand-500)]"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updateReturnStatus(item.id, "Rejected")}
                                                            className="rounded-md border text-[var(--bhn-text)] px-2 py-1 text-xs text-[var(--bhn-text)] hover:bg-[var(--bhn-neutral-50)]"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : item.status === "Approved" ? (
                                                    <button
                                                        onClick={() => updateReturnStatus(item.id, "Refunded")}
                                                        className="rounded-md border border-[var(--bhn-brand-600)] px-2 py-1 text-xs text-[var(--bhn-text)] hover:bg-[var(--bhn-neutral-50)]"
                                                    >
                                                        Mark Refunded
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-[var(--bhn-text-muted)]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* FOOTER */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-t text-sm text-[var(--bhn-text-muted)]">
                            <p className="text-center sm:text-left">
                                Showing 1–{filteredRequests.length} of {allRequests.length} results
                            </p>
                        </div>
                    </div>

                    {/* ASSISTANT SECTION */}
                    <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 mt-6">
                        <div className="rounded-2xl bg-[var(--bhn-neutral-950)] p-5 text-[var(--bhn-text-on-brand)]">
                            <h2 className="text-2xl font-semibold mb-3">Refund Policy Assistant</h2>
                            <p className="text-sm text-[var(--bhn-neutral-400)] leading-7 max-w-[620px]">
                                Our AI analyzed your recent returns. 65% of "Damaged" claims are for the Fragile Ceramics category. Consider upgrading your packaging material.
                            </p>
                            <button className="mt-6 bhn-btn bhn-btn-secondary">
                                Improve Packaging Guidelines
                            </button>
                        </div>

                        <div className="bg-[var(--bhn-neutral-50)] rounded-2xl p-4">
                            <h2 className="text-2xl font-semibold text-[var(--bhn-text)] mb-5">Quick Support</h2>
                            <div className="space-y-5">
                                <div className="flex gap-3">
                                    <span>📖</span>
                                    <div>
                                        <p className="font-medium text-sm">Return Guidelines</p>
                                        <p className="text-xs text-[var(--bhn-text-muted)] mt-1">Updated for Festive Season</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span>💳</span>
                                    <div>
                                        <p className="font-medium text-sm">Payout Cycles</p>
                                        <p className="text-xs text-[var(--bhn-text-muted)] mt-1">Refund settlement timelines</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}