"use client";

import InstructorHeader from "@/components/common/CourseHeader";
import { useMemo, useState } from "react";
import {
    Landmark,
    CalendarDays,
    ReceiptText,
    Pencil,
    RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { centralAppUrl } from "@/lib/session";
import {
    useGetInstructorEarningsQuery,
    useGetInstructorPageResourcesQuery,
} from "@/app/redux/instructor-services/DashboardApi";
import AcademyLogo from "@/components/common/AcademyLogo";

type ChartRow = { month: string; value: number };
type CourseRow = { courseId: string; title: string; enrollments: number };

function csvCell(value: unknown) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function EarningsDashboard() {
    const [selected, setSelected] = useState("Latest month");
    const { data: earningsData, isLoading, isFetching, isError, refetch } = useGetInstructorEarningsQuery();
    const { data: resourcesData } = useGetInstructorPageResourcesQuery();

    const earnings = earningsData?.earnings ?? {};
    const pd = resourcesData?.data ?? {};
    const chartRows: ChartRow[] = useMemo(
        () => Object.entries(earnings.chart ?? {})
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, value]) => ({ month, value: Number(value ?? 0) })),
        [earnings.chart]
    );
    const courseRows: CourseRow[] = earnings.byCourse ?? [];
    const totalCompletedEnrollments = courseRows.reduce((sum, row) => sum + Number(row.enrollments ?? 0), 0);

    const visibleChartRows = selected === "All months"
        ? chartRows
        : selected === "Last 3 months"
            ? chartRows.slice(-3)
            : chartRows.slice(-1);

    const currency = (value: unknown) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
    const maxChartValue = Math.max(...visibleChartRows.map((row) => row.value), 1);
    const chartPoints = visibleChartRows.map((row, index) => ({
        row,
        x: visibleChartRows.length === 1 ? 500 : 40 + (index * 920) / (visibleChartRows.length - 1),
        y: 270 - (row.value / maxChartValue) * 220,
    }));
    const chartPath = chartPoints.length > 0
        ? `M ${chartPoints.map((point) => `${point.x} ${point.y}`).join(" L ")}`
        : "";

    const stats = [
        { title: 'NET EARNINGS', value: currency(earnings.netRevenue), icon: '💳' },
        { title: 'GROSS REVENUE', value: currency(earnings.grossRevenue), icon: '📅' },
        { title: 'PLATFORM FEES', value: currency(earnings.platformFees), icon: '📋' },
        { title: 'PENDING PAYOUT', value: currency(earnings.pendingPayout), icon: '🪙' },
    ];

    const handleDownloadCsv = () => {
        const rows: (string | number)[][] = [
            ["Type", "Label", "Value", "Amount (INR)"],
            ...chartRows.map((row) => ["Revenue by month", row.month, "", row.value]),
            ...courseRows.map((row) => ["Completed enrollments", row.title, row.enrollments, ""]),
        ];

        if (rows.length <= 1) {
            toast.error("There are no earnings rows to download yet.");
            return;
        }

        const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `instructor-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        toast.success("Earnings CSV downloaded.");
    };

    return (
        <div className="min-h-screen w-full bg-[#F6EFEB] dark:bg-[var(--bhn-neutral-900)] text-[#4A3428] dark:text-[var(--bhn-text-soft)] overflow-x-hidden">
            <InstructorHeader />

            {/* FULL WIDTH */}
            <div className="w-full px-3 sm:px-5 lg:px-7 xl:px-5 py-5 sm:py-7">

                {/* TOP SECTION */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
                    <div className="w-full">
                        <p className="text-xs sm:text-sm text-[#9E7D69] dark:text-[var(--bhn-text-soft)] mb-2">
                            Earnings {'>'} Overview
                        </p>

                        <h1 className="text-[25px] sm:text-[34px] lg:text-[40px] font-serif font-semibold mb-2 leading-tight">
                            Earnings Overview
                        </h1>

                        <p className="text-[#8B7364] dark:text-[var(--bhn-text-soft)] text-sm leading-6 max-w-2xl">
                            Track your financial growth and manage your payouts with
                            transparency and ease.
                        </p>
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-1 w-full lg:w-auto">

                        {/* BUTTON */}
                        <button
                            type="button"
                            disabled
                            title="Instructor withdrawals are processed by the admin team; no self-service endpoint is available."
                            className="h-[44px] px-5 rounded-lg bg-[#8B5332] dark:bg-[var(--bhn-brand-400)] hover:bg-[#74452A] dark:hover:bg-[var(--bhn-brand-300)] transition-all flex items-center justify-center gap-2 text-white text-[14px] font-medium shadow-sm w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                        >

                            {/* ICON */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 17V3" />
                                <path d="m6 11 6 6 6-6" />
                                <path d="M19 21H5" />
                            </svg>

                            Withdraw Earnings
                        </button>

                        {/* TEXT */}
                        <p className="text-[11px] sm:text-xs text-[#B0907D] dark:text-[var(--bhn-text-soft)] text-center lg:text-right max-w-xs leading-5">
                            Instructor payouts are managed by the admin team; self-service withdrawal is unavailable.
                        </p>
                    </div>
                </div>

                {isLoading && (
                    <p className="mb-5 text-sm text-[var(--bhn-text-soft)] flex items-center gap-2">
                        <RefreshCw size={15} className="animate-spin" /> Loading earnings...
                    </p>
                )}
                {isError && (
                    <p className="mb-5 text-sm text-[var(--bhn-error-600)] flex items-center gap-3">
                        Unable to load earnings.
                        <button type="button" disabled={isFetching} onClick={() => refetch()} className="underline font-medium disabled:opacity-50">Retry</button>
                    </p>
                )}

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-7">
                    {stats.map((item, index) => (
                        <div
                            key={index}
                            className="bg-[var(--bhn-surface)] border border-[#E8DAD2] dark:border-[var(--bhn-border)] rounded-2xl p-5 shadow-sm w-full"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[#F5E7DF] dark:bg-[var(--bhn-neutral-900)] flex items-center justify-center text-lg mb-4">
                                {item.icon}
                            </div>

                            <p className="text-[10px] sm:text-xs tracking-widest text-[#A88B7B] dark:text-[var(--bhn-text-soft)] mb-2">
                                {item.title}
                            </p>

                            <h2 className="text-2xl sm:text-xl font-semibold text-[#4A3428] dark:text-[var(--bhn-text-soft)] break-words">
                                {item.value}
                            </h2>
                        </div>
                    ))}
                </div>

                {/* CHART */}
                <div className="bg-[var(--bhn-surface)] border border-[#E8DAD2] dark:border-[var(--bhn-border)] rounded-2xl p-4 sm:p-4 mb-7 shadow-sm w-full overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

      <h3 className="text-2xl sm:text-xl font-serif font-semibold">
        Earnings over time
      </h3>

      <div className="flex flex-wrap gap-2 text-xs">

        {["Latest month", "Last 3 months", "All months"].map((item) => (

          <button
            key={item}
            onClick={() => setSelected(item)}
            className={`px-3 py-1 rounded-lg border transition-all duration-300

              ${
                selected === item
                  ? "bg-[#F5E7DF] dark:bg-[var(--bhn-neutral-900)] text-[#7C5542] dark:text-[var(--bhn-text-soft)] border-[#E7D3C7] dark:border-[var(--bhn-border)]"
                  : "border-[#E7D3C7] dark:border-[var(--bhn-border)] text-[#A18678] dark:text-[var(--bhn-text-soft)] hover:border-[#8B4A28]"
              }
            `}
          >
            {item}
          </button>

        ))}

      </div>

    </div>

                    <div className="relative h-[220px] sm:h-[280px] lg:h-[320px] w-full">
                        <svg
                            viewBox="0 0 1000 300"
                            className="w-full h-full"
                            fill="none"
                            preserveAspectRatio="none"
                        >
                            {chartPath ? (
                                <>
                                    <path
                                        d={chartPath}
                                        stroke="var(--bhn-brand-400)"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    {chartPoints.map((point) => (
                                        <circle
                                            key={point.row.month}
                                            cx={point.x}
                                            cy={point.y}
                                            r="7"
                                            fill="var(--bhn-surface)"
                                            stroke="var(--bhn-brand-600)"
                                            strokeWidth="4"
                                        />
                                    ))}
                                </>
                            ) : (
                                <text x="500" y="150" textAnchor="middle" fill="var(--bhn-text-soft)" fontSize="24">
                                    No earnings data available yet
                                </text>
                            )}
                        </svg>

                        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] sm:text-xs text-[#A28777] dark:text-[var(--bhn-text-soft)] px-1 sm:px-2">
                            {visibleChartRows.length > 0 ? visibleChartRows.map((row) => (
                                <span key={row.month}>{row.month}</span>
                            )) : <span>No monthly totals</span>}
                        </div>
                    </div>
                </div>

                {/* MIDDLE */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">

                    {/* COURSE TABLE */}
                    <div className="xl:col-span-2 bg-[var(--bhn-surface)] border border-[#E8DAD2] dark:border-[var(--bhn-border)] rounded-2xl p-4 sm:p-4 shadow-sm w-full">
                        <h3 className="text-[22px] sm:text-2xl font-serif font-semibold mb-5">
                            Course-wise Earnings
                        </h3>

                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--bhn-border)] dark:border-[var(--bhn-border)] text-left text-[#A08676] dark:text-[var(--bhn-text-soft)] uppercase text-[10px] tracking-wider">
                                        <th className="pb-4 font-medium text-[12px]">Course Name</th>
                                        <th className="pb-4 font-medium text-[12px]">Completed Enrollments</th>
                                        <th className="pb-4 font-medium text-[12px]">Share</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {courseRows.length > 0 ? courseRows.map((item) => (
                                        <tr
                                            key={item.courseId}
                                            className="border-b border-[#F3E7DF] dark:border-[var(--bhn-border)] last:border-none"
                                        >
                                            <td className="py-5 text-[#4A3428] dark:text-[var(--bhn-text-soft)] font-medium text-[17px]">
                                                {item.title}
                                            </td>

                                            <td className="py-5 text-[#7B6557] dark:text-[var(--bhn-text-soft)] text-[15px]">
                                                {Number(item.enrollments ?? 0).toLocaleString("en-IN")}
                                            </td>

                                            <td className="py-5 font-semibold text-[#4A3428] dark:text-[var(--bhn-text-soft)] text-[15px]">
                                                {totalCompletedEnrollments > 0
                                                    ? `${Math.round((Number(item.enrollments ?? 0) / totalCompletedEnrollments) * 100)}%`
                                                    : "—"}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="py-6 text-center text-[var(--bhn-text-soft)]">
                                                No course earnings data available yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARDS */}
                        <div className="md:hidden space-y-4">
                            {courseRows.length > 0 ? courseRows.map((item) => (
                                <div
                                    key={item.courseId}
                                    className="border border-[var(--bhn-border)] dark:border-[var(--bhn-border)] rounded-xl p-4 bg-[var(--bhn-surface-2)] dark:bg-[var(--bhn-neutral-900)]"
                                >
                                    <h4 className="text-[15px] font-semibold text-[#4A3428] dark:text-[var(--bhn-text-soft)] mb-4 leading-6">
                                        {item.title}
                                    </h4>

                                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-[#A08676] dark:text-[var(--bhn-text-soft)] mb-1">
                                                Completed Enrollments
                                            </p>

                                            <h5 className="font-medium text-[#4A3428] dark:text-[var(--bhn-text-soft)]">
                                                {Number(item.enrollments ?? 0).toLocaleString("en-IN")}
                                            </h5>
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-[#A08676] dark:text-[var(--bhn-text-soft)] mb-1">
                                                Share
                                            </p>

                                            <h5 className="font-semibold text-[#4A3428] dark:text-[var(--bhn-text-soft)]">
                                                {totalCompletedEnrollments > 0
                                                    ? `${Math.round((Number(item.enrollments ?? 0) / totalCompletedEnrollments) * 100)}%`
                                                    : "—"}
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-[var(--bhn-text-soft)]">No course earnings data available yet.</p>
                            )}
                        </div>
                    </div>

                    {/* PAYOUT */}
                    <div className="space-y-5 w-full">

                        <div className="bg-[var(--bhn-surface)] border border-[#E8DAD2] dark:border-[var(--bhn-border)] rounded-2xl p-5 sm:p-4 shadow-sm">
                            <h3 className="text-[24px] sm:text-2xl font-serif font-semibold mb-5">
                                Payment Information
                            </h3>

                            <div className="space-y-6">

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-[#7E6A5F] dark:text-[var(--bhn-text-soft)] shrink-0">
                                        <Landmark size={18} strokeWidth={1.8} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#9D8578] dark:text-[var(--bhn-text-soft)] mb-1 font-medium">
                                            Bank Account
                                        </p>

                                        <h4 className="text-[15px] sm:text-[16px] font-medium text-[#3F2C24] dark:text-[var(--bhn-neutral-400)] break-words">
                                            {pd.bankAccount?.bank && pd.bankAccount?.lastFour
                                                ? `${pd.bankAccount.bank} •••• ${pd.bankAccount.lastFour}`
                                                : "No bank account on file"}
                                        </h4>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-[#7E6A5F] dark:text-[var(--bhn-text-soft)] shrink-0">
                                        <CalendarDays size={18} strokeWidth={1.8} />
                                    </div>

                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#9D8578] dark:text-[var(--bhn-text-soft)] mb-1 font-medium">
                                            Next Payout Date
                                        </p>

                                        <h4 className="text-[15px] sm:text-[16px] font-medium text-[#3F2C24] dark:text-[var(--bhn-neutral-400)]">
                                            {pd.nextPayout || "No payout scheduled"}
                                        </h4>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-[#7E6A5F] dark:text-[var(--bhn-text-soft)] shrink-0">
                                        <ReceiptText size={18} strokeWidth={1.8} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#9D8578] dark:text-[var(--bhn-text-soft)] mb-1 font-medium">
                                            Platform Fee
                                        </p>

                                        <h4 className="text-[14px] sm:text-[15px] font-medium text-[#3F2C24] dark:text-[var(--bhn-neutral-400)] break-words">
                                            {pd.platformFee ? `${pd.platformFee}% Platform Fee applies` : "Platform fee not available"}
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled
                                title="Payout methods are managed by the admin team; no self-service endpoint is available."
                                className="mt-7 w-full h-[50px] border border-[#B99A89] dark:border-[var(--bhn-border)] rounded-xl flex items-center justify-center gap-2 text-[var(--bhn-brand-700)] dark:text-[var(--bhn-text-soft)] text-sm font-medium hover:bg-[var(--bhn-surface-2)] dark:hover:bg-[#171717] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Pencil size={15} />
                                Update Payout Method
                            </button>
                            <p className="mt-3 text-[11px] leading-5 text-[var(--bhn-text-soft)]">
                                Payout method changes are handled by the admin team.
                            </p>
                        </div>

                        <div className="bg-[#F6E7DD] dark:bg-[var(--bhn-neutral-900)] border border-[#E5CFC1] dark:border-[var(--bhn-border)] rounded-2xl px-4 py-4 text-xs sm:text-[13px] leading-6 text-[#81685A] dark:text-[var(--bhn-text-soft)] shadow-sm">
                            *Net earnings reflect completed payments minus recorded platform fees.
                        </div>
                    </div>
                </div>

                {/* TRANSACTIONS */}
                <div className="bg-[var(--bhn-surface)] border border-[#E8DAD2] dark:border-[var(--bhn-border)] rounded-2xl p-4 sm:p-4 shadow-sm mb-4 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-lg sm:text-2xl font-serif font-semibold">
                                Revenue History
                            </h3>
                            <p className="text-xs text-[var(--bhn-text-soft)] mt-1">
                                Monthly totals from the instructor earnings API. Individual transaction rows are not exposed for instructor accounts.
                            </p>
                        </div>

                        <button type="button" onClick={handleDownloadCsv} className="text-sm text-[#8B5E46] dark:text-[var(--bhn-text-soft)] font-medium hover:underline w-fit border border-[#E7D3C7] dark:border-[var(--bhn-border)] bg-[#F5E7DF] dark:bg-[var(--bhn-neutral-900)] px-4 py-2 rounded-lg transition-all">
                            Download CSV
                        </button>
                    </div>

                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--bhn-border)] dark:border-[var(--bhn-border)] text-left text-[#A08676] dark:text-[var(--bhn-text-soft)] uppercase text-[10px] tracking-wider">
                                    <th className="pb-4 font-medium text-[12px]">Month</th>
                                    <th className="pb-4 font-medium text-[12px]">Amount</th>
                                    <th className="pb-4 font-medium text-[12px]">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {chartRows.length > 0 ? chartRows.map((item) => (
                                    <tr
                                        key={item.month}
                                        className="border-b border-[#F3E7DF] dark:border-[var(--bhn-border)] last:border-none"
                                    >
                                        <td className="py-5 text-[#7B6557] dark:text-[var(--bhn-text-soft)] text-[17px]">
                                            {item.month}
                                        </td>

                                        <td className="py-5 font-semibold text-[#4A3428] dark:text-[var(--bhn-text-soft)] text-[17px]">
                                            {currency(item.value)}
                                        </td>

                                        <td className="py-5">
                                            <span className="px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap bg-green-100 text-[var(--bhn-success-700)]">
                                                RECORDED
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="py-6 text-center text-[var(--bhn-text-soft)]">
                                            No revenue history available yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="md:hidden space-y-4">
                        {chartRows.length > 0 ? chartRows.map((item) => (
                            <div
                                key={item.month}
                                className="border border-[var(--bhn-border)] dark:border-[var(--bhn-border)] rounded-xl p-4 bg-[var(--bhn-surface-2)] dark:bg-[var(--bhn-neutral-900)]"
                            >
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <h4 className="text-[15px] font-semibold text-[#4A3428] dark:text-[var(--bhn-text-soft)] leading-6">
                                        {item.month}
                                    </h4>

                                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap bg-green-100 text-[var(--bhn-success-700)]">
                                        RECORDED
                                    </span>
                                </div>

                                <p className="text-[10px] uppercase tracking-wider text-[#A08676] dark:text-[var(--bhn-text-soft)] mb-1">
                                    Amount
                                </p>

                                <h5 className="font-semibold text-[#4A3428] dark:text-[var(--bhn-text-soft)]">
                                    {currency(item.value)}
                                </h5>
                            </div>
                        )) : (
                            <p className="text-sm text-[var(--bhn-text-soft)]">No revenue history available yet.</p>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex flex-col lg:flex-row justify-between gap-5 text-xs text-[#9B8376] dark:text-[var(--bhn-text-soft)] border-t border-[#E8DAD2] dark:border-[var(--bhn-border)] pt-6 pb-4">
                    <div>
                        <AcademyLogo className="h-6 w-auto object-contain mb-2" />

                        <p>
                            © 2024. Empowering education globally.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-5">
                        <a href={centralAppUrl("/terms-of-service")} target="_blank" rel="noreferrer">Instructor Terms</a>
                        <a href={centralAppUrl("/privacy-policy")} target="_blank" rel="noreferrer">Privacy Policy</a>
                        <a href={centralAppUrl("/support")} target="_blank" rel="noreferrer">Help Center</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
