"use client";

import CurriculumHeader from "@/components/common/CurriculumHeader";
import FileUpload from "@/components/form/FileUpload";
import LessonCard from "@/components/lesson/LessonCard";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { skipToken } from "@reduxjs/toolkit/query/react";
import {
    useAddLessonMutation,
    useAddModuleMutation,
    useAddQuizMutation,
    useDeleteLessonMutation,
    useDeleteModuleMutation,
    useEditLessonMutation,
    useEditModuleMutation,
    useGetCurriculumBuilderQuery,
    useReorderModulesMutation,
    useSaveCurriculumAndContinueMutation,
} from "@/app/redux/instructor-services/courseApi";

interface Lesson {
    _id?: string;
    title: string;
    duration?: string;
    time?: string;
    type?: string;
    lessonType?: string;
    videoUrl?: string;
    pdfUrl?: string;
    pdfFileName?: string;
    description?: string;
    isPreview?: boolean;
    videoSize?: string;
    mcqData?: {
        questions?: Array<{
            question: string;
            options: string[];
            correctOption: number;
            explanation?: string;
        }>;
        duration?: number;
        passingScore?: number;
    };
    completed?: boolean;
}

interface CourseModule {
    _id?: string;
    id?: string | number;
    title: string;
    order?: number;
    lessons?: Lesson[];
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctOption: number;
}

export type AddLessonPayload = {
    courseId: string;
    moduleId: string;
    title: string;
    description?: string;
    videoUrl?: string;
    duration?: string;
    isPreview?: boolean;
    type: "video";
    lessonType: "video";
    pdfUrl?: string;
    pdfFileName?: string;
    mcqData?: Lesson["mcqData"];
};

export type EditLessonPayload = {
    courseId: string;
    moduleId: string;
    lessonId: string;
    title: string;
    description?: string;
    type: "video" | "pdf" | "mcq";
    lessonType: "video" | "pdf" | "mcq";
    videoUrl?: string;
    duration?: string;
    isPreview?: boolean;
    pdfUrl?: string;
    pdfFileName?: string;
    mcqData?: Lesson["mcqData"];
};

const normalizeLessonDuration = (value: unknown): string => {
    if (typeof value === "number") return `${value}`;
    if (typeof value === "string") return value.trim();
    if (value && typeof value === "object") {
        const durationObj = value as { minutes?: unknown; display?: unknown; value?: unknown };
        if (typeof durationObj.minutes === "number") return `${durationObj.minutes}`;
        if (typeof durationObj.display === "string" && durationObj.display.trim()) return durationObj.display.trim();
        if (typeof durationObj.value === "string" && durationObj.value.trim()) return durationObj.value.trim();
        if (typeof durationObj.value === "number") return `${durationObj.value}`;
    }

    return "";
};

