"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StudentHeader from "@/components/common/StudentHeader";
import {
    Search,
    ChevronDown,
    Plus,
} from "lucide-react";
import { useGetMyCoursesPageQuery } from "@/app/redux/services/courseApi";

type CourseItem = {
    courseId: string | number;
    category: string;
    title: string;
    author: string;
    progress: number;
    lesson: string;
    image: string;
    status: "progress" | "completed";
};

export default function MyCoursesPage() {
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [visibleCourses, setVisibleCourses] = useState(6);
    const [sortOrder, setSortOrder] = useState("recent");

    const { data: myCoursesData, isLoading, error } = useGetMyCoursesPageQuery(undefined);

    const coursesData: CourseItem[] = myCoursesData?.data?.map((item: any) => {
        const progressValue = Number(String(item.progress || "").replace("%", "")) || 0;
        const lessonText = item.completedLessons != null && item.totalLessons != null
            ? `${item.completedLessons}/${item.totalLessons} lessons`
            : item.lastActivity || "";

        return {
            courseId: item._id || "",
            category: item.subtitle || "",
            title: item.title || "",
            author: item.instructor?.fullName || "",
            progress: progressValue,
            lesson: lessonText,
            image: item.thumbnail || item.image || "/course.png",
            status: progressValue >= 100 ? "completed" : "progress",
        };
    }) ?? [];

    const filteredCourses = coursesData.filter((course: CourseItem) => {
        const searchMatch = course.title
            .toLowerCase()
            .includes(search.toLowerCase());

        const statusMatch =
            activeTab === "all"
                ? true
                : activeTab === "progress"
                    ? course.status === "progress"
                    : course.status === "completed";

        return searchMatch && statusMatch;
    });

    return (
        <div className="min-h-screen bg-[var(--bhn-bg)]">

            <StudentHeader />

            <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-6">

                {/* Breadcrumb */}
                <p className="text-[11px] uppercase tracking-[2px] text-[#A49A92] dark:text-[#6a5a4a]">
                    Home / My Courses
                </p>

                {/* Heading */}
                <div className="mt-4">
                    <h1 className="text-xl sm:text-3xl font-semibold text-[#241D1A] dark:text-[#ededed]">
                        My Courses
                    </h1>

                    <p className="text-[#7A726D] dark:text-[#b89b7d] mt-2">
                        Continue your learning journey.
                    </p>
                </div>

                {/* Search + Sort */}
                <div className="mt-6 flex flex-col lg:flex-row gap-5 justify-between">

                    {/* Filters */}
                    <div className="flex gap-3 flex-wrap">

                        <button
                            onClick={() => setActiveTab("all")}
                            className={`bhn-chip ${activeTab === "all" ? "bhn-chip-active" : ""}`}
                        >
                            All
                        </button>

                        <button
                            onClick={() => setActiveTab("progress")}
                            className={`bhn-chip ${activeTab === "progress" ? "bhn-chip-active" : ""}`}
                        >
                            In Progress
                        </button>

                        <button
                            onClick={() => setActiveTab("completed")}
                            className={`bhn-chip ${activeTab === "completed" ? "bhn-chip-active" : ""}`}
                        >
                            Completed
                        </button>

                    </div>

                    {/* Search + Sort */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">

                        <div className="relative w-full sm:w-[320px]">

                            <Search
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search your courses..."
                                className="
                                w-full
                                h-[48px]
                                bg-white
                                bhn-input
                                pl-10
                                pr-4
                                text-sm
                               "
                            />

                        </div>

                        <button
                            onClick={() => setSortOrder(sortOrder === "recent" ? "oldest" : "recent")}
                            className="
                            h-[48px]
                            px-5
                            bhn-btn
                            bhn-btn-secondary
                            flex
                            items-center
                            gap-2
                            text-sm
                            whitespace-nowrap
                           "
                        >
                            Recently Accessed
                            <ChevronDown size={16} />
                        </button>

                    </div>

                </div>

                {/* COURSES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

                    {filteredCourses
                        .slice(0, visibleCourses)
                        .map((course: CourseItem) => (

                            <div
                                key={course.courseId}
                                className="
                                bhn-card
                                bhn-card-hover
                                overflow-hidden
                                  "
                            >

                                {/* IMAGE */}
                                <div className="relative">

                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-[210px] object-cover"
                                    />

                                    {course.status === "completed" && (
                                        <span className="bhn-badge bhn-badge-success absolute top-3 right-3">
                                            Completed
                                        </span>
                                    )}

                                </div>

                                {/* CONTENT */}
                                <div className="p-4">

                                    <p className="text-[11px] uppercase text-[var(--bhn-brand-700)]">
                                        {course.category}
                                    </p>

                                    <h3 className="mt-1 text-[15px] font-medium text-[#2F2A27] dark:text-[#ededed]">
                                        {course.title}
                                    </h3>

                                    <p className="text-[#8F8782] dark:text-[#7a6a5a] text-sm mt-1">
                                        by {course.author}
                                    </p>

                                    <div className="mt-5">

                                        <p className="text-sm text-[#554D48] dark:text-[#a89080]">
                                            {course.progress}% completed
                                        </p>

                                        <div className="mt-2 h-[4px] bg-[var(--bhn-surface-3)] rounded-full overflow-hidden">

                                            <div
                                                className={`
                                                  h-full
                                                  rounded-full
                                                  ${course.status === "completed"
                                                        ? "bg-[var(--bhn-success-600)]"
                                                        : "bg-[var(--bhn-brand-500)]"
                                                    }
                                                   `}
                                                style={{
                                                    width: `${course.progress}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                    <p className="mt-4 text-[12px] italic text-[#B0A7A2] dark:text-[#6a5a4a]">
                                        {course.status === "completed"
                                            ? `Final Grade: ${course.lesson}`
                                            : `Last lesson: ${course.lesson}`}
                                    </p>

                                    <button
                                        onClick={() =>
                                            router.push(`/student/course-player/${course.courseId}`)
                                        }
                                        className={`
                                          mt-4
                                          w-full
                                          ${course.status === "completed"
                                                ? "bhn-btn bhn-btn-secondary"
                                                : "bhn-btn bhn-btn-primary"
                                            }
                                           `}
                                    >
                                        {course.status === "completed"
                                            ? "Review Course"
                                            : "Resume"}
                                    </button>

                                </div>

                            </div>

                        ))}
                </div>
                {/* LOAD MORE */}

                <div className="mt-6 flex flex-col items-center gap-4">

                    <div className="flex gap-3">

                        {/* Load More */}
                        {visibleCourses < filteredCourses.length && (
                            <button
                                onClick={() =>
                                    setVisibleCourses((prev) => prev + 3)
                                }
                                className="
                                px-6
                                py-3
                                border
                                border-[#D9CDC6] dark:border-[#374151]
                                rounded-lg
                                bg-white
                                text-[#4A433F] dark:text-[#a89080]
                                text-sm
                                hover:bg-[#F7F4F1]
                              "
                            >
                                ↻ Load More Courses
                            </button>
                        )}

                        {/* Show Less */}
                        {visibleCourses > 6 && (
                            <button
                                onClick={() => setVisibleCourses(6)}
                                className="
                                  px-6
                                  py-3
                                  border
                                  border-[#D9CDC6] dark:border-[#374151]
                                  rounded-lg
                                  bg-white
                                  text-[#4A433F] dark:text-[#a89080]
                                  text-sm
                                  hover:bg-[#F7F4F1]
                                  "
                            >
                                ↑ Show Less
                            </button>
                        )}

                    </div>

                    <p className="text-sm text-[#A49A92] dark:text-[#6a5a4a]">
                        Showing {Math.min(visibleCourses, filteredCourses.length)}
                        {" "}of {filteredCourses.length} courses
                    </p>

                </div>
                <button
                    onClick={() => router.push("/student/courses")}
                    className="
                    fixed
                    bottom-6
                    right-6
                    w-12
                    h-12
                    rounded-full
                    bg-[#8C4F28] dark:bg-[#b86a3a]
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    hover:scale-105
                    transition
                   "
                >
                    ✎
                </button>

            </div>
        </div>
    )
}
