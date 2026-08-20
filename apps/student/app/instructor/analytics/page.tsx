"use client";

import InstructorHeader from "@/components/common/CourseHeader";
import {
    MoreHorizontal,
    TrendingUp,
    Star,
    Clock3,
    CircleDollarSign,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetInstructorOverviewQuery } from "@/app/redux/instructor-services/DashboardApi";
import AcademyLogo from "@/components/common/AcademyLogo";
import { StatCard } from "@bandhan/ui";

export default function AnalyticsPage() {
    const router = useRouter();
    const [selected, setSelected] = useState("7 days");
    const { data } = useGetInstructorOverviewQuery();
    const overview = data?.data?.overview;
    const [pageData, setPageData] = useState<any>({});

    useEffect(() => {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://bandhan-backend-gykw.onrender.com/api";
        fetch(`${apiBase}/instructor/page-resources`)
            .then(res => res.json())
            .then(json => { if (json?.success && json?.data) setPageData(json.data); })
            .catch(() => {});
    }, []);

    const pd = pageData;

    return (
        <div className="min-h-screen bg-[var(--bhn-bg)]">

            {/* HEADER */}
            <InstructorHeader />

            <div className="px-4 sm:px-6 lg:px-6 py-6">

                {/* TOP FILTER */}
                <div className="bg-[var(--bhn-surface-2)] border border-[var(--bhn-border)] rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    {/* LEFT */}
                    <div className="flex flex-wrap gap-3">

                        <select className="bhn-select h-[42px] px-4 w-auto min-w-[220px]">
                            {(data?.data?.courses || []).map((course: any) => (
                                <option key={course._id} value={course._id}>{course.title}</option>
                            ))}
                        </select>

                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-wrap gap-2">

                        {["7 days", "30 days", "3 months"].map((item) => (

                            <button
                                key={item}
                                onClick={() => setSelected(item)}
                                className={`bhn-chip ${selected === item ? "bhn-chip-active" : ""}`}
                            >
                                {item}
                            </button>

                        ))}

                    </div>

                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">

                    {[
                        {
                            title: "TOTAL ENROLLMENTS",
                            value: Number(overview?.totalStudents ?? 0).toLocaleString("en-IN"),
                            sub: "+12%",
                            icon: TrendingUp,
                        },
                        {
                            title: "REVENUE GENERATED",
                            value: `₹${Number(overview?.totalRevenue ?? 0).toLocaleString("en-IN")}`,
                            sub: "Net earnings this month",
                            icon: CircleDollarSign,
                        },
                        {
                            title: "COMPLETION RATE",
                            value: `${overview?.completionRate ?? 0}%`,
                            sub: "Global avg +12%",
                            icon: Clock3,
                        },
                        {
                            title: "AVG RATING",
                            value: Number(overview?.averageRating ?? 0).toFixed(1),
                            sub: `From ${overview?.totalReviews ?? 0} reviews`,
                            icon: Star,
                        },
                    ].map((card, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-2"
                        >
                            <StatCard
                                label={card.title}
                                value={card.value}
                                icon={<card.icon size={18} />}
                                accent
                            />
                            <p className="text-xs px-1 text-[var(--bhn-text-soft)]">
                                {card.sub}
                            </p>
                        </div>
                    ))}

                        </div>

                {/* GRAPH + REVENUE */}
                <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mt-6">

                    {/* LEFT */}
                    <div className="bhn-card p-4">

                        <div className="flex items-center justify-between">
                            <h2 className="text-[22px] font-serif text-[#2D201B] dark:text-[#ededed]">
                                Enrollment Trend
                            </h2>

                            <MoreHorizontal
                                size={22}
                                className="text-[#7B6A61] dark:text-[#b89b7d]"
                            />
                        </div>

                        <div className="mt-4 h-[250px] relative">

                            {/* GRAPH */}
                            <svg
                                viewBox="0 0 700 250"
                                preserveAspectRatio="none"
                                className="w-full h-full"
                            >

                                {/* CURVE */}
                                <path
                                    d="
                                      M20 190
                                      C90 160, 140 130, 220 140
                                      C300 150, 360 125, 430 85
                                      C500 45, 580 40, 680 80
                                      "
                                    fill="none"
                                    stroke="#8B4A28"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />

                            </svg>

                            {/* LABELS */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[11px] text-[#8B7B70] dark:text-[#7a6a5a] px-1">
                                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                                    (day) => (
                                        <span key={day}>{day}</span>
                                    )
                                )}
                            </div>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="bhn-card p-4">

                        <div className="flex items-center justify-between">

                            <h2 className="text-[22px] font-serif text-[#2D201B] dark:text-[#ededed]">
                                Weekly Revenue
                            </h2>

                            <p className="text-[11px] uppercase tracking-[2px] text-[#8A7A71] dark:text-[#7a6a5a]">
                                Total: {pd.totalRevenueFormatted || "₹0k"}
                            </p>

                        </div>

                        <div className="flex items-end justify-between h-[260px] mt-6">

                            {(pd.weeklyRevenue?.values || [0, 0, 0, 0, 0, 0]).map((height: number, i: number) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center gap-3"
                                >

                                    <div
                                        className="w-8 sm:w-10 rounded-t-xl bg-[#ECA476] dark:bg-[#2a2018]"
                                        style={{
                                            height: `${height * 2}px`,
                                        }}
                                    />

                                    <p className="text-[11px] text-[#8B7B70] dark:text-[#7a6a5a]">
                                        WK {i + 1}
                                    </p>

                                </div>
                            ))}

                        </div>

                    </div>

                </div>

                {/* LOWER GRID */}
                {/* AVG WATCH TIME + DROP-OFF RATE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">

                    {/* AVG WATCH TIME */}
                    <div className="bhn-card p-4">
                        <h3 className="text-[22px] font-semibold text-[#2D201B] dark:text-[#ededed] mb-2 font-serif">
                            Avg Watch Time
                        </h3>

                        <p className="text-[14px] text-[#9B8B82] dark:text-[#7a6a5a] leading-[18px]">
                            Course content retention and student focus span.
                        </p>

                        <div className="flex items-end justify-between mt-4">

                            {/* LEFT CONTENT */}
                            <div>
                                <div className="flex items-end gap-1">
                                    <h2 className="text-[52px] leading-none font-semibold text-[#8A4A26] dark:text-[#c9a882]">
                                        {pd.watchTime ?? 0}
                                    </h2>

                                    <span className="text-[18px] mb-1 text-[#6A5B53] dark:text-[#b89b7d]">
                                        min
                                    </span>

                                    <span className="text-[13px] text-green-600 mb-1">
                                        {pd.watchTimeChange ?? "+0m"}
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT GRAPH */}
                            <div className="flex items-end gap-[5px] h-[90px]">
                                {(pd.watchTimeDistribution || [0, 0, 0, 0, 0, 0]).map((h: number, i: number) => (
                                    <div
                                        key={i}
                                        className={`
                                         w-[14px]
                                        rounded-t-md
                                       ${i === 5
                                                ? "bg-[#8A4A26] dark:bg-[#b86a3a]"
                                                : "bg-[#EADFD7] dark:bg-[#2a2a2a]"
                                            }
                                        `}
                                        style={{ height: `${h}px` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DROP-OFF RATE */}
                    <div className="bhn-card p-4">

                        <h3 className="text-[22px] font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">
                            Drop-off Rate
                        </h3>

                        <p className="text-[14px] text-[#9B8B82] dark:text-[#7a6a5a] mt-2">
                            Percentage of users leaving after first 5 lessons.
                        </p>

                        {/* MAIN PROGRESS */}
                        <div className="mt-4">

                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[12px] text-[#8B7A70] dark:text-[#7a6a5a]">
                                    High Drop
                                </span>

                                <span className="text-[12px] text-[#8B7A70] dark:text-[#7a6a5a]">
                                    Low Drop
                                </span>
                            </div>

                            <div className="w-full h-[10px] rounded-full bg-[#F1E7E1] dark:bg-[#1a1a1a] overflow-hidden">
                                <div className="h-full bg-[#8A4A26] dark:bg-[#b86a3a] rounded-full" style={{width: `${pd.dropOffRate ?? 0}%`}} />
                            </div>
                        </div>

                        {/* WARNING BOX */}
                        <div className="mt-7 bg-[#FBF5F1] dark:bg-[#1a1a1a] border border-[#F0E3DB] dark:border-[#374151] rounded-xl p-4 flex items-start gap-3">

                            <div className="w-5 h-5 rounded-full border border-[#C7A999] dark:border-[#374151] flex items-center justify-center text-[11px] text-[#8A4A26] dark:text-[#c9a882] mt-[2px]">
                                !
                            </div>

                            <div>
                                <p className="text-[13px] text-[#6D5A50] dark:text-[#b89b7d] font-medium">
                                    {pd.dropOffLesson || "No significant drop-off detected"}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>



                {/* TOP LESSONS + STUDENT SEGMENT */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-4 mt-6">

                    {/* TOP PERFORMING LESSONS */}
                    <div className="bhn-card p-4 sm:p-4">

                        {/* HEADER */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

                            <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">
                                Top Performing Lessons
                            </h3>

                            <button onClick={() => alert("View all lessons - coming soon")} className="text-[13px] text-[#8A4A26] dark:text-[#c9a882] font-medium hover:underline self-start sm:self-auto">
                                Give All
                            </button>

                        </div>

                        {/* TABULAR DATA */}
                        <div className="bhn-table-wrap mt-4">

                            <table className="bhn-table">

                                <thead>
                                    <tr>
                                        <th>Lessons</th>
                                        <th>Watch</th>
                                        <th>Completion</th>
                                        <th>Avg Result</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {(pd.topLessons || []).length > 0 ? pd.topLessons.map((item: any, i: number) => (
                                        <tr key={i}>
                                            <td className="font-medium max-w-[280px]">
                                                {item.title}
                                            </td>
                                            <td>{item.watch}</td>
                                            <td>{item.complete}</td>
                                            <td>{item.result}</td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => router.push(`/instructor/analytics/lesson/${item._id || i}`)}
                                                    className="text-[var(--bhn-brand-700)] text-[13px] font-medium hover:underline whitespace-nowrap"
                                                >
                                                    View details
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="text-center text-[var(--bhn-text-soft)]">
                                                No lesson data available yet.
                                            </td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* STUDENT SEGMENT */}
                    <div className="bhn-card p-4">

                        <h3 className="text-[22px] font-semibold text-[#2D201B] dark:text-[#ededed] mb-6 font-serif">
                            Student Segment
                        </h3>

                        {/* DONUT */}
                        <div className="relative w-[170px] h-[170px] mx-auto">

                            <div
                                className="w-full h-full rounded-full"
                                style={{
                                    background: `conic-gradient(
            #8A4A26 0% ${pd.studentSegments?.active ?? 0}%,
            #E9A56D ${pd.studentSegments?.active ?? 0}% ${(pd.studentSegments?.active ?? 0) + (pd.studentSegments?.stalled ?? 0)}%,
            #EFE3DB ${(pd.studentSegments?.active ?? 0) + (pd.studentSegments?.stalled ?? 0)}% 100%
          )`,
                                }}
                            />

                            <div className="absolute inset-[18px] bg-white rounded-full flex flex-col items-center justify-center">
                                <h2 className="text-[32px] font-semibold text-[#2D201B] dark:text-[#ededed]">
                                    {pd.studentSegments?.total ? `${(pd.studentSegments.total / 1000).toFixed(1)}k` : "0"}
                                </h2>

                                <p className="text-[12px] text-[#8B7A70] dark:text-[#7a6a5a]">
                                    Students
                                </p>
                            </div>
                        </div>

                        {/* LEGENDS */}
                        <div className="mt-4 space-y-4">

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#8A4A26] dark:bg-[#b86a3a]" />
                                    <span className="text-[14px] text-[#6D5A50] dark:text-[#b89b7d]">
                                        Completed
                                    </span>
                                </div>

                                <span className="text-[14px] font-medium text-[#2D201B] dark:text-[#ededed]">
                                    {pd.studentSegments?.active ?? 0}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#E9A56D] dark:bg-[#2a2018]" />
                                    <span className="text-[14px] text-[#6D5A50] dark:text-[#b89b7d]">
                                        In Progress
                                    </span>
                                </div>

                                <span className="text-[14px] font-medium text-[#2D201B] dark:text-[#ededed]">
                                    {pd.studentSegments?.stalled ?? 0}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#EFE3DB] dark:bg-[#2a2a2a]" />
                                    <span className="text-[14px] text-[#6D5A50] dark:text-[#b89b7d]">
                                        Inactive
                                    </span>
                                </div>

                                <span className="text-[14px] font-medium text-[#2D201B] dark:text-[#ededed]">
                                    {pd.studentSegments?.completed ?? 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <div className="mt-16 border-t border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] px-6 lg:px-6 py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                <AcademyLogo className="h-7 w-auto object-contain" />

                <div className="flex flex-wrap gap-4 text-sm text-[var(--bhn-text-muted)]">
                    <p onClick={() => router.push("/privacy-policy")} className="cursor-pointer hover:text-[var(--bhn-brand-700)]">Privacy Policy</p>
                    <p onClick={() => router.push("/support")} className="cursor-pointer hover:text-[var(--bhn-brand-700)]">Support Center</p>
                    <p onClick={() => router.push("/instructor")} className="cursor-pointer hover:text-[var(--bhn-brand-700)]">Instructor Portal</p>
                </div>

                <p className="text-sm text-[var(--bhn-text-soft)]">
                    © 2025. All rights reserved.
                </p>

            </div>

        </div>
    );
}
