"use client";

import InstructorHeader from "@/components/common/CourseHeader";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    Search,
    Eye,
    Mail,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    PencilLine,
    RefreshCw,
} from "lucide-react";
import { Suspense, useState } from "react";
import { toast } from "react-hot-toast";
import { Modal } from "@bandhan/ui";
import {
    useGetInstructorOverviewQuery,
    useGetInstructorStudentsQuery,
    useGetInstructorStudentQuery,
    useUpdateInstructorStudentProgressMutation,
    useIssueInstructorCertificateMutation,
} from "@/app/redux/instructor-services/DashboardApi";

function StudentsPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    type StudentRow = {
        studentId: string;
        name: string;
        email: string;
        progress: number;
        lessons: string;
        status: string;
        lastActive: string;
        image: string;
        completedLessons: number;
        totalLessons: number;
        lastActivityAt: number;
    };

    const [activeFilter, setActiveFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("Recently Active");
    const [detailStudent, setDetailStudent] = useState<StudentRow | null>(null);
    const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
    const [progressForm, setProgressForm] = useState({ completedLessons: 0, totalLessons: 0 });
    const [progressOverrides, setProgressOverrides] = useState<Record<string, { progress: number; lessons: string; status: string }>>({});
    const [issuedCertificates, setIssuedCertificates] = useState<Record<string, boolean>>({});
    const [issuingStudentId, setIssuingStudentId] = useState<string | null>(null);

    const { data: overviewData } = useGetInstructorOverviewQuery();
    const courseId = searchParams.get("courseId") || overviewData?.data?.courses?.[0]?._id || "";
    const { data: studentsResponse, isLoading, isError, refetch } = useGetInstructorStudentsQuery(
        { courseId, page: currentPage },
        { skip: !courseId }
    );
    const { data: detailData, isLoading: isDetailLoading, isError: isDetailError, refetch: refetchDetail } = useGetInstructorStudentQuery(
        { courseId, studentId: detailStudent?.studentId || "" },
        { skip: !courseId || !detailStudent }
    );
    const [updateProgress, { isLoading: isUpdatingProgress }] = useUpdateInstructorStudentProgressMutation();
    const [issueCertificate] = useIssueInstructorCertificateMutation();

    const pagination = studentsResponse?.data?.pagination;
    const overview = studentsResponse?.data?.overview;
    const students: StudentRow[] = (studentsResponse?.data?.students || []).map((student: any) => {
        const [completedRaw, totalRaw] = String(student.lessons ?? "0/0").split("/");
        const completedLessons = Number(completedRaw) || 0;
        const totalLessons = Number(totalRaw) || 0;
        const override = progressOverrides[student.studentId];
        const lastActivityAt = student.lastActivity ? new Date(student.lastActivity).getTime() : 0;

        return {
            ...student,
            image: student.profileImage || "/bandhan.png",
            progress: override?.progress ?? Number(student.progress ?? 0),
            lessons: override?.lessons ?? String(student.lessons ?? `${completedLessons}/${totalLessons}`),
            status: override?.status ?? (student.status === "completed" ? "Completed" : "In Progress"),
            lastActive: lastActivityAt ? new Date(lastActivityAt).toLocaleString() : "No activity",
            lastActivityAt,
            completedLessons,
            totalLessons,
        };
    });

    const filteredStudents = students
        .filter((student) => activeFilter === "All" || student.status === activeFilter)
        .filter((student) => `${student.name} ${student.email}`.toLowerCase().includes(searchQuery.trim().toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "Progress: High to Low") return b.progress - a.progress;
            if (sortBy === "Progress: Low to High") return a.progress - b.progress;
            if (sortBy === "Newest") return (b.lastActivityAt || 0) - (a.lastActivityAt || 0);
            if (sortBy === "Oldest") return (a.lastActivityAt || 0) - (b.lastActivityAt || 0);
            return (b.lastActivityAt || 0) - (a.lastActivityAt || 0);
        });

    const handleIssueCertificate = async (student: StudentRow) => {
        if (!courseId) {
            toast.error("Select a course before issuing a certificate.");
            return;
        }

        setIssuingStudentId(student.studentId);
        try {
            const result: any = await issueCertificate({ courseId, studentId: student.studentId }).unwrap();
            setIssuedCertificates((prev: Record<string, boolean>) => ({ ...prev, [student.studentId]: true }));
            const issuedAt = result?.certificate?.issuedAt
                ? new Date(result.certificate.issuedAt).toLocaleDateString()
                : "";
            toast.success(issuedAt ? `Certificate issued on ${issuedAt}.` : `Certificate issued to ${student.name}.`);
        } catch (error: any) {
            toast.error(error?.data?.message || error?.message || "Unable to issue certificate.");
        } finally {
            setIssuingStudentId(null);
        }
    };

    const openProgressEditor = (student: StudentRow) => {
        setEditingStudent(student);
        setProgressForm({
            completedLessons: student.completedLessons,
            totalLessons: student.totalLessons,
        });
    };

    const handleSaveProgress = async () => {
        if (!courseId || !editingStudent) return;

        const completedLessons = Number(progressForm.completedLessons);
        const totalLessons = Number(progressForm.totalLessons);
        if (!Number.isFinite(totalLessons) || totalLessons <= 0) {
            toast.error("Total lessons must be greater than zero.");
            return;
        }
        if (!Number.isFinite(completedLessons) || completedLessons < 0 || completedLessons > totalLessons) {
            toast.error("Completed lessons must be between 0 and total lessons.");
            return;
        }

        const nextProgress = Math.min(100, Math.round((completedLessons / totalLessons) * 100));
        try {
            await updateProgress({ courseId, studentId: editingStudent.studentId, completedLessons, totalLessons }).unwrap();
            setProgressOverrides((prev) => ({
                ...prev,
                [editingStudent.studentId]: {
                    progress: nextProgress,
                    lessons: `${completedLessons}/${totalLessons}`,
                    status: nextProgress === 100 ? "Completed" : "In Progress",
                },
            }));
            setEditingStudent(null);
            toast.success("Progress updated.");
        } catch (error: any) {
            toast.error(error?.data?.message || error?.message || "Unable to update progress.");
        }
    };

    const handleRefresh = async () => {
        if (!courseId) {
            toast.error("Select a course before refreshing students.");
            return;
        }

        try {
            await Promise.all([refetch(), detailStudent ? refetchDetail() : Promise.resolve()]);
            toast.success("Student list refreshed.");
        } catch {
            toast.error("Unable to refresh students.");
        }
    };

    const handleEmailStudent = (student: StudentRow) => {
        if (!student.email) {
            toast.error("No email address is available for this student.");
            return;
        }

        window.location.href = `mailto:${student.email}`;
    };

    const handleAddStudent = () => {
        toast("Students join courses through enrollment; manual add is not available in this portal.");
    };

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
        <div className="min-h-screen bg-[var(--bhn-surface-3)]">
            {/* Header */}
            <InstructorHeader />

            <div className="px-4 sm:px-6 lg:px-5 py-5">
                {/* Tabs */}
                <div className="flex items-center gap-4 border-b border-[var(--bhn-border)] mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {tabs.map((tab) => {
                        const active = pathname === tab.path.split("?")[0];

                        return (
                            <button
                                key={tab.name}
                                onClick={() => router.push(tab.path)}
                                className={`pb-3 text-sm sm:text-[15px] transition-all duration-200 ${active
                                    ? "text-[var(--bhn-brand-700)] border-b-2 border-[var(--bhn-brand-600)] font-medium"
                                    : "text-[var(--bhn-text-soft)] hover:text-[var(--bhn-brand-700)]"
                                    }`}
                            >
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[var(--bhn-surface)] rounded-xl border border-[var(--bhn-border)] p-5">
                        <p className="text-xs text-[var(--bhn-text-soft)] uppercase">
                            Total Students
                        </p>
                        <h2 className="text-xl font-semibold text-[var(--bhn-text)] mt-2">
                            {overview?.totalStudents ?? 0}
                        </h2>
                    </div>

                    <div className="bg-[var(--bhn-surface)] rounded-xl border border-[var(--bhn-border)] p-5">
                        <p className="text-xs text-[var(--bhn-text-soft)] uppercase">
                            Active
                        </p>
                        <h2 className="text-xl font-semibold text-[var(--bhn-brand-700)] mt-2">
                            {overview?.activeStudents ?? 0}
                        </h2>
                    </div>

                    <div className="bg-[var(--bhn-surface)] rounded-xl border border-[var(--bhn-border)] p-5">
                        <p className="text-xs text-[var(--bhn-text-soft)] uppercase">
                            Completed
                        </p>
                        <h2 className="text-xl font-semibold text-[var(--bhn-text)] mt-2">
                            {overview?.completedStudents ?? 0}
                        </h2>
                    </div>

                    <div className="bg-[var(--bhn-surface)] rounded-xl border border-[var(--bhn-border)] p-5">
                        <p className="text-xs text-[var(--bhn-text-soft)] uppercase">
                            Avg Completion
                        </p>
                        <h2 className="text-xl font-semibold text-[var(--bhn-text)] mt-2">
                            {overview?.averageCompletion ?? 0}%
                        </h2>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-[var(--bhn-surface)] rounded-2xl border border-[var(--bhn-border)] overflow-hidden">
                    {isLoading && <p className="p-4 text-sm text-[var(--bhn-text-soft)]">Loading students...</p>}
                    {isError && (
                        <p className="p-4 text-sm text-[var(--bhn-error-600)] flex items-center gap-3">
                            Unable to load students.
                            <button type="button" onClick={handleRefresh} className="underline font-medium">
                                Retry
                            </button>
                        </p>
                    )}
                    {/* Filters */}
                    <div className="p-4 flex flex-col xl:flex-row xl:items-center gap-4 justify-between border-b border-[var(--bhn-border)]">
                        {/* Search */}
                        <div className="relative w-full xl:max-w-xs">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]"
                            />

                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] pl-10 pr-4 text-sm outline-none focus:border-[var(--bhn-brand-600)]"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="h-10 px-4 rounded-lg border border-[var(--bhn-border)] text-sm text-[var(--bhn-text-soft)] hover:text-[var(--bhn-brand-700)] hover:border-[var(--bhn-brand-600)] disabled:opacity-50 flex items-center gap-2"
                        >
                            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                            Refresh
                        </button>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Status Buttons */}
                            <div className="flex items-center border border-[var(--bhn-border)] rounded-lg overflow-hidden flex-wrap">

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
                                                ? "bg-[#F8F2ED] text-[var(--bhn-brand-700)]"
                                                : "text-[var(--bhn-text-soft)] hover:bg-[var(--bhn-surface-3)]"
                                            }
                                     `}
                                    >
                                        {item}
                                    </button>

                                ))}

                            </div>

                            {/* Progress */}
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-[var(--bhn-text-soft)]">Progress:</p>

                                <div className="w-20 sm:w-28 h-1.5 rounded-full bg-[var(--bhn-border)]">
                                    <div className="w-1/2 h-full rounded-full bg-[var(--bhn-brand-600)]" />
                                </div>

                                <p className="text-sm text-[var(--bhn-text-soft)]">0-100%</p>
                            </div>

                            {/* Sort */}
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-10 px-3 rounded-lg border border-[var(--bhn-border)] text-sm text-[var(--bhn-text-soft)] outline-none">
                                <option>Recently Active</option>
                                <option>Newest</option>
                                <option>Oldest</option>
                                <option>Progress: High to Low</option>
                                <option>Progress: Low to High</option>
                            </select>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--bhn-surface-3)]">
                                <tr className="text-left text-xs text-[var(--bhn-text-soft)] uppercase">
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
                                        className="border-t border-[var(--bhn-border)]"
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
                                                    <p className="text-sm font-medium text-[var(--bhn-text)]">
                                                        {student.name}
                                                    </p>

                                                    <p className="text-xs text-[var(--bhn-text-soft)]">
                                                        {student.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Progress */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-[var(--bhn-brand-700)]">
                                                    {student.progress}%
                                                </span>

                                                <div className="w-24 h-1.5 rounded-full bg-[var(--bhn-border)]">
                                                    <div
                                                        className="h-full rounded-full bg-[var(--bhn-brand-600)]"
                                                        style={{
                                                            width: `${student.progress}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Last Active */}
                                        <td className="px-6 py-5 text-sm text-[var(--bhn-text-soft)]">
                                            {student.lastActive}
                                        </td>

                                        {/* Lessons */}
                                        <td className="px-6 py-5 text-sm text-[var(--bhn-text)]">
                                            {student.lessons}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-5">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === "Completed"
                                                    ? "bg-[#EFE7E1] text-[var(--bhn-text-soft)]"
                                                    : "bg-[#F8E8DD] text-[var(--bhn-brand-700)]"
                                                    }`}
                                            >
                                                {student.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-4 text-[var(--bhn-text-soft)]">
                                                <button
                                                    type="button"
                                                    title="View student details"
                                                    aria-label={`View ${student.name}`}
                                                    onClick={() => setDetailStudent(student)}
                                                    className="hover:text-[var(--bhn-brand-700)] disabled:opacity-50"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title={`Email ${student.email}`}
                                                    aria-label={`Email ${student.name}`}
                                                    onClick={() => handleEmailStudent(student)}
                                                    className="hover:text-[var(--bhn-brand-700)]"
                                                >
                                                    <Mail size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Edit progress"
                                                    aria-label={`Edit progress for ${student.name}`}
                                                    onClick={() => openProgressEditor(student)}
                                                    className="hover:text-[var(--bhn-brand-700)]"
                                                >
                                                    <PencilLine size={16} />
                                                </button>

                                                {issuedCertificates[student.studentId] ? (
                                                    <span title="Certificate issued" className="text-[var(--bhn-success-600)]">
                                                        <GraduationCap size={16} />
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        title="Issue completion certificate"
                                                        aria-label={`Issue certificate to ${student.name}`}
                                                        disabled={issuingStudentId === student.studentId}
                                                        onClick={() => handleIssueCertificate(student)}
                                                        className="hover:text-[var(--bhn-brand-700)] disabled:opacity-50"
                                                    >
                                                        <GraduationCap size={16} />
                                                    </button>
                                                )}
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
                                className="border border-[var(--bhn-border)] rounded-xl p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={student.image}
                                        alt=""
                                        className="w-12 h-12 rounded-full object-cover"
                                    />

                                    <div>
                                        <h3 className="font-medium text-[var(--bhn-text)]">
                                            {student.name}
                                        </h3>

                                        <p className="text-xs text-[var(--bhn-text-soft)]">
                                            {student.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Progress</span>
                                            <span className="text-[var(--bhn-brand-700)] font-medium">
                                                {student.progress}%
                                            </span>
                                        </div>

                                        <div className="w-full h-2 rounded-full bg-[var(--bhn-border)]">
                                            <div
                                                className="h-full rounded-full bg-[var(--bhn-brand-600)]"
                                                style={{
                                                    width: `${student.progress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--bhn-text-soft)]">
                                            Lessons
                                        </span>

                                        <span>{student.lessons}</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--bhn-text-soft)]">
                                            Last Active
                                        </span>

                                        <span>{student.lastActive}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === "Completed"
                                                ? "bg-[#EFE7E1] text-[var(--bhn-text-soft)]"
                                                : "bg-[#F8E8DD] text-[var(--bhn-brand-700)]"
                                                }`}
                                        >
                                            {student.status}
                                        </span>

                                        <div className="flex items-center gap-4 text-[var(--bhn-text-soft)]">
                                            <button type="button" title="View student details" aria-label={`View ${student.name}`} onClick={() => setDetailStudent(student)} className="hover:text-[var(--bhn-brand-700)]">
                                                <Eye size={18} />
                                            </button>
                                            <button type="button" title={`Email ${student.email}`} aria-label={`Email ${student.name}`} onClick={() => handleEmailStudent(student)} className="hover:text-[var(--bhn-brand-700)]">
                                                <Mail size={18} />
                                            </button>
                                            <button type="button" title="Edit progress" aria-label={`Edit progress for ${student.name}`} onClick={() => openProgressEditor(student)} className="hover:text-[var(--bhn-brand-700)]">
                                                <PencilLine size={18} />
                                            </button>
                                            {issuedCertificates[student.studentId] ? (
                                                <span title="Certificate issued" className="text-[var(--bhn-success-600)]">
                                                    <GraduationCap size={18} />
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    title="Issue completion certificate"
                                                    aria-label={`Issue certificate to ${student.name}`}
                                                    disabled={issuingStudentId === student.studentId}
                                                    onClick={() => handleIssueCertificate(student)}
                                                    className="hover:text-[var(--bhn-brand-700)] disabled:opacity-50"
                                                >
                                                    <GraduationCap size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-[var(--bhn-border)]">
                        <p className="text-sm text-[var(--bhn-text-soft)]">
                            Showing {startRecord}-{endRecord} of {totalStudents} students
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage <= 1}
                                className="w-8 h-8 rounded-md border border-[var(--bhn-border)] flex items-center justify-center disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {getPageNumbers().map((page, i) =>
                                typeof page === "string" ? (
                                    <span key={`ellipsis-${i}`} className="px-1 text-[var(--bhn-text-soft)]">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-md text-sm ${
                                            page === currentPage
                                                ? "bg-[var(--bhn-brand-600)] text-white"
                                                : "text-[var(--bhn-text-soft)] hover:bg-[var(--bhn-surface-3)]"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="w-8 h-8 rounded-md border border-[var(--bhn-border)] flex items-center justify-center disabled:opacity-40"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floating Button */}
                <button
                    type="button"
                    onClick={handleAddStudent}
                    title="Students join through course enrollment"
                    className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--bhn-brand-600)] text-white shadow-lg flex items-center justify-center hover:scale-105 transition"
                >
                    +
                </button>

                <Modal
                    open={Boolean(detailStudent)}
                    onClose={() => setDetailStudent(null)}
                    title="Student details"
                    size="md"
                >
                    {isDetailLoading ? (
                        <p className="text-sm text-[var(--bhn-text-soft)]">Loading student details...</p>
                    ) : isDetailError ? (
                        <div className="space-y-3 text-sm">
                            <p className="text-[var(--bhn-error-600)]">Unable to load student details.</p>
                            <button
                                type="button"
                                onClick={() => refetchDetail()}
                                className="px-4 py-2 rounded-lg border border-[var(--bhn-border)] text-[var(--bhn-text)]"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        (() => {
                            const detail = detailData?.data;
                            const detailProgress = detail?.progressPercentage ?? detailStudent?.progress ?? 0;
                            const detailLessons = `${detail?.completedLessons ?? detailStudent?.completedLessons ?? 0}/${detail?.totalLessons ?? detailStudent?.totalLessons ?? 0}`;
                            const detailStatus = detail?.status ?? detailStudent?.status ?? "In Progress";
                            const detailLastActive = detail?.lastActivity
                                ? new Date(detail.lastActivity).toLocaleString()
                                : detailStudent?.lastActive ?? "No activity";

                            return (
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={detail?.profileImage || detailStudent?.image || "/bandhan.png"}
                                            alt=""
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-[var(--bhn-text)]">
                                                {detail?.studentName || detailStudent?.name || "Student"}
                                            </p>
                                            <p className="text-xs text-[var(--bhn-text-soft)]">
                                                {detail?.studentEmail || detailStudent?.email || "No email available"}
                                            </p>
                                        </div>
                                    </div>

                                    <dl className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg bg-[var(--bhn-surface-3)]">
                                            <dt className="text-xs text-[var(--bhn-text-soft)]">Progress</dt>
                                            <dd className="font-medium text-[var(--bhn-brand-700)]">{detailProgress}%</dd>
                                        </div>
                                        <div className="p-3 rounded-lg bg-[var(--bhn-surface-3)]">
                                            <dt className="text-xs text-[var(--bhn-text-soft)]">Lessons</dt>
                                            <dd className="font-medium text-[var(--bhn-text)]">{detailLessons}</dd>
                                        </div>
                                        <div className="p-3 rounded-lg bg-[var(--bhn-surface-3)]">
                                            <dt className="text-xs text-[var(--bhn-text-soft)]">Status</dt>
                                            <dd className="font-medium text-[var(--bhn-text)]">{detailStatus}</dd>
                                        </div>
                                        <div className="p-3 rounded-lg bg-[var(--bhn-surface-3)]">
                                            <dt className="text-xs text-[var(--bhn-text-soft)]">Last active</dt>
                                            <dd className="font-medium text-[var(--bhn-text)]">{detailLastActive}</dd>
                                        </div>
                                    </dl>

                                    {Array.isArray(detail?.certificates) && detail.certificates.length > 0 && (
                                        <div>
                                            <p className="font-medium text-[var(--bhn-text)] mb-2">Certificates</p>
                                            <ul className="space-y-2">
                                                {detail.certificates.map((certificate: any, index: number) => (
                                                    <li key={certificate?._id || index} className="text-xs text-[var(--bhn-text-soft)]">
                                                        {certificate?.title || "Certificate"}
                                                        {certificate?.issuedAt ? ` — ${new Date(certificate.issuedAt).toLocaleDateString()}` : ""}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })()
                    )}
                </Modal>

                <Modal
                    open={Boolean(editingStudent)}
                    onClose={() => setEditingStudent(null)}
                    title={`Update progress — ${editingStudent?.name ?? ""}`}
                    footer={
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setEditingStudent(null)}
                                className="px-4 py-2 rounded-lg border border-[var(--bhn-border)] text-sm text-[var(--bhn-text-soft)]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveProgress}
                                disabled={isUpdatingProgress}
                                className="px-4 py-2 rounded-lg bg-[var(--bhn-brand-600)] text-white text-sm disabled:opacity-50"
                            >
                                {isUpdatingProgress ? "Saving..." : "Save progress"}
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-4 text-sm">
                        <label className="block space-y-2">
                            <span className="text-[var(--bhn-text-soft)]">Completed lessons</span>
                            <input
                                type="number"
                                min={0}
                                max={progressForm.totalLessons}
                                value={progressForm.completedLessons}
                                onChange={(e) => setProgressForm((prev) => ({ ...prev, completedLessons: Math.max(0, Number(e.target.value) || 0) }))}
                                className="bhn-input"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[var(--bhn-text-soft)]">Total lessons</span>
                            <input
                                type="number"
                                min={1}
                                value={progressForm.totalLessons}
                                onChange={(e) => setProgressForm((prev) => ({ ...prev, totalLessons: Math.max(0, Number(e.target.value) || 0) }))}
                                className="bhn-input"
                            />
                        </label>
                        <p className="text-xs text-[var(--bhn-text-soft)]">
                            Progress is calculated from completed lessons and saved to the course progress record.
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default function StudentsPage() {
    return <Suspense fallback={<div className="min-h-screen bg-[var(--bhn-surface-3)]" />}><StudentsPageContent /></Suspense>;
}
