"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import StudentHeader from "@/components/common/StudentHeader";
import { useGetCoursePlayerQuery, useCompleteLessonMutation } from "@/app/redux/services/courseApi";

function CoursePlayerContent() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const initialLesson = Number(searchParams.get("lesson") ?? 0);
    const [selectedLesson, setSelectedLesson] = useState(initialLesson);
    const [openModule, setOpenModule] = useState<string | null>(null);

    const courseId = String(id || "");
    const { data: courseResponse, isLoading, error } = useGetCoursePlayerQuery(courseId, {
        skip: !courseId,
        refetchOnMountOrArgChange: true,
    });

    const raw = courseResponse?.data || courseResponse || {};

    const course = {
        ...(raw.course || raw),
        modules: raw.modules || (raw.course && raw.course.modules) || [],
        instructor: raw.instructor || raw.course?.instructor || raw.instructorId || raw.course?.instructorId,
        enrollment: raw.enrollment || raw.course?.enrollment,
        stats: raw.stats || raw.course?.stats,
    } as any;

    const isEnrolled = course?.enrollment?.isEnrolled ?? true;
    const lessons = useMemo(
        () => course?.modules?.flatMap((module: any) => module.lessons ?? []) ?? [],
        [course]
    );
    const modules = course?.modules || [];
    const quizId = String(course?.courseId || course?.id || courseId || "");

    const [completeLesson, { isLoading: isCompleting }] = useCompleteLessonMutation();

    useEffect(() => {
        if (!Number.isNaN(initialLesson) && initialLesson >= 0 && initialLesson < lessons.length) {
            setSelectedLesson(initialLesson);
        }
    }, [initialLesson, lessons.length]);

    useEffect(() => {
        if (selectedLesson >= lessons.length && lessons.length > 0) {
            setSelectedLesson(0);
        }
    }, [selectedLesson, lessons.length]);

    useEffect(() => {
    if (modules.length > 0 && !openModule) {
        setOpenModule(
            String(
                modules[0]._id ||
                modules[0].id ||
                modules[0].title
            )
        );
    }
}, [modules, openModule]);

    if (isLoading) {
        return (
            <div className="bg-[var(--bhn-bg)] min-h-screen flex items-center justify-center">
                <p className="text-lg text-[var(--bhn-text)]">Loading course player...</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="bg-[var(--bhn-bg)] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-[var(--bhn-error-600)] mb-4">Unable to load course player</p>
                    <p className="text-sm text-[var(--bhn-text-muted)] mb-6">Make sure you have enrolled in this course</p>
                    <button
                        onClick={() => router.push(`/student/view_details/${id}`)}
                        className="bhn-btn bhn-btn-primary"
                    >
                        Back to Course
                    </button>
                </div>
            </div>
        );
        }

    if (!isEnrolled) {
        return (
            <div className="bg-[var(--bhn-bg)] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-[var(--bhn-text)] mb-4">Please enroll to access this course</p>
                    <p className="text-sm text-[var(--bhn-text-muted)] mb-6">You need to enroll and complete payment to watch lessons</p>
                    <button
                        onClick={() => router.push(`/student/enroll/${id}`)}
                        className="bhn-btn bhn-btn-primary"
                    >
                        Enroll Now
                    </button>
                </div>
            </div>
        );
        }

    if (!lessons.length) {
        return (
            <div className="bg-[var(--bhn-bg)] min-h-screen flex items-center justify-center">
                <p className="text-lg text-[var(--bhn-text)]">No lessons available for this course.</p>
            </div>
        );
    }

    const lesson = lessons[selectedLesson] || lessons[0] || null;
    const resources: Array<{ fileUrl?: string; fileName?: string; name?: string; fileType?: string }> = lesson?.resources || [];
    const courseLessonCount = lessons.length;
    const courseTitle = course?.title || "Course Player";
    const courseInstructor = course?.instructor?.fullName || course?.instructor || "Instructor";
    const courseDurationLabel = course?.stats?.totalDuration || course?.duration || `${courseLessonCount} lessons`;

    if (!lesson) {
        return (
            <div className="bg-[var(--bhn-bg)] min-h-screen flex items-center justify-center">
                <p className="text-lg text-[var(--bhn-text)]">Selected lesson not found.</p>
            </div>
        );
    }

    return (
        <div className="bg-[var(--bhn-bg)] min-h-screen">

            {/* HEADER */}
            <StudentHeader />

            {/* MAIN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 md:p-4">

                {/* LEFT SIDEBAR */}
                <div className="lg:col-span-1">
                    <div className="bhn-card flex flex-col lg:h-[calc(100vh-100px)] lg:sticky lg:top-4">

                        {/* TOP PROFILE */}
                        <div className="p-5 border-b border-[var(--bhn-border)]">
                            <div className="flex items-center gap-3">
                                <div className="bhn-avatar bhn-avatar-md">
                                    👤
                                </div>

                                <div>
                                    <p className="text-sm md:text-base font-semibold">
                                        {courseTitle}
                                    </p>
                                    <p className="text-xs text-[var(--bhn-text-muted)]">
                                        {courseInstructor}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    let text = `${course.title || "Course"} - Syllabus\n`;
                                    text += `${"=".repeat(40)}\n\n`;
                                    (modules || []).forEach((mod: any, mi: number) => {
                                        text += `Module ${mi + 1}: ${mod.title || `Module ${mi + 1}`}\n`;
                                        (mod.lessons || []).forEach((les: any, li: number) => {
                                            text += `  Lesson ${li + 1}: ${les.title || `Lesson ${li + 1}`}\n`;
                                        });
                                        text += "\n";
                                    });
                                    const blob = new Blob([text], { type: "text/plain" });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = `${course.title || "course"}-syllabus.txt`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(url);
                                }}
                                className="bhn-btn bhn-btn-outline mt-4 w-full"
                            >
                                Download Syllabus
                            </button>
                        </div>

                        {/* MODULES */}
                        <div className="flex-1 overflow-y-auto p-4">

                            {/* Build modules with global lesson indices */}
                            {
                                (() => {
                                    // compute modules with global indices
                                    let counter = 0;
                                    const modulesWithIndices = modules.map((m: any) => {
                                        const lessons = (m.lessons || []).map((ls: any, idx: number) => ({
                                            ...ls,
                                            globalIndex: counter + idx,
                                        }));
                                        counter += lessons.length;
                                        return { ...m, lessons };
                                    });

                                    return (
                                        <div className="space-y-4">
                                            {modulesWithIndices.map((module: any, moduleIndex: number) => {
                                                const moduleKey = String(module._id || module.id || module.title || moduleIndex);
                                                const isOpen = openModule === moduleKey;

                                                return (
                                                    <div key={moduleKey} className="bhn-card overflow-hidden">
                                                        <button
                                                            onClick={() => setOpenModule(isOpen ? null : moduleKey)}
                                                            className={`w-full flex items-center justify-between px-3 py-3 transition ${isOpen ? 'bg-[var(--bhn-surface-2)]' : 'bg-[var(--bhn-surface)]'}`}>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[var(--bhn-brand-700)] font-bold text-sm">{String(moduleIndex + 1).padStart(2, '0')}</span>
                                                                <h4 className="font-semibold text-sm md:text-base text-[var(--bhn-text)]">{module.title}</h4>
                                                            </div>
                                                            <div className="text-[var(--bhn-text)]">{isOpen ? '▾' : '▸'}</div>
                                                        </button>

                                                        <div className={`${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'} transition-all duration-300 overflow-hidden`}>
                                                            <div className="px-3 py-2 space-y-1 bg-[var(--bhn-surface)]">
                                                                {module.lessons?.map((lesson: any, li: number) => (
                                                                    <button
                                                                        key={lesson._id || li}
                                                                        onClick={() => { setSelectedLesson(lesson.globalIndex); setOpenModule(moduleKey); }}
                                                                        className={`bhn-navlink w-full text-left ${selectedLesson === lesson.globalIndex ? "bhn-navlink-active" : ""}`}>
                                                                        <span className="w-5 h-5 flex items-center justify-center bg-[var(--bhn-brand-600)] text-white rounded-full text-[10px]">▶</span>
                                                                        <div className="truncate">
                                                                            <div className="font-medium">{lesson.title}</div>
                                                                            <div className="text-xs text-[var(--bhn-text-soft)]">{lesson.duration ?? lesson.time ?? lesson.type ?? ''}</div>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()
                            }

                        </div>
                    </div>
                </div>

                {/* CENTER CONTENT */}
                <div className="lg:col-span-2">

                    {/* VIDEO */}
                    <div className="bg-black rounded-xl overflow-hidden">
                        <video
                            src={lesson?.videoUrl || lesson?.video || "/sample.mp4"}
                            controls
                            className="w-full h-[220px] sm:h-[320px] md:h-[420px] object-cover"
                        />
                    </div>

                    {/* TITLE */}
                    <h2 className="text-2xl md:text-xl font-semibold mt-4">
                        {lesson?.title}
                    </h2>

                    {/* META */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-2">
                        <span>👨‍🏫 {courseInstructor}</span>
                        <span>⏱ {courseDurationLabel}</span>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => router.back()}
                                className="bhn-btn bhn-btn-secondary"
                            >
                                ◀
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        if (!courseId || !lesson?._id) return;
                                        await completeLesson({ courseId, lessonId: String(lesson._id) }).unwrap();
                                        // advance to next lesson if available
                                        setSelectedLesson((s) => (s + 1 < lessons.length ? s + 1 : s));
                                    } catch (err) {
                                        console.error(err);
                                        alert("Failed to mark lesson as complete");
                                    }
                                }}
                                disabled={isCompleting}
                                className="bhn-btn bhn-btn-primary"
                            >
                                {isCompleting ? "Marking..." : "Mark as Complete ✓"}
                            </button>

                            <button className="bhn-btn bhn-btn-ghost">
                                
                            </button>
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="bhn-card mt-6 overflow-hidden">

                        {/* TAB HEAD */}
                        <div className="bhn-tabs border-b border-[var(--bhn-border)] px-4 md:px-5 pt-4 text-sm overflow-x-auto">

                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`bhn-tab bhn-tab-line whitespace-nowrap ${activeTab === "overview" ? "bhn-tab-active" : ""}`}
                            >
                                Overview
                            </button>

                            <button
                                onClick={() => setActiveTab("notes")}
                                className={`bhn-tab bhn-tab-line whitespace-nowrap ${activeTab === "notes" ? "bhn-tab-active" : ""}`}
                            >
                                Notes
                            </button>

                            <button
                                onClick={() => setActiveTab("discussion")}
                                className={`bhn-tab bhn-tab-line whitespace-nowrap ${activeTab === "discussion" ? "bhn-tab-active" : ""}`}
                            >
                                Discussion
                            </button>
                        </div>

                        {/* TAB CONTENT */}
                        <div className="p-4 md:p-5">

                            {activeTab === "overview" && (
                                <>
                                    <h3 className="font-semibold mb-2">
                                        About this lesson
                                    </h3>

                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {lesson?.description}
                                    </p>

                                    {/* BOXES */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

                                        <div className="bg-[#F5ECE6] dark:bg-[#1a1a1a] p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">
                                                Key Takeaway
                                            </p>

                                            <p className="text-sm font-medium">
                                                {lesson?.keyTakeaway}
                                            </p>
                                        </div>

                                        <div className="bg-[#F5ECE6] dark:bg-[#1a1a1a] p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">
                                                Tools Needed
                                            </p>

                                            <p className="text-sm font-medium">
                                                {lesson?.tools}
                                            </p>
                                        </div>
                                    </div>

                                    {/* QUIZ BUTTON */}
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={() => {
                                                // Use quiz ID if available, otherwise use lesson ID
                                                const quizIdToUse = lesson?.quizId || lesson?.quiz?._id || lesson?._id || id;
                                                console.log("Navigating to quiz with ID:", quizIdToUse, "Lesson data:", lesson);
                                                router.push(`/student/quiz/${quizIdToUse}`);
                                            }}
                                            className="bhn-btn bhn-btn-primary"
                                        >
                                            Take Quiz →
                                        </button>
                                    </div>
                                </>
                            )}

                            {activeTab === "notes" && (
                                <div className="text-sm text-gray-600 flex flex-col items-center justify-center py-8">
                                    <span className="text-3xl mb-2">📝</span>
                                    <p className="font-medium text-gray-500">Notes feature coming soon</p>
                                    <p className="text-xs text-gray-400 mt-1">You will be able to add and save notes for each lesson.</p>
                                </div>
                            )}

                            {activeTab === "discussion" && (
                                <div className="text-sm text-gray-600 flex flex-col items-center justify-center py-8">
                                    <span className="text-3xl mb-2">💬</span>
                                    <p className="font-medium text-gray-500">Discussion feature coming soon</p>
                                    <p className="text-xs text-gray-400 mt-1">Ask questions and discuss with fellow learners.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="bhn-card p-4 flex flex-col justify-between h-fit">

                    {/* TOP */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-sm">
                                LESSON RESOURCES
                            </h3>

                            <button
                                onClick={() => resources[0]?.fileUrl && window.open(resources[0].fileUrl, "_blank")}
                            >
                                <img
                                    src="/image37.png"
                                    alt="download"
                                    className="w-4 h-4 object-contain opacity-60"
                                />
                            </button>
                        </div>

                        <ul className="space-y-3 text-sm">

                            {/* ITEM */}
                            {resources.map((resource, index) => (
                                <li
                                    key={index}
                                    onClick={() => {
                                        if (resource.fileUrl) window.open(resource.fileUrl, "_blank");
                                    }}
                                    className="flex items-center justify-between border border-[var(--bhn-border)] p-3 rounded-lg hover:bg-[var(--bhn-surface-2)] bg-[var(--bhn-surface)] cursor-pointer gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="bg-[#F5ECE6] dark:bg-[#1a1a1a] p-2 rounded-md flex items-center justify-center flex-shrink-0">
                                            <img
                                                src={`/image3${index + 2}.png`}
                                                alt="file icon"
                                                className="w-4 h-4 object-contain"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-medium truncate">
                                                {resource.fileName || resource.name}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {resource.fileType === "pdf"
                                                    ? "PDF Document"
                                                    : resource.fileType === "figma"
                                                        ? "Figma File"
                                                        : "External Resource Link"}
                                            </p>
                                        </div>
                                    </div>

                                    <img
                                        src={
                                            index === 1
                                                ? "/image36.png"
                                                : "/image35.png"
                                        }
                                        alt="download"
                                        className="w-4 h-4 object-contain opacity-60 flex-shrink-0"
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* BOTTOM CARD */}
                    <div className="bg-[var(--bhn-brand-950)] text-white p-4 rounded-xl mt-6">
                        <p className="text-xs text-white/60 mb-2">
                            Feeling stuck?
                        </p>

                        <p className="text-sm mb-4">
                            Connect with mentors in real-time or drop a question
                        </p>

                        <button
                            onClick={() =>
                                router.push(`/student/course-doubt/${course.courseId || course.id}`)
                            }
                            className="w-full bg-white text-[var(--bhn-brand-800)] py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-[var(--bhn-brand-50)]">
                             Ask Doubt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CoursePlayer() {
    return <Suspense fallback={<div className="min-h-screen bg-[var(--bhn-bg)]" />}><CoursePlayerContent /></Suspense>;
}
