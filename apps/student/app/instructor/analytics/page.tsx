"use client";

import InstructorHeader from "@/components/common/CourseHeader";
import {
    MoreHorizontal,
    TrendingUp,
    Star,
    Clock3,
    CircleDollarSign,
    RefreshCw,
} from "lucide-react";
import {
    useGetInstructorOverviewQuery,
    useGetInstructorPageResourcesQuery,
    useGetInstructorCourseDashboardQuery,
    type InstructorCourseSummary,
} from "@/app/redux/instructor-services/DashboardApi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { centralAppUrl } from "@/lib/session";
import AcademyLogo from "@/components/common/AcademyLogo";
import { Modal, StatCard } from "@bandhan/ui";

type LessonInsight = {
    _id?: string;
    title?: string;
    watch?: string;
    complete?: string;
    result?: string;
};

export default function AnalyticsPage() {
    const router = useRouter();
    const [selected, setSelected] = useState("7 days");
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [detailRow, setDetailRow] = useState<LessonInsight | null>(null);
    const { data } = useGetInstructorOverviewQuery();
    const { data: resourcesData } = useGetInstructorPageResourcesQuery();

    const courses: InstructorCourseSummary[] = data?.data?.courses ?? [];
    const activeCourseId = selectedCourseId || courses[0]?._id || "";
    const { data: courseDashboardData, isLoading, isFetching, isError, refetch } = useGetInstructorCourseDashboardQuery(activeCourseId, { skip: !activeCourseId });

    const pd = resourcesData?.data ?? {};
    const courseOverview = courseDashboardData?.data?.overview ?? {};
    const enrollmentTrends: Array<{ day?: string; students?: number }> = courseDashboardData?.data?.enrollmentTrends ?? [];
    const visibleTrends = selected === "7 days"
        ? enrollmentTrends.slice(-7)
        : selected === "30 days"
            ? enrollmentTrends.slice(-30)
            : enrollmentTrends;
    const engagement = courseDashboardData?.data?.engagement ?? {};
    const maxTrend = Math.max(...visibleTrends.map((trend) => Number(trend.students ?? 0)), 1);
    const trendPoints = visibleTrends.map((trend, index) => ({
        trend,
        x: visibleTrends.length === 1 ? 350 : 20 + (index * 660) / (visibleTrends.length - 1),
        y: 220 - (Number(trend.students ?? 0) / maxTrend) * 180,
    }));
    const trendPath = trendPoints.length > 0
        ? `M ${trendPoints.map((point) => `${point.x} ${point.y}`).join(" L ")}`
        : "";
    const insightRows: LessonInsight[] = pd.topLessons ?? [];

    return (
        <div className="min-h-screen bg-[var(--bhn-bg)]">

            {/* HEADER */}
            <InstructorHeader />

            <div className="px-4 sm:px-6 lg:px-6 py-6">

                {/* TOP FILTER */}
                <div className="bg-[var(--bhn-surface-2)] border border-[var(--bhn-border)] rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    {/* LEFT */}
                    <div className="flex flex-wrap gap-3">

                        <select
                            className="bhn-select h-[42px] px-4 w-auto min-w-[220px]"
                            value={activeCourseId}
                            onChange={(event) => setSelectedCourseId(event.target.value)}
                            disabled={courses.length === 0}
                        >
                            {courses.length === 0 ? (
                                <option value="">No courses available</option>
                            ) : courses.map((course) => (
                                <option key={course._id} value={course._id}>{course.title}</option>
                            ))}
                        </select>

                        {isLoading && (
                            <p className="text-xs text-[var(--bhn-text-soft)] flex items-center gap-2">
                                <RefreshCw size={14} className="animate-spin" /> Loading course analytics...
                            </p>
                        )}
                        {isError && (
                            <p className="text-xs text-[var(--bhn-error-600)] flex items-center gap-2">
                                Unable to load course analytics.
                                <button type="button" disabled={isFetching} onClick={() => refetch()} className="underline disabled:opacity-50">Retry</button>
                            </p>
                        )}

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
                            value: Number(courseOverview.totalStudents ?? 0).toLocaleString("en-IN"),
                            sub: courseOverview.totalStudentsChange || "Current course",
                            icon: TrendingUp,
                        },
                        {
                            title: "REVENUE GENERATED",
                            value: `₹${Number(courseOverview.totalRevenue ?? 0).toLocaleString("en-IN")}`,
                            sub: courseOverview.totalRevenueChange || "Course revenue",
                            icon: CircleDollarSign,
                        },
                        {
                            title: "COMPLETION RATE",
                            value: `${Number(courseOverview.completionRate ?? 0)}%`,
                            sub: courseOverview.completionRateChange || "Course completion",
                            icon: Clock3,
                        },
                        {
                            title: "AVG RATING",
                            value: Number(courseOverview.averageRating ?? 0).toFixed(1),
                            sub: courseOverview.averageRatingChange || "Course rating",
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
                            <h2 className="text-[22px] font-serif text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)]">
                                Enrollment Trend
                            </h2>

                            <MoreHorizontal
                                size={22}
                                className="text-[#7B6A61] dark:text-[var(--bhn-text-soft)]"
                            />
                        </div>

                        <div className="mt-4 h-[250px] relative">

                            {/* GRAPH */}
                            <svg
                                viewBox="0 0 700 250"
                                preserveAspectRatio="none"
                                className="w-full h-full"
                            >
                                {trendPath ? (
                                    <>
                                        <path
                                            d={trendPath}
                                            fill="none"
                                            stroke="var(--bhn-brand-600)"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        {trendPoints.map((point) => (
                                            <circle
                                                key={`${point.trend.day ?? "trend"}-${point.x}`}
                                                cx={point.x}
                                                cy={point.y}
                                                r="5"
                                                fill="var(--bhn-surface)"
                                                stroke="var(--bhn-brand-600)"
                                                strokeWidth="3"
                                            />
                                        ))}
                                    </>
                                ) : (
                                    <text x="350" y="130" textAnchor="middle" fill="var(--bhn-text-soft)" fontSize="18">
                                        No enrollment trend data available
                                    </text>
                                )}
                            </svg>

                            {/* LABELS */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[11px] text-[#8B7B70] dark:text-[var(--bhn-text-soft)] px-1">
                                {visibleTrends.length > 0 ? visibleTrends.map((trend, index) => (
                                    <span key={`${trend.day ?? index}`}>{trend.day ?? `DAY ${index + 1}`}</span>
                                )) : <span>No trend labels</span>}
                            </div>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="bhn-card p-4">

                        <div className="flex items-center justify-between">

                            <h2 className="text-[22px] font-serif text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)]">
                                Weekly Revenue
                            </h2>

                            <p className="text-[11px] uppercase tracking-[2px] text-[var(--bhn-text-soft)] dark:text-[var(--bhn-text-soft)]">
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
                                        className="w-8 sm:w-10 rounded-t-xl bg-[#ECA476] dark:bg-[var(--bhn-neutral-900)]"
                                        style={{
                                            height: `${height * 2}px`,
                                        }}
                                    />

                                    <p className="text-[11px] text-[#8B7B70] dark:text-[var(--bhn-text-soft)]">
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
                        <h3 className="text-[22px] font-semibold text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)] mb-2 font-serif">
                            Avg Watch Time
                        </h3>

                        <p className="text-[14px] text-[#9B8B82] dark:text-[var(--bhn-text-soft)] leading-[18px]">
                            Course content retention and student focus span.
                        </p>

                        <div className="flex items-end justify-between mt-4">

                            {/* LEFT CONTENT */}
                            <div>
                                <div className="flex items-end gap-1">
                                    <h2 className="text-[52px] leading-none font-semibold text-[var(--bhn-brand-700)] dark:text-[var(--bhn-brand-400)]">
                                        {engagement.averageWatchTime ?? pd.watchTime ?? 0}
                                    </h2>

                                    <span className="text-[18px] mb-1 text-[#6A5B53] dark:text-[var(--bhn-text-soft)]">
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
                                                ? "bg-[var(--bhn-brand-600)] dark:bg-[var(--bhn-brand-400)]"
                                                : "bg-[#EADFD7] dark:bg-[var(--bhn-neutral-900)]"
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

                        <h3 className="text-[22px] font-semibold text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)] font-serif">
                            Drop-off Rate
                        </h3>

                        <p className="text-[14px] text-[#9B8B82] dark:text-[var(--bhn-text-soft)] mt-2">
                            Percentage of users leaving after first 5 lessons.
                        </p>

                        {/* MAIN PROGRESS */}
                        <div className="mt-4">

                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[12px] text-[#8B7A70] dark:text-[var(--bhn-text-soft)]">
                                    High Drop
                                </span>

                                <span className="text-[12px] text-[#8B7A70] dark:text-[var(--bhn-text-soft)]">
                                    Low Drop
                                </span>
                            </div>

                            <div className="w-full h-[10px] rounded-full bg-[#F1E7E1] dark:bg-[var(--bhn-neutral-900)] overflow-hidden">
                                <div className="h-full bg-[var(--bhn-brand-600)] dark:bg-[var(--bhn-brand-400)] rounded-full" style={{width: `${pd.dropOffRate ?? 0}%`}} />
                            </div>
                        </div>

                        {/* WARNING BOX */}
                        <div className="mt-7 bg-[#FBF5F1] dark:bg-[var(--bhn-neutral-900)] border border-[#F0E3DB] dark:border-[var(--bhn-border)] rounded-xl p-4 flex items-start gap-3">

                            <div className="w-5 h-5 rounded-full border border-[#C7A999] dark:border-[var(--bhn-border)] flex items-center justify-center text-[11px] text-[var(--bhn-brand-700)] dark:text-[var(--bhn-brand-400)] mt-[2px]">
                                !
                            </div>

                            <div>
                                <p className="text-[13px] text-[#6D5A50] dark:text-[var(--bhn-text-soft)] font-medium">
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

                            <h3 className="text-[20px] sm:text-[22px] font-semibold text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)] font-serif">
                                Top Performing Lessons
                            </h3>

                            <button
                                type="button"
                                onClick={() => toast("All available lesson insights are listed below.")}
                                className="text-[13px] text-[var(--bhn-brand-700)] dark:text-[var(--bhn-brand-400)] font-medium hover:underline self-start sm:self-auto"
                            >
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

                                    {insightRows.length > 0 ? insightRows.map((item, i) => (
                                        <tr key={item._id || i}>
                                            <td className="font-medium max-w-[280px]">
                                                {item.title}
                                            </td>
                                            <td>{item.watch}</td>
                                            <td>{item.complete}</td>
                                            <td>{item.result}</td>
                                            <td className="text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setDetailRow(item)}
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

                        <h3 className="text-[22px] font-semibold text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)] mb-6 font-serif">
                            Student Segment
                        </h3>

                        {/* DONUT */}
                        <div className="relative w-[170px] h-[170px] mx-auto">

                            <div
                                className="w-full h-full rounded-full"
                                style={{
                                    background: `conic-gradient(
            var(--bhn-brand-600) 0% ${pd.studentSegments?.active ?? 0}%,
            var(--bhn-brand-400) ${pd.studentSegments?.active ?? 0}% ${(pd.studentSegments?.active ?? 0) + (pd.studentSegments?.stalled ?? 0)}%,
            var(--bhn-border) ${(pd.studentSegments?.active ?? 0) + (pd.studentSegments?.stalled ?? 0)}% 100%
          )`,
                                }}
                            />

                            <div className="absolute inset-[18px] bg-[var(--bhn-surface)] rounded-full flex flex-col items-center justify-center">
                                <h2 className="text-[32px] font-semibold text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)]">
                                    {pd.studentSegments?.total ? `${(pd.studentSegments.total / 1000).toFixed(1)}k` : "0"}
                                </h2>

                                <p className="text-[12px] text-[#8B7A70] dark:text-[var(--bhn-text-soft)]">
                                    Students
                                </p>
                            </div>
                        </div>

                        {/* LEGENDS */}
                        <div className="mt-4 space-y-4">

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[var(--bhn-brand-600)] dark:bg-[var(--bhn-brand-400)]" />
                                    <span className="text-[14px] text-[#6D5A50] dark:text-[var(--bhn-text-soft)]">
                                        Completed
                                    </span>
                                </div>

                                <span className="text-[14px] font-medium text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)]">
                                    {pd.studentSegments?.active ?? 0}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#E9A56D] dark:bg-[var(--bhn-neutral-900)]" />
                                    <span className="text-[14px] text-[#6D5A50] dark:text-[var(--bhn-text-soft)]">
                                        In Progress
                                    </span>
                                </div>

                                <span className="text-[14px] font-medium text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)]">
                                    {pd.studentSegments?.stalled ?? 0}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#EFE3DB] dark:bg-[var(--bhn-neutral-900)]" />
                                    <span className="text-[14px] text-[#6D5A50] dark:text-[var(--bhn-text-soft)]">
                                        Inactive
                                    </span>
                                </div>

                                <span className="text-[14px] font-medium text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)]">
                                    {pd.studentSegments?.completed ?? 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COURSE BREAKDOWN */}
                <div className="bhn-card p-4 mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h3 className="text-[22px] font-semibold text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)] font-serif">
                            Course Breakdown
                        </h3>
                        <button
                            type="button"
                            onClick={() => router.push("/instructor/performance")}
                            className="text-[13px] text-[var(--bhn-brand-700)] dark:text-[var(--bhn-brand-400)] font-medium hover:underline self-start sm:self-auto"
                        >
                            View performance
                        </button>
                    </div>

                    <div className="bhn-table-wrap">
                        <table className="bhn-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Category</th>
                                    <th>Students</th>
                                    <th>Rating</th>
                                    <th>Status</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length > 0 ? courses.map((course) => (
                                    <tr key={course._id}>
                                        <td className="font-medium max-w-[280px]">{course.title}</td>
                                        <td>{course.category || "—"}</td>
                                        <td>{Number(course.totalStudents ?? 0).toLocaleString("en-IN")}</td>
                                        <td>{Number(course.rating ?? 0).toFixed(1)}</td>
                                        <td>{course.status || "—"}</td>
                                        <td className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => router.push(`/instructor/performance?courseId=${course._id}`)}
                                                className="text-[var(--bhn-brand-700)] text-[13px] font-medium hover:underline whitespace-nowrap"
                                            >
                                                View details
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="text-center text-[var(--bhn-text-soft)]">
                                            No courses available yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal
                    open={Boolean(detailRow)}
                    onClose={() => setDetailRow(null)}
                    title={detailRow?.title || "Insight details"}
                    size="md"
                >
                    <div className="space-y-4 text-sm">
                        <dl className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-[var(--bhn-surface-3)]">
                                <dt className="text-xs text-[var(--bhn-text-soft)]">Watch</dt>
                                <dd className="font-medium text-[var(--bhn-text)]">{detailRow?.watch || "—"}</dd>
                            </div>
                            <div className="p-3 rounded-lg bg-[var(--bhn-surface-3)]">
                                <dt className="text-xs text-[var(--bhn-text-soft)]">Completion</dt>
                                <dd className="font-medium text-[var(--bhn-brand-700)]">{detailRow?.complete || "—"}</dd>
                            </div>
                            <div className="p-3 rounded-lg bg-[var(--bhn-surface-3)] col-span-2">
                                <dt className="text-xs text-[var(--bhn-text-soft)]">Average result</dt>
                                <dd className="font-medium text-[var(--bhn-text)]">{detailRow?.result || "—"}</dd>
                            </div>
                        </dl>
                        <p className="text-xs text-[var(--bhn-text-soft)]">
                            Insights are generated from learner progress records returned by the instructor API.
                        </p>
                    </div>
                </Modal>

            </div>

            {/* FOOTER */}
            <div className="mt-16 border-t border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] px-6 lg:px-6 py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                <AcademyLogo className="h-7 w-auto object-contain" />

                <div className="flex flex-wrap gap-4 text-sm text-[var(--bhn-text-muted)]">
                    <p onClick={() => window.location.assign(centralAppUrl("/privacy-policy"))} className="cursor-pointer hover:text-[var(--bhn-brand-700)]">Privacy Policy</p>
                    <p onClick={() => window.location.assign(centralAppUrl("/support"))} className="cursor-pointer hover:text-[var(--bhn-brand-700)]">Support Center</p>
                    <p onClick={() => router.push("/instructor/dashboard")} className="cursor-pointer hover:text-[var(--bhn-brand-700)]">Instructor Portal</p>
                </div>

                <p className="text-sm text-[var(--bhn-text-soft)]">
                    © 2025. All rights reserved.
                </p>

            </div>

        </div>
    );
}
