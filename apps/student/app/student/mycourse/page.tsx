"use client";

import { useState, useEffect } from "react";
import StudentHeader from "@/components/common/StudentHeader";
import Button from "@/components/common/Button";
import { StatCard } from "@bandhan/ui";
import { useRouter } from "next/navigation";
import { useGetDashboardQuery } from "@/app/redux/services/courseApi";

export default function MyCoursesPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
    const { data: enrollmentsData, isLoading: isDashboardLoading, error: dashboardError } = useGetDashboardQuery(undefined);

    

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleViewCourse = () => {
        router.push("/student/courses");
    };

    const courses = enrollmentsData?.data?.continueLearning
        ? enrollmentsData.data.continueLearning.map((course: any) => ({
            id: course._id,
            title: course.title || "Untitled course",
            author: course.instructor?.fullName || "Unknown instructor",
            lesson: course.currentLesson || "Continue learning",
            progress: course.progress ?? 0,
            image: course.thumbnail || "/image20.png",
        }))
        : [];


    const recommendedCourses = enrollmentsData?.data?.recommendedCourses?.length
        ? enrollmentsData.data.recommendedCourses.map((course: any, index: number) => ({
            id: String(index),
            category: course.category || "Course",
            lectures: course.lectures || "-",
            title: course.title,
            description: course.description || "Explore this recommended course.",
            price: course.price ? `₹${course.price}` : "₹0.00",
            image: course.image || "/image23.png",
        }))
        : [];

    return (
        <div className="bg-[var(--bhn-bg)] min-h-screen w-full overflow-hidden">

            <StudentHeader />

            {/* FULL WIDTH */}
            <div className="px-4 sm:px-6 lg:px-6 xl:px-16 py-6 sm:py-6 w-full">

                {/* TOP */}
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-5 mb-6 sm:mb-4">

                    <div>

                        <h1 className="text-2xl sm:text-[35px] font-semibold">
                            Good evening, {user?.name || user?.email?.split("@")[0]} 👋
                        </h1>

                        <p className="text-gray-500 text-2sm mt-1">
                            Let’s continue where you left off.
                        </p>

                    </div>

                    <Button
                        onClick={() => router.push("/student/allcourse")}
                        className="w-full sm:w-fit"
                    >
                        My Courses →
                    </Button>

                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

                    <StatCard
                        label="Enrolled Courses"
                        value={enrollmentsData?.data?.totalCourses ?? 0}
                        deltaLabel="active enrollments"
                        accent
                    />

                    <StatCard
                        label="Progress"
                        value={`${enrollmentsData?.data?.completionRate ?? 0}%`}
                        deltaLabel="overall completion"
                    />

                    <StatCard
                        label="Pending Quizzes"
                        value={enrollmentsData?.data?.upcomingTasks?.filter((task: any) => task.lessonType === "quiz").length ?? 0}
                        deltaLabel="awaiting attempts"
                    />

                    <StatCard
                        label="Certificates Earned"
                        value={enrollmentsData?.data?.completedCourses ?? 0}
                        deltaLabel="courses completed"
                    />

                </div>

                {/* MAIN GRID */}
                <div className="w-full">

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">

                        {/* LEFT */}
                        <div className="xl:col-span-2 flex flex-col">

                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-5 gap-4">

                                <h2 className="text-xl sm:text-xl font-semibold">
                                    Continue Learning
                                </h2>

                                <p
                                    onClick={() => router.push("/student/mycourse")}
                                    className="text-sm text-[#8B5E3C] dark:text-[#c9a882] cursor-pointer whitespace-nowrap"
                                >
                                    View All
                                </p>

                            </div>

                            {/* COURSES */}
                            <div className="space-y-6">

                                {courses.map((course: { id: string; title: string; author: string; lesson: string; progress: number; image: string }, i: number) => (

                                    <div
                                        key={course.id}
                                        className="
                                            bhn-card
                                            p-4
                                            sm:p-5
                                            flex
                                            flex-col
                                            md:flex-row
                                            gap-5
                                        "
                                    >

                                        <img
                                            src={course.image}
                                            className="
                                                w-full
                                                md:w-[220px]
                                                h-[200px]
                                                md:h-[140px]
                                                rounded-lg
                                                object-cover
                                            "
                                        />

                                        <div className="flex flex-col justify-between flex-1">

                                            <div>

                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">

                                                    <h3 className="text-[15px] font-semibold">
                                                        {course.title}
                                                    </h3>

                                                    <span className="text-sm text-[var(--bhn-brand-700)]">
                                                        {course.progress}%
                                                    </span>

                                                </div>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {course.author}
                                                </p>

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {course.lesson}
                                                </p>

                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4">

                                                <div className="w-full sm:w-[70%] bg-[var(--bhn-surface-3)] h-[3px] rounded">
                                                    <div
                                                        style={{ width: `${course.progress}%` }}
                                                        className="bg-[var(--bhn-brand-500)] h-[3px] rounded"
                                                    />
                                                </div>

                                                <button
                                                    onClick={() => router.push(`/student/course-player/${course.id}`)}
                                                    className="
                                                        bhn-btn
                                                        bhn-btn-primary
                                                        text-sm
                                                        w-full
                                                        sm:w-fit
                                                    "
                                                >
                                                    Resume
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                        {/* RIGHT */}
                        <div className="flex flex-col">

                            {/* HEADER */}
                            <div className="flex items-center mb-5">
                                <h3 className="text-2xl font-semibold">
                                    Upcoming Tasks
                                </h3>
                            </div>

                            {/* CONTENT */}
                            <div className="flex flex-col gap-4">

                                {/* TASK CARD */}
                                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm space-y-4">

                                    {
                                        enrollmentsData?.data?.upcomingTasks?.map((task: any) => (
                                            <div
                                                key={task.lessonId}
                                                className="flex flex-col sm:flex-row sm:justify-between gap-4 bg-[var(--bhn-surface-2)] p-4 rounded-lg border-l-[4px] border-[var(--bhn-brand-600)]"
                                            >

                                                <div>

                                                    <p className={`text-[12px] uppercase font-semibold ${task.locked ? "text-[var(--bhn-text-soft)]" : "text-[var(--bhn-success-600)]"}`}>

                                                        {task.locked
                                                            ? "Locked"
                                                            : "Available"}

                                                    </p>

                                                    <h4 className="text-[15px] font-semibold mt-1">

                                                        {task.lessonTitle}

                                                    </h4>

                                                    <p className="text-xs text-[var(--bhn-text-muted)]">

                                                        {task.courseTitle}

                                                    </p>

                                                </div>

                                                {
                                                    task.locked ?

                                                        <button
                                                            disabled
                                                            className="bhn-btn bhn-btn-secondary bhn-btn-sm"
                                                            style={{ opacity: 0.5, cursor: "not-allowed" }}
                                                        >

                                                            Locked

                                                        </button>

                                                        :

                                                        <button

                                                            onClick={() => router.push(`/student/view_details/${task.courseId}`)}

                                                            className="bhn-btn bhn-btn-primary bhn-btn-sm"

                                                        >

                                                            Start

                                                        </button>

                                                }

                                            </div>

                                        ))
                                    }

                                </div>

                                {/* PROMO */}
                                <div className="bg-[var(--bhn-brand-700)] text-white p-5 sm:p-4 rounded-xl">

                                    <h3 className="text-xl font-semibold leading-snug">
                                        Master Classes <br /> Now Live
                                    </h3>

                                    <p className="text-sm mt-3 opacity-90">
                                        Join industry experts in weekly live sessions.
                                    </p>

                                    <button
                                        onClick={() => router.push("/student/courses")}
                                        className="
                                            bg-white
                                            text-[#9C4F2C]
                                            text-sm
                                            px-5
                                            py-2
                                            rounded-md
                                            mt-4
                                            w-full
                                            sm:w-fit
                                        "
                                    >
                                        JOIN SESSION
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ================= RECOMMENDED ================= */}
                <div className="mt-16 w-full">

                    {/* HEADER */}
                    <h2 className="text-2xl sm:text-[30px] font-semibold text-black mb-4">
                        Recommended for You
                    </h2>

                    {/* CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {recommendedCourses.map((course: { id: string; category: string; lectures: string; title: string; description: string; price: string; image: string }) => (
                            <div
                                key={course.id}
                                className="bhn-card bhn-card-hover overflow-hidden"
                            >
                                <img
                                    src={course.image}
                                    className="w-full h-[220px] sm:h-[240px] object-cover"
                                />

                                <div className="p-5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="bhn-badge bhn-badge-brand uppercase">
                                            {course.category}
                                        </span>

                                        <span className="text-[11px] text-[var(--bhn-text-soft)]">
                                            • {course.lectures}
                                        </span>
                                    </div>

                                    <h3 className="text-[17px] font-semibold mt-2 text-[#3B2F2F] dark:text-[#a89080]">
                                        {course.title}
                                    </h3>

                                    <p className="text-sm sm:text-[16px] text-gray-500 mt-2 leading-relaxed">
                                        {course.description}
                                    </p>

                                    <div className="flex justify-between items-center mt-5 gap-4">
                                        <span className="text-[16px] font-bold text-[var(--bhn-brand-600)]">
                                            {course.price}
                                        </span>

                                        <span
                                            onClick={() => router.push("/student/courses")}
                                            className="text-sm sm:text-[16px] text-[var(--bhn-brand-700)] font-bold cursor-pointer whitespace-nowrap"
                                        >
                                            View Course →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* ================= FOOTER ================= */}
                <div
                    className="
                        mt-20
                        border-t
                        pt-6
                        pb-4
                        flex
                        flex-col
                        lg:flex-row
                        justify-between
                        items-center
                        gap-4
                        text-sm
                        sm:text-[15px]
                        text-gray-400
                    "
                >

                    {/* LEFT */}
                    <p className="text-center lg:text-left">
                        © 2024 Scholarly Premium Education. All Rights Reserved.
                    </p>

                    {/* RIGHT */}
                    <div className="flex flex-wrap justify-center gap-5 sm:gap-9">

                        <span onClick={() => router.push("/support")} className="cursor-pointer hover:text-[#8B5E3C] dark:text-[#c9a882]">
                            Support
                        </span>

                        <span onClick={() => router.push("/privacy-policy")} className="cursor-pointer hover:text-[#8B5E3C] dark:text-[#c9a882]">
                            Privacy Policy
                        </span>

                        <span onClick={() => router.push("/terms-of-service")} className="cursor-pointer hover:text-[#8B5E3C] dark:text-[#c9a882]">
                            Terms of Service
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}
