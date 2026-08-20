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
            // Optionally show a non-blocking alert in dev; in production keep quiet
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
        <div className="flex min-h-screen bg-[#F8F5F2]">
            <Sidebar />

            <div className="flex-1 w-full overflow-hidden">
                <div className="p-4 sm:p-6 min-h-screen">
                    <SellerHeader />

                    {/* HEADING */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
                        <div className="w-full">
                            <h1 className="text-[28px] sm:text-[34px] lg:text-[40px] font-serif font-semibold text-[#2D201B] leading-tight">
                                Returns & Refunds
                            </h1>
                            <p className="text-gray-500 text-sm sm:text-[15px] mt-2 max-w-[620px] leading-6">
                                Manage your post-purchase workflows. Review return requests, process refunds, and track customer satisfaction trends.
                            </p>
                        </div>

                        {/* RIGHT ACTION BUTTONS */}
                        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button className="h-[42px] px-5 rounded-lg border border-[#E7DDD5] bg-white text-sm font-medium text-[#5B463B] hover:bg-[#F8F5F2] transition shadow-sm">
                                Orders
                            </button>
                            <button className="h-[42px] px-5 rounded-lg border border-[#E7DDD5] bg-white text-sm font-medium text-[#5B463B] hover:bg-[#F8F5F2] transition shadow-sm">
                                Shipping
                            </button>
                            <button className="h-[42px] px-5 rounded-lg bg-[#8B4A2F] text-white text-sm font-medium hover:bg-[#6E3B25] transition shadow-sm">
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
                                subColor: "text-gray-500",
                            },
                            {
                                title: "PENDING APPROVALS",
                                value: String(summary.pending),
                                sub: "Requires immediate action",
                                subColor: "text-orange-500",
                            },
                            {
                                title: "APPROVED RETURNS",
                                value: String(summary.approved),
                                sub: "Approved by seller",
                                subColor: "text-gray-400",
                            },
                            {
                                title: "REJECTED",
                                value: String(summary.rejected),
                                sub: "Policy non-compliance",
                                subColor: "text-gray-400",
                            },
                            {
                                title: "REFUNDED AMOUNT",
                                value: `₹${summary.refundedAmount.toLocaleString("en-IN")}`,
                                sub: "YTD financial impact",
                                subColor: "text-gray-400",
                                bg: "bg-[#F6E8DF]",
                            },
                        ].map((item, i) => (
                            <div key={i} className={`${item.bg || "bg-white"} rounded-2xl p-5 border border-[#EEE6DF]`}>
                                <p className="text-[11px] text-gray-400 tracking-wide">{item.title}</p>
                                <h2 className="text-[28px] font-semibold text-[#2D201B] mt-2">{item.value}</h2>
                                <p className={`text-xs mt-2 ${item.subColor}`}>{item.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* FILTERS */}
                    <div className="bg-[#F6EBDD] rounded-2xl p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                            <div className="flex items-center bg-white border rounded-lg px-4">
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
                                className="bg-white border rounded-lg px-4 py-3 text-sm outline-none"
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
                                className="bg-white border rounded-lg px-4 py-3 text-sm outline-none"
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
                                className="bg-white border rounded-lg px-4 py-3 text-sm outline-none"
                            />

                            <button onClick={clearFilters} className="bg-white border rounded-lg px-4 py-3 text-sm hover:bg-gray-50">
                                Clear Filters
                            </button>

                            <button onClick={loadReturns} className="bg-[#8B4A2F] text-white rounded-lg px-4 py-3 text-sm hover:bg-[#6d3a25]">
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* TABLE CONTAINER */}
                    <div className="bg-white rounded-2xl border border-[#EEE6DF] overflow-hidden">
                        {/* TOP BAR */}
                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 px-4 sm:px-6 py-5 border-b border-[#F1E7DF]">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <h2 className="text-sm font-semibold text-[#2D201B]">Request Queue</h2>
                                <span className="w-fit text-xs bg-[#FFE5D6] text-[#D26B2E] px-3 py-1 rounded-full font-medium">
                                    {summary.pending} Actions Required
                                </span>
                            </div>

                            {/* BULK ACTIONS & EXPORT */}
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => handleBulkAction("Approved")}
                                    disabled={selectedRows.length === 0}
                                    className="h-[38px] px-4 rounded-lg border border-[#E8DDD4] bg-white text-sm font-medium text-gray-600 hover:bg-[#F8F5F2] disabled:opacity-50 transition"
                                >
                                    ✔ Bulk Approve ({selectedRows.length})
                                </button>

                                <button
                                    onClick={() => handleBulkAction("Rejected")}
                                    disabled={selectedRows.length === 0}
                                    className="h-[38px] px-4 rounded-lg border border-[#E8DDD4] bg-white text-sm font-medium text-gray-600 hover:bg-[#F8F5F2] disabled:opacity-50 transition"
                                >
                                    ✖ Bulk Reject ({selectedRows.length})
                                </button>

                                <button
                                    onClick={exportCSV}
                                    className="h-[38px] px-4 rounded-lg bg-[#8B4A2F] text-white text-sm font-medium hover:bg-[#6E3B25] transition"
                                >
                                    ⬇ Export CSV
                                </button>
                            </div>
                        </div>

                        {/* MOBILE CARDS */}
                        <div className="block lg:hidden">
                            {loading ? (
                                <p className="p-5 text-center text-sm text-gray-400">Loading requests...</p>
                            ) : filteredRequests.length === 0 ? (
                                <p className="p-5 text-center text-sm text-gray-400">No requests found</p>
                            ) : (
                                filteredRequests.map((item) => (
                                    <div key={item.id} className="p-4 border-b border-[#F2EAE4]">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-[#8B4A2F]">#RET-{item.id}</p>
                                                <h3 className="font-semibold text-[#2D201B] mt-1">{item.name}</h3>
                                                <p className="text-xs text-gray-400 mt-1">Order: {item.order}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(item.id)}
                                                onChange={() => handleSelect(item.id)}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-sm text-gray-700 leading-6">{item.product}</p>
                                            <p className="text-xs text-gray-400 mt-1">SKU: {item.sku}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 mt-4">
                                            <span className="text-[10px] px-2 py-1 rounded font-semibold bg-gray-100 text-gray-700">
                                                {item.type}
                                            </span>
                                            <span className="text-xs px-3 py-1 rounded-full font-medium bg-orange-100 text-orange-600">
                                                ● {item.status}
                                            </span>
                                        </div>

                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500">Reason: "{item.reason}"</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div>
                                                <p className="text-sm font-semibold text-[#2D201B]">{item.amount}</p>
                                                <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                                            </div>

                                            {item.status === "Pending" && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => updateReturnStatus(item.id, "Approved")}
                                                        className="px-2 py-1 bg-[#8B4A2F] text-white rounded text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => updateReturnStatus(item.id, "Rejected")}
                                                        className="px-2 py-1 border text-[#8B4A2F] rounded text-xs"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F7F3EF]">
                                    <tr className="text-[11px] uppercase tracking-wide text-gray-400">
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
                                            <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-400">
                                                Loading requests...
                                            </td>
                                        </tr>
                                    ) : filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-400">
                                                No returns match your filter criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((item) => (
                                            <tr key={item.id} className="border-t hover:bg-[#FCFAF8] transition">
                                                <td className="px-6 py-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(item.id)}
                                                        onChange={() => handleSelect(item.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-[#8B4A2F] font-medium">
                                                    #RET-{item.id}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="font-medium text-[#2D201B]">{item.name}</div>
                                                    <div className="text-xs text-gray-400 mt-1">Order: {item.order}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-sm text-gray-700">{item.product}</div>
                                                    <div className="text-xs text-gray-400 mt-1">SKU: {item.sku}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[10px] px-2 py-1 rounded font-semibold bg-gray-100 text-gray-700">
                                                        {item.type}
                                                    </span>
                                                    <div className="text-xs text-gray-400 mt-2">"{item.reason}"</div>
                                                </td>
                                                <td className="px-6 py-5 font-medium whitespace-nowrap">{item.amount}</td>
                                                <td className="px-6 py-5 whitespace-nowrap text-gray-500">{item.date}</td>
                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`text-xs px-3 py-1 rounded-full font-medium inline-flex items-center gap-2 ${
                                                            item.status === "Pending"
                                                                ? "bg-orange-100 text-orange-600"
                                                                : item.status === "Approved"
                                                                ? "bg-blue-100 text-blue-600"
                                                                : item.status === "Refunded"
                                                                ? "bg-green-100 text-green-600"
                                                                : "bg-red-100 text-red-600"
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
                                                                className="rounded-md bg-[#8B4A2F] px-2 py-1 text-xs text-white hover:bg-[#6E3B25]"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => updateReturnStatus(item.id, "Rejected")}
                                                                className="rounded-md border border-[#8B4A2F] px-2 py-1 text-xs text-[#8B4A2F] hover:bg-[#F8F5F2]"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : item.status === "Approved" ? (
                                                        <button
                                                            onClick={() => updateReturnStatus(item.id, "Refunded")}
                                                            className="rounded-md border border-[#8B4A2F] px-2 py-1 text-xs text-[#8B4A2F] hover:bg-[#F8F5F2]"
                                                        >
                                                            Mark Refunded
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* FOOTER */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-t text-sm text-gray-500">
                            <p className="text-center sm:text-left">
                                Showing 1–{filteredRequests.length} of {allRequests.length} results
                            </p>
                        </div>
                    </div>

                    {/* ASSISTANT SECTION */}
                    <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 mt-6">
                        <div className="rounded-2xl bg-gradient-to-r from-black to-[#35180F] p-5 text-white">
                            <h2 className="text-2xl font-semibold mb-3">Refund Policy Assistant</h2>
                            <p className="text-sm text-gray-300 leading-7 max-w-[620px]">
                                Our AI analyzed your recent returns. 65% of "Damaged" claims are for the Fragile Ceramics category. Consider upgrading your packaging material.
                            </p>
                            <button className="mt-6 bg-white text-black px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-200">
                                Improve Packaging Guidelines
                            </button>
                        </div>

                        <div className="bg-[#F3E8DF] rounded-2xl p-4">
                            <h2 className="text-2xl font-semibold text-[#2D201B] mb-5">Quick Support</h2>
                            <div className="space-y-5">
                                <div className="flex gap-3">
                                    <span>📖</span>
                                    <div>
                                        <p className="font-medium text-sm">Return Guidelines</p>
                                        <p className="text-xs text-gray-500 mt-1">Updated for Festive Season</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span>💳</span>
                                    <div>
                                        <p className="font-medium text-sm">Payout Cycles</p>
                                        <p className="text-xs text-gray-500 mt-1">Refund settlement timelines</p>
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