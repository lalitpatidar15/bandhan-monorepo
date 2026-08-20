"use client";

import InstructorHeader from "@/components/common/CourseHeader";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    Search,
    Eye,
    Mail,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Suspense, useState } from "react";
import { useGetInstructorOverviewQuery, useGetInstructorStudentsQuery } from "@/app/redux/instructor-services/DashboardApi";

function StudentsPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [activeFilter, setActiveFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("Recently Active");

    const { data: overviewData } = useGetInstructorOverviewQuery();
    const courseId = searchParams.get("courseId") || overviewData?.data?.courses?.[0]?._id || "";
    const { data: studentsResponse, isLoading } = useGetInstructorStudentsQuery(
        { courseId, page: currentPage },
        { skip: !courseId }
    );
    const pagination = studentsResponse?.data?.pagination;
    const overview = studentsResponse?.data?.overview;
    const students: Array<{
        studentId: string;
        name: string;
        email: string;
        progress: number;
        lessons: string;
        status: string;
        lastActive: string;
        image: string;
    }> = (studentsResponse?.data?.students || []).map((student: any) => ({
        ...student,
        image: student.profileImage || "",
        status: student.status === "completed" ? "Completed" : "In Progress",
        lastActive: student.lastActivity ? new Date(student.lastActivity).toLocaleString() : "No activity",
    }));

    const filteredStudents =
        activeFilter === "All"
            ? students
            : students.filter(
                (student) => student.status === activeFilter
            );

    const totalPages = pagination?.totalPages || 1;
    const totalStudents = pagination?.totalStudents || students.length;
    const startRecord = totalStudents > 0 ? (currentPage - 1) * 10 + 1 : 0;
    const endRecord = Math.min(currentPage * 10, totalStudents);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    const tabs = [
        {
            name: "Overview",
            path: `/instructor/performance${courseId ? `?courseId=${courseId}` : ""}`,
        },
        {
            name: "Students",
            path: `/instructor/performance/student${courseId ? `?courseId=${courseId}` : ""}`,
        },
        {
            name: "Reviews",
            path: `/instructor/performance/review${courseId ? `?courseId=${courseId}` : ""}`,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F3F0]">
            {/* Header */}
            <InstructorHeader />

            <div className="px-4 sm:px-6 lg:px-5 py-5">
                {/* Tabs */}
                <div className="flex items-center gap-4 border-b border-[#E7DED8] mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {tabs.map((tab) => {
                        const active = pathname === tab.path.split("?")[0];

                        return (
                            <button
                                key={tab.name}
                                onClick={() => router.push(tab.path)}
                                className={`pb-3 text-sm sm:text-[15px] transition-all duration-200 ${active
                                    ? "text-[#8A4A26] border-b-2 border-[#8A4A26] font-medium"
                                    : "text-[#7C6C64] hover:text-[#8A4A26]"
                                    }`}
                            >
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-[#EEE5DE] p-5">
                        <p className="text-xs text-[#8A817A] uppercase">
                            Total Students
                        </p>
                        <h2 className="text-xl font-semibold text-[#2D201B] mt-2">
                            {overview?.totalStudents ?? 0}
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl border border-[#EEE5DE] p-5">
                        <p className="text-xs text-[#8A817A] uppercase">
                            Active
                        </p>
                        <h2 className="text-xl font-semibold text-[#8B4A28] mt-2">
                            {overview?.activeStudents ?? 0}
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl border border-[#EEE5DE] p-5">
                        <p className="text-xs text-[#8A817A] uppercase">
                            Completed
                        </p>
                        <h2 className="text-xl font-semibold text-[#2D201B] mt-2">
                            {overview?.completedStudents ?? 0}
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl border border-[#EEE5DE] p-5">
                        <p className="text-xs text-[#8A817A] uppercase">
                            Avg Completion
                        </p>
                        <h2 className="text-xl font-semibold text-[#2D201B] mt-2">
                            {overview?.averageCompletion ?? 0}%
                        </h2>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl border border-[#EEE5DE] overflow-hidden">
                    {isLoading && <p className="p-4 text-sm text-[#7C6C64]">Loading students...</p>}
                    {/* Filters */}
                    <div className="p-4 flex flex-col xl:flex-row xl:items-center gap-4 justify-between border-b border-[#F1E8E2]">
                        {/* Search */}
                        <div className="relative w-full xl:max-w-xs">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89A90]"
                            />

                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 rounded-lg border border-[#E7DED8] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#8A4A26]"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Status Buttons */}
                            <div className="flex items-center border border-[#E7DED8] rounded-lg overflow-hidden flex-wrap">

                                {["All", "In Progress", "Completed"].map((item) => (

                                    <button
                                        key={item}
                                        onClick={() => setActiveFilter(item)}
                                        className={`
                                         px-4
                                         h-10
                                         text-sm
                                         font-medium
                                         transition
                                         whitespace-nowrap
                                         ${activeFilter === item
                                                ? "bg-[#F8F2ED] text-[#8A4A26]"
                                                : "text-[#6D625B] hover:bg-[#FAF6F2]"
                                            }
                                     `}
                                    >
                                        {item}
                                    </button>

                                ))}

                            </div>

                            {/* Progress */}
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-[#6D625B]">Progress:</p>

                                <div className="w-20 sm:w-28 h-1.5 rounded-full bg-[#E6DDD6]">
                                    <div className="w-1/2 h-full rounded-full bg-[#8A4A26]" />
                                </div>

                                <p className="text-sm text-[#6D625B]">0-100%</p>
                            </div>

                            {/* Sort */}
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-10 px-3 rounded-lg border border-[#E7DED8] text-sm text-[#6D625B] outline-none">
                                <option>Recently Active</option>
                                <option>Newest</option>
                                <option>Oldest</option>
                            </select>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#F7EFE8]">
                                <tr className="text-left text-xs text-[#7B6F67] uppercase">
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Progress</th>
                                    <th className="px-6 py-4">Last Active</th>
                                    <th className="px-6 py-4">Lessons</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStudents.map((student, index) => (
                                    <tr
                                        key={index}
                                        className="border-t border-[#F1E8E2]"
                                    >
                                        {/* Student */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={student.image}
                                                    alt=""
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />

                                                <div>
                                                    <p className="text-sm font-medium text-[#2D201B]">
                                                        {student.name}
                                                    </p>

                                                    <p className="text-xs text-[#8A817A]">
                                                        {student.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Progress */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-[#8A4A26]">
                                                    {student.progress}%
                                                </span>

                                                <div className="w-24 h-1.5 rounded-full bg-[#E8DFD8]">
                                                    <div
                                                        className="h-full rounded-full bg-[#8A4A26]"
                                                        style={{
                                                            width: `${student.progress}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Last Active */}
                                        <td className="px-6 py-5 text-sm text-[#6D625B]">
                                            {student.lastActive}
                                        </td>

                                        {/* Lessons */}
                                        <td className="px-6 py-5 text-sm text-[#2D201B]">
                                            {student.lessons}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-5">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === "Completed"
                                                    ? "bg-[#EFE7E1] text-[#8A817A]"
                                                    : "bg-[#F8E8DD] text-[#8A4A26]"
                                                    }`}
                                            >
                                                {student.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-4 text-[#8A817A]">
                                                <Eye
                                                    size={16}
                                                    className="cursor-pointer hover:text-[#8A4A26]"
                                                    onClick={() => alert(`Viewing student: ${student.name}`)}
                                                />

                                                <Mail
                                                    size={16}
                                                    className="cursor-pointer hover:text-[#8A4A26]"
                                                    onClick={() => alert(`Sending email to: ${student.email}`)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden p-4 space-y-4">
                        {filteredStudents.map((student, index) => (
                            <div
                                key={index}
                                className="border border-[#EEE5DE] rounded-xl p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={student.image}
                                        alt=""
                                        className="w-12 h-12 rounded-full object-cover"
                                    />

                                    <div>
                                        <h3 className="font-medium text-[#2D201B]">
                                            {student.name}
                                        </h3>

                                        <p className="text-xs text-[#8A817A]">
                                            {student.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Progress</span>
                                            <span className="text-[#8A4A26] font-medium">
                                                {student.progress}%
                                            </span>
                                        </div>

                                        <div className="w-full h-2 rounded-full bg-[#E8DFD8]">
                                            <div
                                                className="h-full rounded-full bg-[#8A4A26]"
                                                style={{
                                                    width: `${student.progress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8A817A]">
                                            Lessons
                                        </span>

                                        <span>{student.lessons}</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8A817A]">
                                            Last Active
                                        </span>

                                        <span>{student.lastActive}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === "Completed"
                                                ? "bg-[#EFE7E1] text-[#8A817A]"
                                                : "bg-[#F8E8DD] text-[#8A4A26]"
                                                }`}
                                        >
                                            {student.status}
                                        </span>

                                        <div className="flex items-center gap-4 text-[#8A817A]">
                                            <Eye size={18} className="cursor-pointer hover:text-[#8A4A26]" onClick={() => alert(`Viewing student: ${student.name}`)} />
                                            <Mail size={18} className="cursor-pointer hover:text-[#8A4A26]" onClick={() => alert(`Sending email to: ${student.email}`)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-[#F1E8E2]">
                        <p className="text-sm text-[#7C6C64]">
                            Showing {startRecord}-{endRecord} of {totalStudents} students
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage <= 1}
                                className="w-8 h-8 rounded-md border border-[#E7DED8] flex items-center justify-center disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {getPageNumbers().map((page, i) =>
                                typeof page === "string" ? (
                                    <span key={`ellipsis-${i}`} className="px-1 text-[#7C6C64]">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-md text-sm ${
                                            page === currentPage
                                                ? "bg-[#8A4A26] text-white"
                                                : "text-[#7C6C64] hover:bg-[#F4ECE6]"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="w-8 h-8 rounded-md border border-[#E7DED8] flex items-center justify-center disabled:opacity-40"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floating Button */}
                <button onClick={() => alert("Add new student")} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#8A4A26] text-white shadow-lg flex items-center justify-center hover:scale-105 transition">
                    +
                </button>
            </div>
        </div>
    );
}

export default function StudentsPage() {
    return <Suspense fallback={<div className="min-h-screen bg-[#F6F3F0]" />}><StudentsPageContent /></Suspense>;
}
