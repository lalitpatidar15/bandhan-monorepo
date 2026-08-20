"use client";

import CurriculumHeader from "@/components/common/CurriculumHeader";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useRef, ChangeEvent, useEffect } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetContentPageQuery, useUploadLessonVideoMutation, useUploadLessonResourceMutation, useDeleteLessonResourceMutation, useEditLessonMutation, useSaveLessonDraftMutation, useSaveLessonAndContinueMutation } from "@/app/redux/instructor-services/courseApi";

function ContentPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [resources, setResources] = useState<Array<any>>([]);
    const [isMarked, setIsMarked] = useState(false);
    const [activeExtraSection, setActiveExtraSection] = useState<"resources" | "pdf" | "mcq">("resources");
    const [pdfFileName, setPdfFileName] = useState("");
    const [mcqQuestions, setMcqQuestions] = useState<Array<{ question: string; options: string[]; correctOption: number; explanation?: string }>>([
        { question: "", options: ["", "", "", ""], correctOption: 0, explanation: "" },
    ]);
    const [mcqDuration, setMcqDuration] = useState(0);
    const [mcqPassingScore, setMcqPassingScore] = useState(60);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSavingPdf, setIsSavingPdf] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [videoFileName, setVideoFileName] = useState("");
    const [lessonSettingsTitle, setLessonSettingsTitle] = useState("");
    const [lessonSettingsDescription, setLessonSettingsDescription] = useState("");
    const [lessonSettingsDuration, setLessonSettingsDuration] = useState("");
    const [uploadLessonVideo, { isLoading: videoUploadLoading }] = useUploadLessonVideoMutation();
    const [uploadLessonResource, { isLoading: resourceLoading }] = useUploadLessonResourceMutation();
    const [deleteLessonResource] = useDeleteLessonResourceMutation();
    const [saveLessonDraft] = useSaveLessonDraftMutation();
    const [saveLessonAndContinue] = useSaveLessonAndContinueMutation();
    const [editLesson, { isLoading: isEditingLesson }] = useEditLessonMutation();

    const courseId = searchParams.get("courseId");
    const moduleId = searchParams.get("moduleId");
    const lessonId = searchParams.get("lessonId");
    const hasLessonContext = Boolean(courseId && moduleId && lessonId);
    const maxVideoSizeMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || 50);

    const {
        data: contentPageData,
        isLoading: isContentLoading,
        isError: isContentError,
        refetch,
    } = useGetContentPageQuery(
        courseId && moduleId && lessonId
            ? { courseId, moduleId, lessonId }
            : skipToken
    );

    const lesson = contentPageData?.data?.lesson;
    const uploadChecklist = contentPageData?.data?.uploadChecklist;
    const preview = contentPageData?.data?.preview;

    const rawLessonType = preview?.type || lesson?.type || lesson?.lessonType;
    const normalizedLessonType =
        typeof rawLessonType === "string"
            ? rawLessonType.toLowerCase()
            : "";
    const lessonType = (
        normalizedLessonType === "video" ||
            normalizedLessonType === "pdf" ||
            normalizedLessonType === "mcq"
            ? normalizedLessonType
            : lesson?.mcqData
                ? "mcq"
                : lesson?.pdfUrl
                    ? "pdf"
                    : "video"
    ) as "video" | "pdf" | "mcq";

    const lessonVideoUrl = preview?.videoUrl || lesson?.videoUrl;
    const hasVideoUploaded = Boolean(lessonVideoUrl);
    const videoTitle = preview?.title || lesson?.title || (hasVideoUploaded ? "Uploaded video" : "No video selected");
    const videoDurationLabel = preview?.duration || lesson?.duration || lesson?.time || "—";
    const videoProgressPercent = isUploadingVideo ? videoUploadProgress : hasVideoUploaded ? 100 : 0;
    const videoSizeText = isUploadingVideo
        ? `${videoUploadProgress}% uploaded`
        : hasVideoUploaded
            ? lesson?.videoSize
                ? `${lesson.videoSize}MB / ${lesson.videoSize}MB`
                : "100% uploaded"
            : "No video uploaded";
    const lessonVideoLabel = videoFileName || lesson?.videoFileName || lesson?.fileName || lesson?.videoName || (hasVideoUploaded ? "Uploaded video" : "No video selected");
    const lessonDisplayTitle = lessonSettingsTitle.trim() || lesson?.title || preview?.title || "Untitled lesson";
    const lessonDisplayDescription = lessonSettingsDescription.trim() || lesson?.description || preview?.description || "Add a short description to guide the student.";
    const lessonDisplayDuration = lessonSettingsDuration.trim()
        || (typeof (preview?.duration || lesson?.duration || lesson?.time) === "object"
            ? (preview?.duration || lesson?.duration || lesson?.time)?.display || "—"
            : (preview?.duration || lesson?.duration || lesson?.time) || "—");
    const lessonPreviewEnabled = Boolean(lesson?.isPreview ?? preview?.isPreview ?? false);

    const lessonPdfName = pdfFileName || lesson?.pdfFileName || (lesson?.pdfUrl ? "PDF attached" : "No PDF attached");
    const quizDurationLabel = lesson?.mcqData?.duration ?? mcqDuration ?? 0;
    const quizPassingScoreLabel = lesson?.mcqData?.passingScore ?? mcqPassingScore ?? 60;
    const quizQuestionCount = lesson?.mcqData?.questions?.length ?? mcqQuestions.filter((q) => q.question.trim()).length;
    const attachedResourcesCount = resources.length;
    const hasPdfAttached = Boolean(pdfFileName || lesson?.pdfFileName || lesson?.pdfUrl);
    const hasQuizReady = quizQuestionCount > 0;
    const statusItems = [
        { label: "Lesson details added", done: Boolean(lessonDisplayTitle && lessonDisplayTitle !== "Untitled lesson") },
        { label: hasVideoUploaded ? "Video uploaded" : "Video pending", done: hasVideoUploaded },
        { label: hasPdfAttached ? "PDF attached" : "PDF pending", done: hasPdfAttached },
        { label: attachedResourcesCount > 0 ? `Resources added (${attachedResourcesCount})` : "Resources pending", done: attachedResourcesCount > 0 },
        // { label: hasQuizReady ? "Quiz ready" : "Quiz pending", done: hasQuizReady },
    ];

    const handleSaveDraft = async () => {
        if (!courseId || !moduleId || !lessonId) {
            alert("Missing course/module/lesson identifiers.");
            return;
        }

        try {
            setLoading(true);
            await saveLessonDraft({
                courseId,
                moduleId,
                lessonId,
                title: lessonSettingsTitle.trim() || lesson?.title || undefined,
                description: lessonSettingsDescription.trim() || lesson?.description || undefined,
                duration: lessonSettingsDuration.trim() || undefined,
                isPreview: lesson?.isPreview ?? false,
            }).unwrap();
            setSaveMessage("Draft saved successfully.");
            await refetch();
        } catch (err: any) {
            console.error(err);
            alert(err?.data?.message || err?.message || "Unable to save draft.");
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = async () => {
        if (!courseId || !moduleId || !lessonId) {
            alert("Missing course/module/lesson identifiers.");
            return;
        }

        try {
            setLoading(true);
            await saveLessonAndContinue({
                courseId,
                moduleId,
                lessonId,
                title: lessonSettingsTitle.trim() || lesson?.title || undefined,
                description: lessonSettingsDescription.trim() || lesson?.description || undefined,
                duration: lessonSettingsDuration.trim() || undefined,
                isPreview: lesson?.isPreview ?? false,
            }).unwrap();
            router.push(`/instructor/pricing?courseId=${encodeURIComponent(courseId)}`);
        } catch (err: any) {
            console.error(err);
            alert(err?.data?.message || err?.message || "Unable to save and continue.");
        } finally {
            setLoading(false);
        }
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const pdfInputRef = useRef<HTMLInputElement | null>(null);
    const videoInputRef = useRef<HTMLInputElement | null>(null);

    const triggerAddResource = () => {
        setActiveExtraSection("resources");
        fileInputRef.current?.click();
    };

    const triggerAddPdf = () => {
        setActiveExtraSection("pdf");
        pdfInputRef.current?.click();
    };

    const triggerAddVideo = () => {
        videoInputRef.current?.click();
    };

    const handleSaveVideo = async (file: File) => {
        if (!courseId || !moduleId || !lessonId) {
            alert("Missing course/module/lesson identifiers.");
            return;
        }

        const isVideoFile = file.type.startsWith("video/") || /\.(mp4|mov|avi|webm)$/i.test(file.name);
        if (!isVideoFile) {
            alert("Please select an MP4, MOV, AVI, or WEBM video.");
            return;
        }
        if (file.size > maxVideoSizeMb * 1024 * 1024) {
            alert(`This video is larger than the ${maxVideoSizeMb} MB upload limit.`);
            return;
        }

        setIsUploadingVideo(true);
        setVideoUploadProgress(10);
        setSaveMessage("Uploading video...");

        const progressTimer = window.setInterval(() => {
            setVideoUploadProgress((prev) => (prev >= 90 ? 90 : prev + 15));
        }, 220);

        try {
            const result: any = await uploadLessonVideo({ courseId, moduleId, lessonId, file }).unwrap();
            const created = result?.data || result;
            const uploadedVideoUrl = created.videoUrl || created.fileUrl || created.url || created.resourceUrl || file.name;

            await editLesson({
                courseId,
                moduleId,
                lessonId,
                type: lesson?.type || "video",
                lessonType: lesson?.lessonType || "video",
                title: lesson?.title || "",
                description: lesson?.description || "",
                videoUrl: uploadedVideoUrl,
                duration: lesson?.duration || lesson?.time,
                isPreview: lesson?.isPreview,
                pdfUrl: lesson?.pdfUrl,
                pdfFileName: lesson?.pdfFileName,
                mcqData: lesson?.mcqData,
            }).unwrap();

            setVideoFileName(file.name);
            setVideoUploadProgress(100);
            setSaveMessage("Video uploaded and saved to lesson.");
            await refetch();
        } catch (err: any) {
            console.error(err);
            setVideoUploadProgress(0);
            alert(err?.data?.message || err?.message || "Video upload failed");
        } finally {
            window.clearInterval(progressTimer);
            setIsUploadingVideo(false);
            if (videoInputRef.current) videoInputRef.current.value = "";
        }
    };

    const handleVideoFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await handleSaveVideo(file);
    };

    const handleResourceFile = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!courseId || !moduleId || !lessonId) {
            alert("Missing course/module/lesson identifiers.");
            return;
        }

        try {
            const result: any = await uploadLessonResource({ courseId, moduleId, lessonId, file }).unwrap();
            const created = result?.data || result;
            setResources((prev) => [...prev, created]);
            setSaveMessage("Resource uploaded successfully.");
            await refetch();
        } catch (err: any) {
            alert(err?.data?.message || err?.message || "Upload failed");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteResource = async (resourceId: string) => {
        if (!courseId || !moduleId || !lessonId || !resourceId) {
            alert("Missing course/module/lesson/resource identifiers.");
            return;
        }

        const confirmed = window.confirm("Delete this resource?");
        if (!confirmed) return;

        try {
            await deleteLessonResource({ courseId, moduleId, lessonId, resourceId }).unwrap();
            setResources((prev) => prev.filter((resource) => {
                if (typeof resource === "string") return resource !== resourceId;
                return resource?._id !== resourceId && resource?.id !== resourceId;
            }));
            setSaveMessage("Resource deleted successfully.");
            await refetch();
        } catch (err: any) {
            console.error(err);
            alert(err?.data?.message || err?.message || "Unable to delete resource.");
        }
    };

    const handleSavePdf = async (file: File) => {
        if (!courseId || !moduleId || !lessonId) {
            alert("Missing course/module/lesson identifiers.");
            return;
        }

        if (file.type !== "application/pdf") {
            alert("Please select a PDF file.");
            return;
        }

        setIsSavingPdf(true);
        try {
            const result: any = await uploadLessonResource({ courseId, moduleId, lessonId, file }).unwrap();
            const created = result?.data || result;
            const uploadedPdfUrl = created.fileUrl || created.url || created.pdfUrl || created.resourceUrl || file.name;
            await editLesson({
                courseId,
                moduleId,
                lessonId,
                type: lesson?.type || "video",
                lessonType: lesson?.lessonType || "video",
                title: lesson?.title || "",
                description: lesson?.description || "",
                videoUrl: lessonVideoUrl || lesson?.videoUrl,
                duration: lesson?.duration || lesson?.time,
                isPreview: lesson?.isPreview,
                pdfUrl: uploadedPdfUrl,
                pdfFileName: file.name,
                mcqData: lesson?.mcqData,
            }).unwrap();
            setPdfFileName(file.name);
            setSaveMessage("PDF uploaded and saved to lesson.");
            await refetch();
        } catch (err: any) {
            alert(err?.data?.message || err?.message || "PDF save failed");
        } finally {
            setIsSavingPdf(false);
            if (pdfInputRef.current) pdfInputRef.current.value = "";
        }
    };

    const handlePdfFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/pdf") {
            alert("Please select a PDF file.");
            if (pdfInputRef.current) pdfInputRef.current.value = "";
            return;
        }

        await handleSavePdf(file);
    };

    const handleSaveMcq = async () => {
        if (!courseId || !moduleId || !lessonId) {
            alert("Missing course/module/lesson identifiers.");
            return;
        }

        if (mcqQuestions.some((q) => !q.question.trim())) {
            alert("Please fill in all MCQ questions before saving.");
            return;
        }

        try {
            await editLesson({
                courseId,
                moduleId,
                lessonId,
                type: lesson?.type || "video",
                lessonType: lesson?.lessonType || "video",
                title: lesson?.title || "",
                description: lesson?.description || "",
                videoUrl: lessonVideoUrl || lesson?.videoUrl,
                duration: lesson?.duration || lesson?.time,
                isPreview: lesson?.isPreview,
                pdfUrl: lesson?.pdfUrl,
                pdfFileName: lesson?.pdfFileName,
                mcqData: {
                    questions: mcqQuestions,
                    duration: mcqDuration,
                    passingScore: mcqPassingScore,
                },
            }).unwrap();
            setSaveMessage("MCQ saved successfully.");
            await refetch();
        } catch (err: any) {
            console.error(err);
            alert(err?.data?.message || err?.message || "Unable to save MCQ.");
        }
    };

    const handleAddMcqQuestion = () => {
        setMcqQuestions((prev) => [
            ...prev,
            { question: "", options: ["", "", "", ""], correctOption: 0, explanation: "" },
        ]);
    };

    const handleUpdateMcqQuestion = (index: number, field: string, value: any) => {
        setMcqQuestions((prev) =>
            prev.map((question, idx) =>
                idx !== index ? question : { ...question, [field]: value }
            )
        );
    };

    const handleUpdateMcqOption = (questionIndex: number, optionIndex: number, value: string) => {
        setMcqQuestions((prev) =>
            prev.map((question, idx) => {
                if (idx !== questionIndex) return question;
                const options = [...question.options];
                options[optionIndex] = value;
                return { ...question, options };
            })
        );
    };

    const handleRemoveMcqQuestion = (index: number) => {
        setMcqQuestions((prev) => prev.filter((_, idx) => idx !== index));
    };

    const renderUploadSection = () => {
        if (lessonType === "pdf") {
            return (
                <>
                    <div className="border-2 border-dashed border-[#E7CFC2] dark:border-[#374151] rounded-xl p-4 sm:p-4 text-center bg-[#F9F4F1] dark:bg-[#1a1a1a]">

                        <img
                            src="/Background0.png"
                            className="mx-auto mb-3 w-14 h-14 sm:w-16 sm:h-16"
                            alt="upload"
                        />

                        <p className="text-base sm:text-xl text-[#6F5E55] dark:text-[#b89b7d] font-semibold mb-1 leading-relaxed">
                            Drag & drop your PDF here or click to upload
                        </p>

                        <p className="text-xs sm:text-sm text-[#A08F86] dark:text-[#7a6a5a]">
                            Supported formats: PDF (Max 500MB)
                        </p>

                        <button onClick={triggerAddPdf} className="mt-5 bg-[#8B4A28] dark:bg-[#b86a3a] text-white px-5 py-2 rounded-lg hover:scale-105 active:scale-95 transition">
                            Upload PDF
                        </button>

                    </div>

                    <div className="mt-5 bg-[#F9F4F1] dark:bg-[#1a1a1a] p-4 rounded-lg">

                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm mb-2">

                            <span className="break-all">
                                {preview?.pdfFileName || lesson?.pdfFileName || "Lesson_Document.pdf"}
                            </span>

                            <span onClick={() => alert("Remove PDF")} className="text-[#C46A4A] cursor-pointer">
                                Remove
                            </span>

                        </div>

                        <div className="w-full bg-[#E6DBD3] dark:bg-[#2a2a2a] h-2 rounded-full">
                            <div className="bg-[#8B4A28] dark:bg-[#b86a3a] h-2 w-[60%] rounded-full"></div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs mt-2 text-[#8A7A71] dark:text-[#7a6a5a]">

                            <span>
                                PDF ready for preview • 1 file attached
                            </span>

                            <span>
                                {lesson?.pdfFileName ? "Uploaded" : "Pending"}
                            </span>

                        </div>

                    </div>
                </>
            );
        }

        if (lessonType === "mcq") {
            const mcqData = lesson?.mcqData || preview?.mcqData;
            const questionCount = mcqData?.questions?.length ?? 0;
            const durationLabel = mcqData?.duration ?? "—";
            const passingScoreLabel = mcqData?.passingScore ?? "—";

            return (
                <>
                    <div className="border-2 border-dashed border-[#E7CFC2] dark:border-[#374151] rounded-xl p-4 sm:p-4 text-center bg-[#F9F4F1] dark:bg-[#1a1a1a]">

                        <img
                            src="/Background0.png"
                            className="mx-auto mb-3 w-14 h-14 sm:w-16 sm:h-16"
                            alt="quiz"
                        />

                        <p className="text-base sm:text-xl text-[#6F5E55] dark:text-[#b89b7d] font-semibold mb-1 leading-relaxed">
                            Create or upload your quiz questions here
                        </p>

                        <p className="text-xs sm:text-sm text-[#A08F86] dark:text-[#7a6a5a]">
                            Add multiple choice questions, set duration, and passing score.
                        </p>

                        <button onClick={() => alert("Edit questions coming soon")} className="mt-5 bg-[#8B4A28] dark:bg-[#b86a3a] text-white px-5 py-2 rounded-lg hover:scale-105 active:scale-95 transition">
                            Edit Questions
                        </button>

                    </div>

                    <div className="mt-5 bg-[#F9F4F1] dark:bg-[#1a1a1a] p-4 rounded-lg">

                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm mb-2">

                            <span className="break-all">
                                {lesson?.title || preview?.title || "MCQ Lesson"}
                            </span>

                            <span className="text-[#C46A4A] cursor-pointer">
                                Preview
                            </span>

                        </div>

                        <div className="grid sm:grid-cols-3 gap-3 text-xs mt-3 text-[#8A7A71] dark:text-[#7a6a5a]">
                            <div className="bg-white p-3 rounded-lg border border-[#E6DBD3] dark:border-[#374151]">
                                <p className="font-semibold text-[#2D201B] dark:text-[#ededed]">Questions</p>
                                <p>{questionCount}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-[#E6DBD3] dark:border-[#374151]">
                                <p className="font-semibold text-[#2D201B] dark:text-[#ededed]">Duration</p>
                                <p>{durationLabel} min</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-[#E6DBD3] dark:border-[#374151]">
                                <p className="font-semibold text-[#2D201B] dark:text-[#ededed]">Passing Score</p>
                                <p>{passingScoreLabel}%</p>
                            </div>
                        </div>

                    </div>
                </>
            );
        }

        return (
            <>
                <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                />

                <div className="border-2 border-dashed border-[#E7CFC2] dark:border-[#374151] rounded-xl p-4 sm:p-4 text-center bg-[#F9F4F1] dark:bg-[#1a1a1a]">
                    <img
                        src="/Background0.png"
                        className="mx-auto mb-3 w-14 h-14 sm:w-16 sm:h-16"
                        alt="upload"
                    />

                    <p className="text-base sm:text-xl text-[#6F5E55] dark:text-[#b89b7d] font-semibold mb-1 leading-relaxed">
                        {hasVideoUploaded ? "Replace the lesson video" : "Drag & drop your video here or click to upload"}
                    </p>

                    <p className="text-xs sm:text-sm text-[#A08F86] dark:text-[#7a6a5a]">
                        Supported formats: MP4, MOV, AVI, WEBM (Max {maxVideoSizeMb}MB)
                    </p>

                    <button
                        onClick={triggerAddVideo}
                        disabled={isUploadingVideo}
                        className="mt-5 bg-[#8B4A28] dark:bg-[#b86a3a] text-white px-5 py-2 rounded-lg hover:scale-105 active:scale-95 transition disabled:opacity-60"
                    >
                        {isUploadingVideo ? "Uploading..." : hasVideoUploaded ? "Change Video" : "Upload Video"}
                    </button>
                </div>

                <div className="mt-5 bg-[#F9F4F1] dark:bg-[#1a1a1a] p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm mb-2">
                        <span className="break-all font-semibold text-[#2D201B] dark:text-[#ededed]">
                            {lessonVideoLabel}
                        </span>
                        <span className="text-[#C46A4A] cursor-pointer">
                            {hasVideoUploaded ? <span onClick={() => alert("Replace video")}>Replace</span> : "Pending"}
                        </span>
                    </div>

                    <div className="w-full bg-[#E6DBD3] dark:bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                        <div className={`bg-[#8B4A28] dark:bg-[#b86a3a] h-2 rounded-full`} style={{ width: `${videoProgressPercent}%` }}></div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs mt-2 text-[#8A7A71] dark:text-[#7a6a5a]">
                        <span>
                            {isUploadingVideo ? "Uploading video..." : hasVideoUploaded ? "Upload complete" : "No video uploaded yet."}
                        </span>
                        <span>{videoSizeText}</span>
                    </div>
                </div>
            </>
        );
    };

    useEffect(() => {
        const existing: any[] = lesson?.resources || [];
        setResources(existing);
        setPdfFileName(lesson?.pdfFileName || "");

        if (lesson?.mcqData?.questions?.length) {
            setMcqQuestions(lesson.mcqData.questions);
            setMcqDuration(lesson.mcqData.duration || 0);
            setMcqPassingScore(lesson.mcqData.passingScore || 60);
        }

        setVideoFileName(lesson?.videoFileName || lesson?.videoName || lesson?.fileName || "");
        setVideoUploadProgress(lesson?.videoUrl || lesson?.videoFileName || lesson?.videoName || lesson?.fileName ? 100 : 0);
        setLessonSettingsTitle(lesson?.title || preview?.title || "");
        setLessonSettingsDescription(lesson?.description || preview?.description || "");
        setLessonSettingsDuration(typeof (lesson?.duration ?? lesson?.time ?? preview?.duration) === "object"
            ? (lesson?.duration ?? lesson?.time ?? preview?.duration)?.display || ""
            : String(lesson?.duration ?? lesson?.time ?? preview?.duration ?? ""));
    }, [lesson, preview]);

    if (!hasLessonContext) {
        return (
            <div className="min-h-screen bg-[#F8F5F2] dark:bg-[#171717]">
                <CurriculumHeader currentStep={3} />
                <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-4 py-10">
                    <section className="w-full rounded-2xl border border-[#E8DDD5] bg-white p-7 text-center shadow-sm">
                        <h1 className="font-serif text-3xl font-semibold text-[#2D201B]">Choose a lesson before uploading</h1>
                        <p className="mt-3 text-sm leading-6 text-[#6F5E55]">
                            Content belongs to a specific lesson. Start from a course curriculum, add or select a lesson, then continue here to upload its video and resources.
                        </p>
                        <button type="button" onClick={() => router.push("/instructor/curriculum")} className="mt-6 rounded-lg bg-[#8B4A28] px-5 py-3 text-sm font-semibold text-white hover:bg-[#713719]">
                            Go to course setup
                        </button>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F5F2] dark:bg-[#171717] flex flex-col overflow-x-hidden">

            {/* HEADER */}
            <CurriculumHeader currentStep={3} />

            {/* MAIN CONTENT */}
            <div className="w-full px-4 sm:px-6 lg:px-6 py-6 sm:py-8">

                {isContentError && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        Unable to load content page details. Please verify the selected lesson.
                    </div>
                )}
                {isContentLoading && (
                    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                        Loading lesson content details...
                    </div>
                )}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                    {/* ================= LEFT ================= */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* VIDEO UPLOAD */}
                        <div className="bg-white rounded-2xl p-4 sm:p-4 border border-[#E8DDD5] dark:border-[#374151]">

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                                <h2 className="text-2xl sm:text-[28px] font-serif font-semibold mb-6">
                                    {lessonType === "pdf"
                                        ? "PDF Upload"
                                        : lessonType === "mcq"
                                            ? "MCQ Setup"
                                            : "Video Upload"}
                                </h2>

                            </div>

                            {renderUploadSection()}

                        </div>

                        {/* ADDITIONAL CONTENT */}
                        <div className="bg-white rounded-2xl p-4 sm:p-4 border border-[#E8DDD5] dark:border-[#374151]">

                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">

                                <h2 className="text-xl sm:text-2xl md:text-[28px] font-serif font-semibold">
                                    Additional Content
                                </h2>

                                {/* <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: "resources", label: "Resources" },
                                        { id: "pdf", label: "PDF Notes" },
                                        { id: "mcq", label: "MCQ Quiz" },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveExtraSection(tab.id as "resources" | "pdf" | "mcq")}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${activeExtraSection === tab.id
                                                    ? "bg-[#8B4A28] dark:bg-[#b86a3a] text-white"
                                                    : "bg-[#F3EAE4] dark:bg-[#1a1a1a] text-[#8B4A28] hover:bg-[#E8D2C1] dark:hover:bg-[#2a2a2a]"
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div> */}
                            </div>

                            <div className="space-y-4">
                                {activeExtraSection === "resources" && (
                                    <>
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="text-sm text-[#6F5E55] dark:text-[#b89b7d]">Upload lesson resources like documents and files.</p>
                                            <button
                                                onClick={triggerAddResource}
                                                className="text-sm text-[#8B4A28] font-semibold"
                                            >
                                                {resourceLoading ? "Uploading..." : "+ Add Resource"}
                                            </button>
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="*/*"
                                            onChange={handleResourceFile}
                                            className="hidden"
                                        />

                                        {resources.length === 0 ? (
                                            <div className="rounded-lg border border-dashed border-[#D8CAC1] bg-[#FCF9F7] p-5 text-sm text-[#6F5E55]">
                                                No resources have been uploaded for this lesson yet.
                                            </div>
                                        ) : resources.map((r: any, idx: number) => {
                                            const name = typeof r === "string" ? r : r.fileName || r.fileUrl || `resource-${idx}`;
                                            return (
                                                <div
                                                    key={name + idx}
                                                    className="flex items-center justify-between gap-3 bg-[#F9F4F1] dark:bg-[#1a1a1a] p-4 sm:p-5 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <img src="/Background1.png" className="w-10 shrink-0" alt="file" />
                                                        <p className="text-sm sm:text-base truncate">{name}</p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const resourceId = typeof r === "string" ? r : r?._id || r?.id;
                                                            if (resourceId) {
                                                                handleDeleteResource(resourceId);
                                                            }
                                                        }}
                                                        className="shrink-0"
                                                    >
                                                        <img src="/Container.png" className="w-4 h-4 cursor-pointer" alt="delete" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}

                                {activeExtraSection === "pdf" && (
                                    <>
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="text-sm text-[#6F5E55] dark:text-[#b89b7d]">Upload PDF notes for this lesson.</p>
                                            <button
                                                onClick={triggerAddPdf}
                                                className="text-sm text-[#8B4A28] font-semibold"
                                            >
                                                {pdfFileName ? "Replace PDF" : "+ Upload PDF"}
                                            </button>
                                        </div>

                                        <input
                                            ref={pdfInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handlePdfFileChange}
                                            className="hidden"
                                        />

                                        {pdfFileName ? (
                                            <div className="bg-[#F9F4F1] dark:bg-[#1a1a1a] p-4 rounded-lg border border-[#E6DBD3] dark:border-[#374151]">
                                                <p className="text-sm text-[#2D201B] dark:text-[#ededed]">PDF attached to lesson:</p>
                                                <p className="text-sm font-medium mt-1">{pdfFileName}</p>
                                            </div>
                                        ) : (
                                            <div className="bg-[#FFF4E7] p-4 rounded-lg border border-[#F2D7C5] text-sm text-[#6F4A26]">
                                                Upload a PDF note to attach with this lesson.
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeExtraSection === "mcq" && (
                                    <>
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="text-sm text-[#6F5E55] dark:text-[#b89b7d]">Create or edit the MCQ quiz for this lesson.</p>
                                            <button
                                                onClick={handleSaveMcq}
                                                disabled={isEditingLesson}
                                                className="text-sm text-[#8B4A28] font-semibold"
                                            >
                                                {isEditingLesson ? "Saving..." : "Save MCQ"}
                                            </button>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-[#8A7A71] dark:text-[#7a6a5a] mb-1">Quiz Duration (min)</p>
                                                <input
                                                    type="number"
                                                    value={mcqDuration}
                                                    onChange={(e) => setMcqDuration(Number(e.target.value) || 0)}
                                                    className="w-full border border-[#E6DBD3] dark:border-[#374151] rounded-lg p-3 bg-[#F9F4F1] dark:bg-[#1a1a1a] outline-none text-[#2D201B] dark:text-[#ededed] focus:border-[#8B4A28]"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#8A7A71] dark:text-[#7a6a5a] mb-1">Passing Score (%)</p>
                                                <input
                                                    type="number"
                                                    value={mcqPassingScore}
                                                    onChange={(e) => setMcqPassingScore(Number(e.target.value) || 0)}
                                                    className="w-full border border-[#E6DBD3] dark:border-[#374151] rounded-lg p-3 bg-[#F9F4F1] dark:bg-[#1a1a1a] outline-none text-[#2D201B] dark:text-[#ededed] focus:border-[#8B4A28]"
                                                />
                                            </div>
                                        </div>

                                        {mcqQuestions.map((question, questionIndex) => (
                                            <div key={questionIndex} className="bg-[#F9F4F1] dark:bg-[#1a1a1a] rounded-lg p-4 border border-[#E6DBD3] dark:border-[#374151]">
                                                <div className="flex justify-between items-start gap-4 mb-3">
                                                    <p className="text-sm font-semibold text-[#2D201B] dark:text-[#ededed]">Question {questionIndex + 1}</p>
                                                    <button
                                                        onClick={() => handleRemoveMcqQuestion(questionIndex)}
                                                        className="text-sm text-[#A13636] hover:text-[#7A0324]"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <input
                                                    type="text"
                                                    value={question.question}
                                                    onChange={(e) => handleUpdateMcqQuestion(questionIndex, "question", e.target.value)}
                                                    placeholder="Enter question"
                                                    className="w-full border border-[#E6DBD3] dark:border-[#374151] rounded-lg p-3 mb-3 bg-white outline-none text-[#2D201B] dark:text-[#ededed] focus:border-[#8B4A28]"
                                                />

                                                <div className="space-y-3">
                                                    {question.options.map((option, optionIndex) => (
                                                        <div key={optionIndex} className="flex items-center gap-3">
                                                            <input
                                                                type="radio"
                                                                checked={question.correctOption === optionIndex}
                                                                onChange={() => handleUpdateMcqQuestion(questionIndex, "correctOption", optionIndex)}
                                                                className="w-4 h-4"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={option}
                                                                onChange={(e) => handleUpdateMcqOption(questionIndex, optionIndex, e.target.value)}
                                                                placeholder={`Option ${optionIndex + 1}`}
                                                                className="flex-1 border border-[#E6DBD3] dark:border-[#374151] rounded-lg p-3 bg-white outline-none text-[#2D201B] dark:text-[#ededed] focus:border-[#8B4A28]"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <textarea
                                                    value={question.explanation || ""}
                                                    onChange={(e) => handleUpdateMcqQuestion(questionIndex, "explanation", e.target.value)}
                                                    placeholder="Explanation (optional)"
                                                    rows={3}
                                                    className="w-full border border-[#E6DBD3] dark:border-[#374151] rounded-lg p-3 mt-3 bg-white outline-none text-[#2D201B] dark:text-[#ededed] focus:border-[#8B4A28]"
                                                />
                                            </div>
                                        ))}

                                        <button
                                            onClick={handleAddMcqQuestion}
                                            className="w-full bg-[#F3EAE4] dark:bg-[#1a1a1a] text-[#8B4A28] font-semibold rounded-lg py-3 hover:bg-[#E8D2C1] dark:hover:bg-[#2a2a2a] transition"
                                        >
                                            + Add Question
                                        </button>
                                    </>
                                )}

                                {saveMessage && (
                                    <div className="rounded-lg border border-[#D8E6DC] bg-[#F2FCF5] p-4 text-sm text-[#2B6B3F]">
                                        {saveMessage}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* LESSON SETTINGS */}
                        <div className="bg-white rounded-2xl p-4 sm:p-4 border border-[#E8DDD5] dark:border-[#374151]">
                            <h2 className="text-2xl sm:text-[28px] font-serif font-semibold mb-6">
                                Lesson Settings
                            </h2>

                            {/* Lesson Title */}
                            <p className="text-xs text-[#8A7A71] dark:text-[#7a6a5a] mb-1">
                                Lesson Title
                            </p>

                            <input
                                type="text"
                                value={lessonSettingsTitle}
                                onChange={(e) => setLessonSettingsTitle(e.target.value)}
                                placeholder="Enter lesson title..."
                                className="w-full border border-[#E6DBD3] dark:border-[#374151] rounded-lg p-3 mb-4 bg-[#F9F4F1] dark:bg-[#1a1a1a] outline-none text-[#2D201B] dark:text-[#ededed] placeholder:text-[#B7A79E] dark:placeholder:text-[#6a5a4a] focus:border-[#8B4A28]"
                            />

                            {/* Description */}
                            <p className="text-xs text-[#8A7A71] dark:text-[#7a6a5a] mb-1">
                                Description
                            </p>

                            <textarea
                                rows={4}
                                value={lessonSettingsDescription}
                                onChange={(e) => setLessonSettingsDescription(e.target.value)}
                                placeholder="Write lesson description..."
                                className="w-full border border-[#E6DBD3] dark:border-[#374151] rounded-lg p-3 mb-4 bg-[#F9F4F1] dark:bg-[#1a1a1a] outline-none text-[#2D201B] dark:text-[#ededed] placeholder:text-[#B7A79E] dark:placeholder:text-[#6a5a4a] focus:border-[#8B4A28] resize-none"
                            />

                            <div className="flex flex-col lg:flex-row lg:justify-between gap-5">

                                {/* Duration */}
                                <div>
                                    <p className="text-xs text-[#8A7A71] dark:text-[#7a6a5a] mb-1">
                                        Duration (Minutes)
                                    </p>

                                    <input
                                        type="number"
                                        value={lessonSettingsDuration}
                                        onChange={(e) => setLessonSettingsDuration(e.target.value)}
                                        placeholder="12"
                                        className="border border-[#E6DBD3] dark:border-[#374151] rounded-lg p-2 w-24 outline-none bg-[#F9F4F1] dark:bg-[#1a1a1a] text-[#2D201B] dark:text-[#ededed] placeholder:text-[#B7A79E] dark:placeholder:text-[#6a5a4a] focus:border-[#8B4A28]"
                                    />
                                </div>

                                {/* Toggle */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-[#2D201B] dark:text-[#ededed]">
                                        Mark as Read
                                    </span>

                                    <div
                                        onClick={() => setIsMarked(!isMarked)}
                                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300
                                        ${isMarked ? "bg-[#8B4A28] dark:bg-[#b86a3a]" : "bg-[#E6DBD3] dark:bg-[#2a2a2a]"}
                                           `}
                                    >
                                        <div
                                            className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-300
                                            ${isMarked ? "right-0.5" : "left-0.5"}
                                          `}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex flex-col sm:flex-row justify-end gap-4">

                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={loading}
                                className={`border border-[#E6DBD3] dark:border-[#374151] px-6 py-3 rounded-lg bg-white transition ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#F9F4F1] dark:hover:bg-[#1a1a1a] dark:bg-[#1a1a1a]"}`}
                            >
                                {loading ? "Saving..." : "Save as Draft"}
                            </button>

                            <button
                                onClick={handleContinue}
                                disabled={loading}
                                className={`px-6 py-3 rounded-lg text-white transition ${loading
                                    ? "bg-[#A67C63] dark:bg-[#2a2018] scale-95"
                                    : "bg-[#8B4A28] dark:bg-[#b86a3a] hover:scale-105 active:scale-95"
                                    }`}
                            >
                                {loading ? "Saving..." : "Save & Continue"}
                            </button>

                        </div>

                    </div>

                    {/* ================= RIGHT ================= */}
                    <div className="space-y-6">

                        {/* VIDEO PREVIEW */}
                        <div className="bg-white rounded-2xl border border-[#E8DDD5] dark:border-[#374151] overflow-hidden">
                            {lessonVideoUrl ? (
                                <video
                                    controls
                                    src={lessonVideoUrl}
                                    className="w-full h-[220px] sm:h-[260px] object-cover bg-black"
                                />
                            ) : (
                                <div className="h-[220px] sm:h-[260px] bg-[#F3EAE4] dark:bg-[#1a1a1a] flex items-center justify-center">
                                    <div className="text-center px-6">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-[#8B4A28] dark:bg-[#b86a3a] flex items-center justify-center text-white text-2xl">
                                            ▶
                                        </div>
                                        <p className="mt-3 text-sm font-semibold text-[#2D201B] dark:text-[#ededed]">Video preview</p>
                                        <p className="text-sm text-[#6F5E55] dark:text-[#b89b7d] mt-1">Upload a lesson video to preview it here.</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 sm:p-5">
                                <p className="text-[11px] text-[#8A7A71] dark:text-[#7a6a5a] mb-1 tracking-wide">PREVIEW</p>
                                <p className="text-[15px] font-semibold text-[#2D201B] dark:text-[#ededed] mb-2 leading-snug">{lessonDisplayTitle}</p>
                                <p className="text-sm text-[#6F5E55] dark:text-[#b89b7d] mb-3 leading-relaxed">{lessonDisplayDescription}</p>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-[#8A7A71] dark:text-[#7a6a5a]">
                                    <div className="flex items-center gap-1">
                                        <img src="/icon2.png" className="w-4 h-4" alt="video" />
                                        <span>{preview?.type || lesson?.type || "Video"}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <img src="/icon3.png" className="w-4 h-4" alt="time" />
                                        <span>{lessonDisplayDuration}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <img src="/icon2.png" className="w-4 h-4" alt="name" />
                                        <span className="truncate max-w-[180px]">{lessonVideoLabel}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STATUS */}
                        <div className="bg-white rounded-2xl p-4 sm:p-4 border border-[#EFE7E1] w-full">

                            <h3 className="text-lg sm:text-[21px] font-medium tracking-wide uppercase text-[#4A3B34] mb-5">
                                Upload Status
                            </h3>

                            <ul className="space-y-4">

                                {statusItems.map((item) => (
                                    <li key={item.label} className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-[#D9F5E7]" : "border border-[#CFC5BE]"}`}>
                                            {item.done ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#34C77B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : null}
                                        </div>
                                        <span className={`text-sm sm:text-[16px] ${item.done ? "text-[#2D201B] dark:text-[#ededed]" : "text-[#9C8F88]"}`}>
                                            {item.label}
                                        </span>
                                    </li>
                                ))}

                                <li className="flex items-center gap-3">

                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${uploadChecklist?.readyToPublish ? "bg-[#D9F5E7]" : "border border-[#CFC5BE]"}`}>
                                        {uploadChecklist?.readyToPublish ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#34C77B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : null}
                                    </div>

                                    <span className={`text-sm sm:text-[16px] ${uploadChecklist?.readyToPublish ? "text-[#2D201B] dark:text-[#ededed]" : "text-[#9C8F88]"}`}>
                                        Ready to publish
                                    </span>

                                </li>

                            </ul>

                        </div>

                        {/* TIPS */}
                        <div className="bg-[#FFF4ED] rounded-2xl p-4 sm:p-5 border border-[#F1D6C6]">

                            <h2 className="text-2xl sm:text-[23px] font-serif font-semibold mb-6">
                                Instructor Tips
                            </h2>

                            <p className="text-sm sm:text-[16px] text-[#6F5E55] dark:text-[#b89b7d] leading-relaxed">

                                "Short videos (5–10 min) increase engagement and completion rates by up to 40%."

                                <br />
                                <br />

                                "Add resources like PDFs or project files to help students apply what they've learned."

                            </p>

                            <h3 className="font-bold mt-6 mb-2 text-[#A13636] text-sm sm:text-[16px]">
                                GEF QUALITY GUIDELINES
                            </h3>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default function ContentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F7F3EF] dark:bg-[#171717] p-5">Loading lesson content...</div>}>
            <ContentPageContent />
        </Suspense>
    );
}