export default function Curriculum2() {
    const router = useRouter();
    const params = useParams();

    const courseId = params.id as string;

    const { data: curriculumData, isLoading: isCourseLoading, isError: courseError, refetch } = useGetCurriculumBuilderQuery(
        courseId || skipToken
    );
    const [addModule, { isLoading: isAddingModule }] = useAddModuleMutation();
    const [addLesson, { isLoading: isAddingLesson }] = useAddLessonMutation();
    const [addQuiz, { isLoading: isAddingQuiz }] = useAddQuizMutation();
    const [editLesson, { isLoading: isEditingLesson }] = useEditLessonMutation();
    const [deleteLesson, { isLoading: isDeletingLesson }] = useDeleteLessonMutation();
    const [editModule, { isLoading: isEditingModule }] = useEditModuleMutation();
    const [deleteModule] = useDeleteModuleMutation();
    const [reorderModules] = useReorderModulesMutation();
    const [saveCurriculumAndContinue] = useSaveCurriculumAndContinueMutation();
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [showAddModuleInput, setShowAddModuleInput] = useState(false);
    const [moduleTitle, setModuleTitle] = useState("");
    const [moduleAddedMessage, setModuleAddedMessage] = useState<string | null>(null);
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [editingModuleTitle, setEditingModuleTitle] = useState("");
    const [openLessonModuleId, setOpenLessonModuleId] = useState<string | null>(null);
    const [lessonAddStep, setLessonAddStep] = useState<number>(1);
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [newLessonDescription, setNewLessonDescription] = useState("");
    const [newLessonVideoUrl, setNewLessonVideoUrl] = useState("");
    const [newLessonVideoDuration, setNewLessonVideoDuration] = useState("");
    const [newLessonVideoFile, setNewLessonVideoFile] = useState<File | null>(null);
    const [newLessonIsPreview, setNewLessonIsPreview] = useState(false);
    const [newPdfUrl, setNewPdfUrl] = useState("");
    const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
    const [newPdfFileName, setNewPdfFileName] = useState("");
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [quizDraftQuestion, setQuizDraftQuestion] = useState("");
    const [quizDraftOptions, setQuizDraftOptions] = useState(["", "", "", ""]);
    const [quizDraftCorrectOption, setQuizDraftCorrectOption] = useState(0);
    const [mcqDuration, setMcqDuration] = useState(0);
    const [mcqPassingScore, setMcqPassingScore] = useState(60);
    const [lessonAddedMessage, setLessonAddedMessage] = useState<string | null>(null);
    const [editingLessonModuleId, setEditingLessonModuleId] = useState<string | null>(null);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [editingLessonTitle, setEditingLessonTitle] = useState("");
    const [editingLessonDescription, setEditingLessonDescription] = useState("");
    const [editingLessonVideoUrl, setEditingLessonVideoUrl] = useState("");
    const [editingLessonDuration, setEditingLessonDuration] = useState("");
    const [editingLessonIsPreview, setEditingLessonIsPreview] = useState(false);
    const [editingLessonType, setEditingLessonType] = useState<"video" | "pdf" | "mcq" | null>(null);
    const [editingLessonPdfUrl, setEditingLessonPdfUrl] = useState("");
    const [editingLessonPdfFileName, setEditingLessonPdfFileName] = useState("");
    const [editingLessonMcqData, setEditingLessonMcqData] = useState<any>(null);
    const [lessonActionMessage, setLessonActionMessage] = useState<string | null>(null);
    const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [lastLessonSelection, setLastLessonSelection] = useState<{ moduleId: string; lessonId: string } | null>(null);
    const handleSaveAndContinue = async () => {
        if (!courseId) return;

        if (modules.length === 0 || totalLessons === 0) {
            alert("Please add at least one module and one lesson before continuing.");
            return;
        }

        setLoading(true);

        try {
            await refetch();
            await saveCurriculumAndContinue({ courseId }).unwrap();

            const activeModule = modules.find((module) => module._id === selectedModuleId) || modules[0];
            const activeLesson = activeModule?.lessons?.[0];
            const moduleId = lastLessonSelection?.moduleId || activeModule?._id || String(activeModule?.id ?? "");
            const lessonId = lastLessonSelection?.lessonId || activeLesson?._id || "";

            if (!moduleId || !lessonId) {
                alert("Please add at least one module and one lesson before continuing.");
                return;
            }

            router.push(
                `/instructor/content?courseId=${encodeURIComponent(courseId)}&moduleId=${encodeURIComponent(
                    moduleId
                )}&lessonId=${encodeURIComponent(lessonId)}`
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const nextModules =
            curriculumData?.data?.curriculum ||
            curriculumData?.data?.course?.modules ||
            curriculumData?.data?.modules ||
            [];

        const normalizedModules = Array.isArray(nextModules) ? nextModules : [];
        const sortedModules = [...normalizedModules].sort((left: CourseModule, right: CourseModule) => {
            const leftOrder = typeof left.order === "number" ? left.order : Number.MAX_SAFE_INTEGER;
            const rightOrder = typeof right.order === "number" ? right.order : Number.MAX_SAFE_INTEGER;
            return leftOrder - rightOrder;
        });

        setModules(sortedModules);
    }, [curriculumData]);

    const totalModules = modules.length;
    const totalLessons = modules.reduce((sum: number, module: CourseModule) => sum + (module.lessons?.length ?? 0), 0);
    const allLessons = modules.flatMap((module: CourseModule) => module.lessons ?? []);
    const completedLessons = allLessons.filter((lesson: Lesson) => Boolean(lesson.completed)).length;
    const completionRate = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const estimatedDurationMinutes = allLessons.reduce((sum: number, lesson: Lesson) => {
        const duration = normalizeLessonDuration(lesson.duration ?? lesson.time);
        const match = duration.match(/(\d+)\s*min/i);
        if (match) {
            return sum + Number(match[1]);
        }

        return sum;
    }, 0);
    const formattedDuration = estimatedDurationMinutes > 0
        ? `${Math.floor(estimatedDurationMinutes / 60)}h ${estimatedDurationMinutes % 60}m`
        : "0 min";
    const [loading, setLoading] = useState(false);

    const handleMoveModule = async (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= modules.length) {
            return;
        }

        const reorderedModules = [...modules];
        const [movedModule] = reorderedModules.splice(index, 1);
        reorderedModules.splice(targetIndex, 0, movedModule);

        const normalizedModules = reorderedModules.map((moduleItem, moduleIndex) => ({
            ...moduleItem,
            order: moduleIndex + 1,
        }));

        setModules(normalizedModules);

        try {
            await reorderModules({
                courseId,
                moduleOrder: normalizedModules.map((moduleItem) => String(moduleItem._id || moduleItem.id || "")),
            }).unwrap();
        } catch (err) {
            console.error(err);
            await refetch();
        }
    };

    const toggleModuleCollapse = (moduleId: string) => {
        setCollapsedModules((prev) => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }));
    };

    const handleStartEdit = (module: CourseModule, moduleIndex: number) => {
        setEditingModuleId(module._id || String(module.id ?? moduleIndex));
        setEditingModuleTitle(module.title);
    };

    const handleSaveEdit = async (moduleId: string) => {
        if (!courseId || !moduleId || !editingModuleTitle.trim()) return;
        try {
            await editModule({ courseId, moduleId, title: editingModuleTitle.trim() }).unwrap();
            await refetch();
            setEditingModuleId(null);
            setEditingModuleTitle("");
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (moduleId: string) => {
        if (!courseId || !moduleId) return;
        const confirmed = window.confirm("Delete this module?");
        if (!confirmed) return;
        try {
            await deleteModule({ courseId, moduleId }).unwrap();
            await refetch();
        } catch (err) {
            console.error(err);
        }
    };

    const handleNextLessonStep = () => {
        setLessonAddStep((prev) => Math.min(prev + 1, 6));
    };

    const handlePrevLessonStep = () => {
        setLessonAddStep((prev) => Math.max(prev - 1, 1));
    };

    const handleAddQuizQuestion = () => {
        const question = quizDraftQuestion.trim();
        if (!question) return;
        const hasAllOptions = quizDraftOptions.every((option) => option.trim() !== "");
        if (!hasAllOptions) return;

        setQuizQuestions((prev) => [
            ...prev,
            {
                question,
                options: [...quizDraftOptions],
                correctOption: quizDraftCorrectOption,
            },
        ]);

        setQuizDraftQuestion("");
        setQuizDraftOptions(["", "", "", ""]);
        setQuizDraftCorrectOption(0);
    };

    const handleRemoveQuizQuestion = (index: number) => {
        setQuizQuestions((prev) => prev.filter((_, idx) => idx !== index));
    };

    const clearLessonForm = () => {
        setNewLessonTitle("");
        setNewLessonDescription("");
        setNewLessonVideoUrl("");
        setNewLessonVideoDuration("");
        setNewLessonVideoFile(null);
        setNewLessonIsPreview(false);
        setNewPdfUrl("");
        setNewPdfFile(null);
        setNewPdfFileName("");
        setQuizQuestions([]);
        setQuizDraftQuestion("");
        setQuizDraftOptions(["", "", "", ""]);
        setQuizDraftCorrectOption(0);
        setMcqDuration(0);
        setMcqPassingScore(60);
        setLessonAddedMessage(null);
        setLessonAddStep(1);
    };

    const extractLessonId = (payload: any): string => {
        const candidates = [
            payload?.data?._id,
            payload?.data?.id,
            payload?.data?.lesson?._id,
            payload?.data?.lesson?.id,
            payload?.lesson?._id,
            payload?.lesson?.id,
            payload?._id,
            payload?.id,
        ];

        return candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0) || "";
    };

    const handleAddLesson = async (moduleId: string) => {
        if (!courseId || !moduleId || !newLessonTitle.trim()) return;
        try {
            const hasVideo = Boolean(newLessonVideoUrl || newLessonVideoFile);
            const hasPdf = Boolean(newPdfUrl || newPdfFile);
            const payload: any = {
                courseId,
                moduleId,
                title: newLessonTitle.trim(),
                description: newLessonDescription,
                type: hasVideo ? "video" : hasPdf ? "pdf" : "video",
                lessonType: hasVideo ? "video" : hasPdf ? "pdf" : "video",
                videoUrl: newLessonVideoUrl || undefined,
                duration: newLessonVideoDuration || undefined,
                isPreview: newLessonIsPreview,
                pdfUrl: newPdfUrl || undefined,
                pdfFileName: newPdfFileName || undefined,
            };

            const newLesson = await addLesson(payload).unwrap();
            const lessonId = extractLessonId(newLesson);

            if (lessonId) {
                const lessonEntry: Lesson = {
                    _id: lessonId,
                    title: newLessonTitle.trim(),
                    description: newLessonDescription,
                    duration: newLessonVideoDuration || undefined,
                    type: payload.type,
                    lessonType: payload.lessonType,
                    videoUrl: newLessonVideoUrl || undefined,
                    pdfUrl: newPdfUrl || undefined,
                    pdfFileName: newPdfFileName || undefined,
                    isPreview: newLessonIsPreview,
                };

                setModules((prevModules) => {
                    const moduleIndex = prevModules.findIndex(
                        (moduleItem) => moduleItem._id === moduleId || String(moduleItem.id) === moduleId
                    );

                    if (moduleIndex >= 0) {
                        const nextModules = [...prevModules];
                        const currentModule = nextModules[moduleIndex];
                        nextModules[moduleIndex] = {
                            ...currentModule,
                            lessons: [...(currentModule.lessons ?? []), lessonEntry],
                        };
                        return nextModules;
                    }

                    return [
                        ...prevModules,
                        {
                            _id: moduleId,
                            id: moduleId,
                            title: `Module ${prevModules.length + 1}`,
                            lessons: [lessonEntry],
                        },
                    ];
                });

                setLastLessonSelection({ moduleId, lessonId });
                setSelectedModuleId(moduleId);
                setOpenLessonModuleId(moduleId);
            } else {
                console.warn("Lesson created but no lesson id was returned from the API response.", newLesson);
            }

            if (quizQuestions.length > 0) {
                const quizPayload = {
                    courseId,
                    moduleId,
                    lessonId,
                    title: `${newLessonTitle.trim()} Quiz`,
                    description: `Quiz for ${newLessonTitle.trim()}`,
                    passingMarks: 60,
                    status: "draft",
                    questions: quizQuestions.map((question) => ({
                        question: question.question,
                        options: question.options.map((option, optionIndex) => ({
                            text: option,
                            isCorrect: optionIndex === question.correctOption,
                        })),
                    })),
                };
                try {
                    await addQuiz(quizPayload).unwrap();
                } catch (quizError) {
                    console.error("Quiz creation failed", quizError);
                }
            }

            await refetch();
            setLessonAddedMessage("Lesson added successfully.");
            clearLessonForm();
            setOpenLessonModuleId(null);
        } catch (err) {
            console.error(err);
            setLessonAddedMessage("Error adding lesson. Please try again.");
        }
    };

    const clearLessonEditForm = () => {
        setEditingLessonTitle("");
        setEditingLessonDescription("");
        setEditingLessonVideoUrl("");
        setEditingLessonDuration("");
        setEditingLessonIsPreview(false);
        setEditingLessonType(null);
        setEditingLessonPdfUrl("");
        setEditingLessonPdfFileName("");
        setEditingLessonMcqData(null);
        setLessonActionMessage(null);
    };

    const handleStartLessonEdit = (moduleId: string, lesson: Lesson, lessonIndex: number) => {
        setEditingLessonModuleId(moduleId);
        setEditingLessonId(lesson._id || String(lessonIndex));
        setEditingLessonTitle(lesson.title);
        setEditingLessonDescription((lesson as any).description || "");
        setEditingLessonVideoUrl((lesson as any).videoUrl || "");
        setEditingLessonDuration(normalizeLessonDuration(lesson.duration ?? lesson.time));
        setEditingLessonIsPreview((lesson as any).isPreview ?? false);
        const lessonType = (lesson as any).type || (lesson as any).lessonType || "video";
        setEditingLessonType(lessonType as "video" | "pdf" | "mcq");
        setEditingLessonPdfUrl((lesson as any).pdfUrl || "");
        setEditingLessonPdfFileName((lesson as any).pdfFileName || "");
        setEditingLessonMcqData((lesson as any).mcqData || null);
        setLessonActionMessage(null);
    };

    const handleSaveLessonEdit = async (moduleId: string, lessonId: string) => {
        if (!courseId || !moduleId || !lessonId || !editingLessonTitle.trim() || !editingLessonType) return;
        try {
            const payload: any = {
                courseId,
                moduleId,
                lessonId,
                title: editingLessonTitle.trim(),
                description: editingLessonDescription,
                type: editingLessonType,
                lessonType: editingLessonType,
            };

            if (editingLessonType === "video") {
                payload.videoUrl = editingLessonVideoUrl;
                payload.duration = editingLessonDuration;
                payload.isPreview = editingLessonIsPreview;
            }

            if (editingLessonType === "pdf") {
                payload.pdfUrl = editingLessonPdfUrl;
                payload.pdfFileName = editingLessonPdfFileName;
            }

            if (editingLessonType === "mcq") {
                payload.mcqData = editingLessonMcqData;
            }

            await editLesson(payload).unwrap();
            await refetch();
            setEditingLessonId(null);
            setEditingLessonModuleId(null);
            clearLessonEditForm();
            setLessonActionMessage("Lesson updated successfully.");
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
        if (!courseId || !moduleId || !lessonId) return;
        const confirmed = window.confirm("Delete this lesson?");
        if (!confirmed) return;
        try {
            await deleteLesson({ courseId, moduleId, lessonId }).unwrap();
            await refetch();
        } catch (err) {
            console.error(err);
        }
    };

    if (!courseId) {
        return (
            <div className="min-h-screen bg-[#F8F5F2] dark:bg-[#171717] flex items-center justify-center">
                <p className="text-lg text-[#2D201B] dark:text-[#ededed]">Course ID missing.</p>
            </div>
        );
    }

    if (isCourseLoading) {
        return (
            <div className="min-h-screen bg-[#F8F5F2] dark:bg-[#171717] flex items-center justify-center">
                <p className="text-lg text-[#2D201B] dark:text-[#ededed]">Loading curriculum data...</p>
            </div>
        );
    }

    if (courseError) {
        return (
            <div className="min-h-screen bg-[#F8F5F2] dark:bg-[#171717] flex items-center justify-center">
                <p className="text-lg text-red-600">Unable to load curriculum modules. Please refresh.</p>
            </div>
        );
    }

    const courseTitle = curriculumData?.data?.course?.title || "Untitled course";
    const summary = curriculumData?.data?.summary;
    const totalModulesText = summary?.totalModules ?? totalModules;
    const totalLessonsText = summary?.totalLessons ?? totalLessons;
    const completionText = summary?.completion ?? completionRate;
    const durationText = summary?.estimatedDuration ? `${summary.estimatedDuration} min` : formattedDuration;

    return (
        <div className="min-h-screen bg-[#F8F5F2] dark:bg-[#171717] flex flex-col">

            {/* HEADER */}
            <CurriculumHeader currentStep={2} />

            {/* MAIN */}
            <div className="flex-1 px-4 sm:px-6 lg:px-6 py-6 sm:py-8">

                <h2 className="text-2xl sm:text-[28px] font-serif font-semibold mb-6">
                    Curriculum Builder
                </h2>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

                    {/* LEFT SIDE */}
                    <div className="xl:col-span-8 space-y-6">

                        {modules.length > 0 ? (
                            modules.map((module: CourseModule, moduleIndex: number) => {
                                const moduleKey = module._id || String(module.id ?? moduleIndex);
                                const moduleSelected = selectedModuleId === moduleKey;

                                return (
                                    <div
                                        key={moduleKey}
                                        onClick={() => setSelectedModuleId(moduleKey)}
                                        className={`bg-white border rounded-xl overflow-hidden transition shadow-sm ${moduleSelected ? "border-[#8B4A28] dark:border-[#c9a882] ring-1 ring-[#8B4A28] dark:ring-[#c9a882]" : "border-[#E6DBD3] dark:border-[#374151]"}`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-5 py-4 border-b border-[#EFE4DC] dark:border-[#374151] bg-[#FBF8F6] dark:bg-[#171717]">
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src="/dots.png"
                                                    className="w-3 h-4 mt-1"
                                                    alt="dots"
                                                />
                                                <div className="w-full">
                                                    <p className="text-[11px] tracking-widest text-[#A13636] uppercase">
                                                        MODULE {moduleIndex + 1}
                                                    </p>
                                                    {editingModuleId === (module._id || String(module.id ?? moduleIndex)) ? (
                                                        <div className="mt-2 space-y-2">
                                                            <input
                                                                value={editingModuleTitle}
                                                                onChange={(e) => setEditingModuleTitle(e.target.value)}
                                                                className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm text-[#2D201B] dark:text-[#ededed]"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleSaveEdit(module._id || String(module.id ?? moduleIndex))}
                                                                    disabled={isEditingModule}
                                                                    className="rounded-lg bg-[#8B4A28] dark:bg-[#b86a3a] px-3 py-2 text-sm text-white hover:bg-[#7A3F22] dark:hover:bg-[#a05a30] disabled:opacity-50"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingModuleId(null)}
                                                                    className="rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#FAF6F3] dark:hover:bg-[#171717] dark:bg-[#171717]"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">
                                                            {module.title}
                                                        </h3>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        void handleMoveModule(moduleIndex, "up");
                                                    }}
                                                    disabled={moduleIndex === 0}
                                                    className="w-10 h-10 rounded-full border border-[#D6C6BC] dark:border-[#374151] bg-white flex items-center justify-center text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#F5F2EE] dark:hover:bg-[#1a1a1a] dark:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40"
                                                    type="button"
                                                    aria-label="Move module up"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        void handleMoveModule(moduleIndex, "down");
                                                    }}
                                                    disabled={moduleIndex === modules.length - 1}
                                                    className="w-10 h-10 rounded-full border border-[#D6C6BC] dark:border-[#374151] bg-white flex items-center justify-center text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#F5F2EE] dark:hover:bg-[#1a1a1a] dark:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40"
                                                    type="button"
                                                    aria-label="Move module down"
                                                >
                                                    ↓
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStartEdit(module, moduleIndex);
                                                    }}
                                                    className="w-10 h-10 rounded-full border border-[#D6C6BC] dark:border-[#374151] bg-white flex items-center justify-center text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#F5F2EE] dark:hover:bg-[#1a1a1a] dark:bg-[#1a1a1a]"
                                                    type="button"
                                                >
                                                    <img src="/Edit.png" alt="Edit module" className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(module._id || String(module.id ?? moduleIndex));
                                                    }}
                                                    className="w-10 h-10 rounded-full border border-[#D6C6BC] dark:border-[#374151] bg-white flex items-center justify-center text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#F5F2EE] dark:hover:bg-[#1a1a1a] dark:bg-[#1a1a1a]"
                                                    type="button"
                                                >
                                                    <img src="/delete.png" alt="Delete module" className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleModuleCollapse(module._id || String(module.id ?? moduleIndex));
                                                    }}
                                                >
                                                    <img
                                                        src="/arrow.png"
                                                        alt={collapsedModules[module._id || String(module.id ?? moduleIndex)] ? "Show module" : "Hide module"}
                                                        className={`w-4 h-4 transition-transform ${collapsedModules[module._id || String(module.id ?? moduleIndex)] ? "rotate-180" : ""}`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                        {!collapsedModules[module._id || String(module.id || moduleIndex)] && (
                                            <div className="px-4 sm:px-5 py-2">
                                                {module.lessons && module.lessons.length > 0 && (
                                                    <div className="space-y-3 mb-4">
                                                        {module.lessons.map((lesson: any, lessonIndex: number) => {
                                                            const lessonKey = lesson._id || String(lessonIndex);
                                                            const isEditingThisLesson = editingLessonModuleId === moduleKey && editingLessonId === lessonKey;

                                                            if (isEditingThisLesson) {
                                                                return (
                                                                    <div key={lessonKey} className="rounded-xl border border-[#D6C6BC] dark:border-[#374151] bg-[#FCF8F5] dark:bg-[#1a1a1a] p-4">
                                                                        <div className="flex items-center justify-between mb-4">
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-[#2D201B] dark:text-[#ededed]">Edit Lesson</p>
                                                                                <p className="text-xs text-[#6F5E55] dark:text-[#b89b7d]">{(lesson.type || lesson.lessonType || "video").toUpperCase()}</p>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingLessonModuleId(null);
                                                                                    setEditingLessonId(null);
                                                                                    clearLessonEditForm();
                                                                                }}
                                                                                className="text-sm text-[#6F5E55] dark:text-[#b89b7d] hover:text-[#2D201B] dark:text-[#ededed]"
                                                                                type="button"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>

                                                                        <div className="space-y-4">
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Title</label>
                                                                                <input
                                                                                    value={editingLessonTitle}
                                                                                    onChange={(e) => setEditingLessonTitle(e.target.value)}
                                                                                    className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Description</label>
                                                                                <textarea
                                                                                    value={editingLessonDescription}
                                                                                    onChange={(e) => setEditingLessonDescription(e.target.value)}
                                                                                    rows={3}
                                                                                    className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                                />
                                                                            </div>

                                                                            {editingLessonType === "video" && (
                                                                                <>
                                                                                    <div>
                                                                                        <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Video URL</label>
                                                                                        <input
                                                                                            value={editingLessonVideoUrl}
                                                                                            onChange={(e) => setEditingLessonVideoUrl(e.target.value)}
                                                                                            className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Duration</label>
                                                                                        <input
                                                                                            value={editingLessonDuration}
                                                                                            onChange={(e) => setEditingLessonDuration(e.target.value)}
                                                                                            className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex items-center gap-3">
                                                                                        <input
                                                                                            id="edit-video-preview"
                                                                                            type="checkbox"
                                                                                            checked={editingLessonIsPreview}
                                                                                            onChange={(e) => setEditingLessonIsPreview(e.target.checked)}
                                                                                            className="h-4 w-4 rounded border-[#D6C6BC] dark:border-[#374151]"
                                                                                        />
                                                                                        <label htmlFor="edit-video-preview" className="text-sm text-[#6F5E55] dark:text-[#b89b7d]">Preview lesson</label>
                                                                                    </div>
                                                                                </>
                                                                            )}

                                                                            {editingLessonType === "pdf" && (
                                                                                <>
                                                                                    <div>
                                                                                        <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">PDF URL</label>
                                                                                        <input
                                                                                            value={editingLessonPdfUrl}
                                                                                            onChange={(e) => setEditingLessonPdfUrl(e.target.value)}
                                                                                            className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">PDF File Name</label>
                                                                                        <input
                                                                                            value={editingLessonPdfFileName}
                                                                                            onChange={(e) => setEditingLessonPdfFileName(e.target.value)}
                                                                                            className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                                        />
                                                                                    </div>
                                                                                </>
                                                                            )}

                                                                            {editingLessonType === "mcq" && (
                                                                                <div className="space-y-2">
                                                                                    <p className="text-sm text-[#6F5E55] dark:text-[#b89b7d]">Questions: {editingLessonMcqData?.questions?.length ?? 0}</p>
                                                                                    <p className="text-sm text-[#6F5E55] dark:text-[#b89b7d]">Duration: {editingLessonMcqData?.duration ?? "—"} min</p>
                                                                                    <p className="text-sm text-[#6F5E55] dark:text-[#b89b7d]">Passing Score: {editingLessonMcqData?.passingScore ?? "—"}%</p>
                                                                                </div>
                                                                            )}

                                                                            <div className="flex flex-wrap gap-3 pt-3">
                                                                                <button
                                                                                    onClick={() => handleSaveLessonEdit(moduleKey, lessonKey)}
                                                                                    disabled={isEditingLesson}
                                                                                    className="rounded-lg bg-[#8B4A28] dark:bg-[#b86a3a] px-4 py-2 text-sm text-white hover:bg-[#7A3F22] dark:hover:bg-[#a05a30] disabled:opacity-50"
                                                                                    type="button"
                                                                                >
                                                                                    {isEditingLesson ? "Saving..." : "Save Lesson"}
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingLessonId(null);
                                                                                        setEditingLessonModuleId(null);
                                                                                        clearLessonEditForm();
                                                                                    }}
                                                                                    className="rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#FAF6F3] dark:hover:bg-[#171717] dark:bg-[#171717]"
                                                                                    type="button"
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                            </div>

                                                                            {lessonActionMessage && (
                                                                                <p className="text-sm text-[#1F7A4D]">{lessonActionMessage}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <LessonCard
                                                                    key={lessonKey}
                                                                    lesson={lesson}
                                                                    onEdit={(l) => {
                                                                        handleStartLessonEdit(
                                                                            module._id || String(module.id ?? moduleIndex),
                                                                            l,
                                                                            lessonIndex
                                                                        );
                                                                    }}
                                                                    onDelete={(lessonId) => {
                                                                        handleDeleteLesson(
                                                                            module._id || String(module.id ?? moduleIndex),
                                                                            lessonId
                                                                        );
                                                                    }}
                                                                    isDeleting={isDeletingLesson}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                <div className="mt-3">
                                                    {openLessonModuleId === (module._id || String(module.id ?? moduleIndex)) ? (
                                                        <div className="space-y-4 rounded-xl border border-[#D6C6BC] dark:border-[#374151] p-4 bg-[#FCF8F5] dark:bg-[#1a1a1a]">
                                                            <p className="text-sm font-semibold text-[#2D201B] dark:text-[#ededed]">Add New Lesson</p>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <div className="text-sm text-[#6F5E55] dark:text-[#b89b7d]">Step {lessonAddStep} of 6</div>
                                                                    <div className="text-xs uppercase tracking-[0.15em] text-[#A13636]">Curriculum Wizard</div>
                                                                </div>

                                                                {lessonAddStep === 1 && (
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Lesson Name</label>
                                                                            <input
                                                                                value={newLessonTitle}
                                                                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                                                                placeholder="Enter lesson title"
                                                                                className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Lesson Description</label>
                                                                            <textarea
                                                                                value={newLessonDescription}
                                                                                onChange={(e) => setNewLessonDescription(e.target.value)}
                                                                                rows={4}
                                                                                placeholder="Add a short lesson description"
                                                                                className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {lessonAddStep === 2 && (
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Video URL or upload file</label>
                                                                            <input
                                                                                value={newLessonVideoUrl}
                                                                                onChange={(e) => {
                                                                                    setNewLessonVideoUrl(e.target.value);
                                                                                    if (e.target.value) {
                                                                                        setNewLessonVideoFile(null);
                                                                                    }
                                                                                }}
                                                                                placeholder="https://..."
                                                                                className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <FileUpload
                                                                                label="Or upload video file"
                                                                                accept="video/*"
                                                                                onChange={(file) => {
                                                                                    setNewLessonVideoFile(file);
                                                                                    if (file) {
                                                                                        setNewLessonVideoUrl("");
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Video Duration</label>
                                                                            <input
                                                                                value={newLessonVideoDuration}
                                                                                onChange={(e) => setNewLessonVideoDuration(e.target.value)}
                                                                                placeholder="e.g. 15 min"
                                                                                className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <input
                                                                                id={`lesson-preview-${moduleKey}`}
                                                                                type="checkbox"
                                                                                checked={newLessonIsPreview}
                                                                                onChange={(e) => setNewLessonIsPreview(e.target.checked)}
                                                                                className="h-4 w-4 rounded border-[#D6C6BC] dark:border-[#374151]"
                                                                            />
                                                                            <label htmlFor={`lesson-preview-${moduleKey}`} className="text-sm text-[#6F5E55] dark:text-[#b89b7d]">Mark lesson as preview</label>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {lessonAddStep === 3 && (
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">PDF / Notes URL</label>
                                                                            <input
                                                                                value={newPdfUrl}
                                                                                onChange={(e) => {
                                                                                    setNewPdfUrl(e.target.value);
                                                                                    if (e.target.value) {
                                                                                        setNewPdfFile(null);
                                                                                    }
                                                                                }}
                                                                                placeholder="https://..."
                                                                                className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <FileUpload
                                                                                label="Or upload PDF file"
                                                                                accept="application/pdf"
                                                                                onChange={(file) => {
                                                                                    setNewPdfFile(file);
                                                                                    if (file) {
                                                                                        setNewPdfUrl("");
                                                                                        setNewPdfFileName(file.name);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">PDF File Name</label>
                                                                            <input
                                                                                value={newPdfFileName}
                                                                                onChange={(e) => setNewPdfFileName(e.target.value)}
                                                                                placeholder="e.g. Lesson Notes.pdf"
                                                                                className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {lessonAddStep === 4 && (
                                                                    <div className="space-y-4">
                                                                        <p className="text-sm font-semibold text-[#2D201B] dark:text-[#ededed]">Quiz Setup</p>
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Question</label>
                                                                            <input
                                                                                value={quizDraftQuestion}
                                                                                onChange={(e) => setQuizDraftQuestion(e.target.value)}
                                                                                placeholder="Enter question text"
                                                                                className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                            />
                                                                        </div>
                                                                        <div className="grid grid-cols-1 gap-3">
                                                                            {quizDraftOptions.map((option, idx) => (
                                                                                <div key={idx} className="space-y-2">
                                                                                    <label className="block text-sm text-[#6F5E55] dark:text-[#b89b7d]">Option {idx + 1}</label>
                                                                                    <input
                                                                                        value={option}
                                                                                        onChange={(e) => {
                                                                                            setQuizDraftOptions((prev) => {
                                                                                                const next = [...prev];
                                                                                                next[idx] = e.target.value;
                                                                                                return next;
                                                                                            });
                                                                                        }}
                                                                                        className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Correct Answer</label>
                                                                            <select
                                                                                value={quizDraftCorrectOption}
                                                                                onChange={(e) => setQuizDraftCorrectOption(Number(e.target.value))}
                                                                                className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                            >
                                                                                {quizDraftOptions.map((_, idx) => (
                                                                                    <option key={idx} value={idx}>Option {idx + 1}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleAddQuizQuestion}
                                                                            className="rounded-lg bg-[#8B4A28] dark:bg-[#b86a3a] px-4 py-2 text-sm text-white hover:bg-[#7A3F22] dark:hover:bg-[#a05a30]"
                                                                        >
                                                                            Add Question
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {lessonAddStep === 5 && (
                                                                    <div className="space-y-4">
                                                                        <div className="space-y-3">
                                                                            <p className="text-sm font-semibold text-[#2D201B] dark:text-[#ededed]">Quiz Review</p>
                                                                            <div className="text-sm text-[#6F5E55] dark:text-[#b89b7d]">
                                                                                {quizQuestions.length === 0 ? (
                                                                                    <p>No quiz questions added yet.</p>
                                                                                ) : (
                                                                                    <div className="space-y-3">
                                                                                        {quizQuestions.map((question, questionIndex) => (
                                                                                            <div key={questionIndex} className="rounded-lg border border-[#D6C6BC] dark:border-[#374151] p-3 bg-white">
                                                                                                <p className="text-sm font-semibold text-[#2D201B] dark:text-[#ededed]">{question.question}</p>
                                                                                                <div className="mt-2 space-y-1 text-sm text-[#6F5E55] dark:text-[#b89b7d]">
                                                                                                    {question.options.map((option, optionIndex) => (
                                                                                                        <div key={optionIndex} className={`rounded-md px-2 py-1 ${question.correctOption === optionIndex ? "bg-[#E9F7EF] text-[#1F7A4D]" : "bg-[#F8F5F2] dark:bg-[#171717]"}`}>
                                                                                                            {optionIndex + 1}. {option}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => handleRemoveQuizQuestion(questionIndex)}
                                                                                                    className="mt-2 text-sm text-[#A13636] hover:text-[#7A3F22]"
                                                                                                >
                                                                                                    Remove question
                                                                                                </button>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Quiz Duration (min)</label>
                                                                                <input
                                                                                    type="number"
                                                                                    min={0}
                                                                                    value={mcqDuration}
                                                                                    onChange={(e) => setMcqDuration(Number(e.target.value))}
                                                                                    className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-[#2D201B] dark:text-[#ededed] mb-2">Passing Score (%)</label>
                                                                                <input
                                                                                    type="number"
                                                                                    min={0}
                                                                                    max={100}
                                                                                    value={mcqPassingScore}
                                                                                    onChange={(e) => setMcqPassingScore(Number(e.target.value))}
                                                                                    className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-3 py-2 text-sm"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {lessonAddStep === 6 && (
                                                                    <div className="space-y-4">
                                                                        <p className="text-sm font-semibold text-[#2D201B] dark:text-[#ededed]">Ready to submit</p>
                                                                        <div className="text-sm text-[#6F5E55] dark:text-[#b89b7d] space-y-2">
                                                                            <p><span className="font-semibold">Title:</span> {newLessonTitle || "—"}</p>
                                                                            <p><span className="font-semibold">Description:</span> {newLessonDescription || "—"}</p>
                                                                            <p><span className="font-semibold">Video:</span> {newLessonVideoUrl ? "Yes" : "No"}</p>
                                                                            <p><span className="font-semibold">PDF:</span> {newPdfUrl ? "Yes" : "No"}</p>
                                                                            <p><span className="font-semibold">Quiz Questions:</span> {quizQuestions.length}</p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-wrap gap-3 pt-2">
                                                                    {lessonAddStep > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={handlePrevLessonStep}
                                                                            className="rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-4 py-2 text-sm text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#FAF6F3] dark:hover:bg-[#171717] dark:bg-[#171717]"
                                                                        >
                                                                            Back
                                                                        </button>
                                                                    )}
                                                                    {lessonAddStep < 6 ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleNextLessonStep}
                                                                            disabled={
                                                                                (lessonAddStep === 1 && !newLessonTitle.trim()) ||
                                                                                (lessonAddStep === 2 && !newLessonVideoUrl.trim() && !newLessonVideoFile && !newLessonVideoDuration.trim()) ||
                                                                                (lessonAddStep === 4 && quizQuestions.length === 0)
                                                                            }
                                                                            className="rounded-lg bg-[#8B4A28] dark:bg-[#b86a3a] px-4 py-2 text-sm text-white hover:bg-[#7A3F22] dark:hover:bg-[#a05a30] disabled:opacity-50"
                                                                        >
                                                                            Continue
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleAddLesson(module._id || String(module.id ?? moduleIndex))}
                                                                            disabled={isAddingLesson || !newLessonTitle.trim()}
                                                                            className="rounded-lg bg-[#8B4A28] dark:bg-[#b86a3a] px-4 py-2 text-sm text-white hover:bg-[#7A3F22] dark:hover:bg-[#a05a30] disabled:opacity-50"
                                                                        >
                                                                            {isAddingLesson ? "Adding..." : "Submit Lesson"}
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => {
                                                                            setOpenLessonModuleId(null);
                                                                            clearLessonForm();
                                                                        }}
                                                                        className="rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-4 py-2 text-sm text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#FAF6F3] dark:hover:bg-[#171717] dark:bg-[#171717]"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                                {lessonAddedMessage && (
                                                                    <p className="text-sm text-[#1F7A4D] p-3 bg-green-50 rounded">✓ {lessonAddedMessage}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setOpenLessonModuleId(module._id || String(module.id ?? moduleIndex));
                                                                setLessonAddStep(1);
                                                            }}
                                                            className="w-full border border-dashed border-[#D6C6BC] dark:border-[#374151] py-3 rounded-lg text-sm text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#FAF6F3] dark:hover:bg-[#171717] dark:bg-[#171717] transition flex justify-center items-center gap-2"
                                                        >
                                                            <div className="w-5 h-5 rounded-full border flex items-center justify-center">+
                                                            </div>
                                                            Add Lesson
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-white border border-[#E6DBD3] dark:border-[#374151] rounded-xl flex flex-col items-center justify-center py-6 sm:py-8 px-4 text-center">
                                <p className="text-[#6F5E55] dark:text-[#b89b7d] text-2sm mb-2 font-serif font-bold">
                                    Structure your success
                                </p>
                                <p className="text-xs sm:text-sm text-[#9C8F86] mb-4 max-w-md">
                                    Create modules and lessons to organize your course content for students.
                                </p>
                                <button onClick={() => setShowAddModuleInput(true)} className="bg-[#8B4A28] dark:bg-[#b86a3a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#7A3F22] dark:hover:bg-[#a05a30] transition cursor-pointer">
                                    Add First Module
                                </button>
                            </div>
                        )}

                        {/* ADD MODULE */}
                        {showAddModuleInput ? (
                            <div className="space-y-3">
                                <input
                                    value={moduleTitle}
                                    onChange={(e) => setModuleTitle(e.target.value)}
                                    placeholder="Enter module title"
                                    className="w-full rounded-lg border border-[#D6C6BC] dark:border-[#374151] px-4 py-3 bg-white text-sm text-[#2D201B] dark:text-[#ededed] focus:outline-none focus:border-[#8B4A28] dark:border-[#c9a882]"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={async () => {
                                            if (!courseId || !moduleTitle.trim()) return;
                                            try {
                                                await addModule({ courseId, title: moduleTitle.trim() }).unwrap();
                                                setModuleTitle("");
                                                setShowAddModuleInput(false);
                                                setModuleAddedMessage("Module added successfully.");
                                                await refetch();
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }}
                                        disabled={isAddingModule}
                                        className="flex-1 bg-[#8B4A28] dark:bg-[#b86a3a] text-white py-3 rounded-lg text-sm hover:bg-[#7A3F22] dark:hover:bg-[#a05a30] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {isAddingModule ? "Adding..." : "Add Module"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddModuleInput(false);
                                            setModuleTitle("");
                                        }}
                                        className="flex-1 border border-[#D6C6BC] dark:border-[#374151] py-3 rounded-lg text-sm text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#FAF6F3] dark:hover:bg-[#171717] dark:bg-[#171717] transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {moduleAddedMessage && (
                                    <p className="text-sm text-[#1F7A4D]">{moduleAddedMessage}</p>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setShowAddModuleInput(true);
                                }}
                                className="w-full border border-dashed border-[#D6C6BC] dark:border-[#374151] py-3 rounded-lg text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#FAF6F3] dark:hover:bg-[#171717] dark:bg-[#171717] transition"
                            >
                                + Add Module
                            </button>
                        )}

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="xl:col-span-4 space-y-6">

                        {/* SUMMARY */}
                        <div className="bg-white border border-[#E6DBD3] dark:border-[#374151] rounded-xl p-5 sm:p-4 flex flex-col justify-between gap-5">

                            {/* TOP */}
                            <div>

                                {/* HEADER */}
                                <div className="flex items-center gap-2 mb-5">

                                    <img
                                        src="/Container9.png"
                                        className="w-5 h-5"
                                        alt="summary"
                                    />

                                    <h3 className="text-lg sm:text-[19px] font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">
                                        Course Summary
                                    </h3>

                                </div>

                                {/* DETAILS */}
                                <div className="text-sm sm:text-[16px] text-[#6F5E55] dark:text-[#b89b7d] space-y-4">

                                    <div className="flex justify-between border-b pb-3">
                                        <span>Total Modules</span>
                                        <span className="font-semibold text-[#2D201B] dark:text-[#ededed]">
                                            {totalModules}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-b pb-3">
                                        <span>Total Lessons</span>
                                        <span className="font-semibold text-[#2D201B] dark:text-[#ededed]">
                                            {totalLessons}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-b pb-3">
                                        <span>Est. Duration</span>
                                        <span className="font-semibold text-[#2D201B] dark:text-[#ededed]">
                                            {formattedDuration}
                                        </span>
                                    </div>

                                    <div className="flex justify-between pt-2">
                                        <span>Completion</span>
                                        <span className="font-semibold text-[#8B4A28]">
                                            {completionRate}%
                                        </span>
                                    </div>

                                </div>

                            </div>

                            {/* BUTTONS */}
                            <div>

                                {/* SAVE BUTTON */}
                                                <button
                                    onClick={handleSaveAndContinue}
                                    disabled={loading}
                                    className="w-full bg-[#8B4A28] dark:bg-[#b86a3a] text-white py-3 rounded-lg 
                                    text-sm font-medium
                                    transition-all duration-200
                                    hover:bg-[#7A3F22] dark:hover:bg-[#a05a30]
                                    active:scale-95 active:bg-[#6A341D]
                                    flex items-center justify-center gap-2"
                                >
                                    {loading && (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    )}

                                    {loading ? "Saving..." : "Save & Continue"}

                                </button>

                                {/* PREVIEW BUTTON */}
                                <button onClick={() => alert("Preview coming soon")} className="w-full border border-[#D6C6BC] dark:border-[#374151] mt-3 py-3 rounded-lg text-sm text-[#6F5E55] dark:text-[#b89b7d] hover:bg-[#FAF6F3] dark:hover:bg-[#171717] dark:bg-[#171717] transition">
                                    Preview Curriculum
                                </button>

                            </div>

                        </div>

                        {/* TIPS */}
                        <div className="bg-[#F3E1D6] dark:bg-[#1a1a1a] border border-[#E5CFC2] dark:border-[#374151] rounded-xl p-5">

                            <div className="flex items-center gap-2 mb-5">

                                <img
                                    src="/icon.png"
                                    className="w-4 h-6"
                                    alt="tip"
                                />

                                <h3 className="text-lg sm:text-[21px] font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">
                                    Instructor Tips
                                </h3>


                            </div>

                            <p className="text-sm text-[#6F5E55] dark:text-[#b89b7d] leading-relaxed">
                                Break your modules into 5–15 minute chunks to improve
                                student retention and engagement.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* Lesson Viewers */}

        </div>
    );
}


