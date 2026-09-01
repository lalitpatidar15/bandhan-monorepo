"use client";

import { useEffect, useMemo, useState } from "react";
import {
    MoreVertical,
    Bell,
    Clock3,
    MessageSquare,
    GraduationCap,
    Loader,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useGetQuizByLessonQuery, useSubmitQuizMutation } from "@/app/redux/services/courseApi";
import AcademyLogo from "@/components/common/AcademyLogo";

export default function QuizPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

    const [selected, setSelected] = useState<string>("");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [studentId, setStudentId] = useState<string>("");
    const [submitLoading, setSubmitLoading] = useState(false);

    const {
        data: quizResponse,
        isLoading,
        isError,
    } = useGetQuizByLessonQuery(id, { skip: !id });

    const [submitQuiz] = useSubmitQuizMutation();

    const quiz = quizResponse?.data ?? quizResponse;
    const quizId = quiz?._id || id;  // Use actual quiz ID, fallback to params
    const questions = quiz?.questions ?? [];
    const current = questions[currentQuestion] ?? null;
    const totalQuestions = questions.length;
    
    // Track answers as { questionId: selectedOptionId }
    const [answersMap, setAnswersMap] = useState<Record<string, string>>({});

    interface QuizOption {
        _id: string;
        text: string;
    }

    const options: QuizOption[] = current?.options ?? [];

    // Get studentId from localStorage on mount
    useEffect(() => {
        try {
            // Try multiple sources for studentId
            let id = localStorage.getItem("studentId");
            
            if (!id) {
                id = localStorage.getItem("userId");
            }
            
            // If still not found, try to get from user object
            if (!id) {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    // Try multiple field names that could contain the user ID
                    id = user?._id || user?.id || user?.studentId || user?.userId;
                }
            }
            
            if (id) {
                setStudentId(id);
            }
        } catch (error) {
            console.error("Error getting studentId:", error);
        }
    }, []);

    // Reset selected option when question changes
    useEffect(() => {
        if (current?._id && answersMap[current._id]) {
            setSelected(answersMap[current._id]);
        } else {
            setSelected("");
        }
    }, [currentQuestion, answersMap, current?._id])

    useEffect(() => {
        if (questions.length > 0 && currentQuestion >= questions.length) {
            setCurrentQuestion(0);
        }
    }, [questions.length, currentQuestion]);

    // Handle option selection
    const handleSelectOption = (optionId: string) => {
        setSelected(optionId);
        if (current?._id) {
            setAnswersMap((prev) => ({
                ...prev,
                [current._id]: optionId,
            }));
        }
    };

    // Handle submit quiz
    const handleSubmitQuiz = async () => {
        // Validate quiz is loaded
        if (!quiz || !quiz._id) {
            alert("Quiz failed to load. Please refresh the page and try again.");
            return;
        }
        
        if (!studentId || studentId.trim() === "") {
            alert("Unable to find user session. Please refresh the page or login again.");
            return;
        }

        // Check if any answer was selected
        if (Object.keys(answersMap).length === 0) {
            alert("Please answer at least one question before submitting.");
            return;
        }

        // Format answers for API
        const formattedAnswers = questions.map((question: any) => ({
            questionId: question._id,
            selectedOptionId: answersMap[question._id] || "",
        }));

        setSubmitLoading(true);
        try {
            const response = await submitQuiz({
                quizId: quizId,
                answers: formattedAnswers,
            }).unwrap();

            if (response.success) {
                // Redirect to results page
                router.push(`/student/quiz-result/${studentId}/${quizId}`);
            }
        } catch (error: any) {
            let errorMsg = "Failed to submit quiz. Please try again.";
            
            // Check various error formats
            if (error?.data?.message) {
                errorMsg = error.data.message;
            } else if (error?.message) {
                errorMsg = error.message;
            } else if (error?.error) {
                errorMsg = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
            } else if (typeof error === "string") {
                errorMsg = error;
            } else if (error && Object.keys(error).length === 0) {
                errorMsg = "Network error: No response from server. Check your connection and try again.";
            }
            
            alert(errorMsg);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[var(--bhn-bg)] dark:bg-[#171717] min-h-screen flex items-center justify-center">
                <Loader size={24} className="animate-spin text-[var(--bhn-brand-500)] dark:text-[var(--bhn-brand-400)]" />
            </div>
        );
    }

    if (isError || !quiz) {
        return (
            <div className="bg-[var(--bhn-bg)] dark:bg-[#171717] min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md text-center bg-white rounded-3xl border border-[var(--bhn-border)] dark:border-[#374151] p-5 shadow-sm">
                    <p className="text-xl font-semibold text-[var(--bhn-text)] dark:text-[#a89080] mb-3">Unable to load quiz</p>
                    <p className="text-sm text-[var(--bhn-text-muted)] dark:text-[#b89b7d] mb-6">There was a problem fetching the quiz data. Please try again or contact support.</p>
                    <button
                        onClick={() => router.back()}
                        className="bhn-btn bhn-btn-primary"
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bhn-bg)] dark:bg-[#171717] flex flex-col">

            {/* HEADER */}
            <div className="min-h-[72px] border-b border-[var(--bhn-border)] dark:border-[#374151] bg-[var(--bhn-bg)] dark:bg-[#171717] px-4 sm:px-6 lg:px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                {/* LEFT */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-5 lg:gap-4">

                    <AcademyLogo className="h-7 sm:h-8 w-auto object-contain" />

                    <button onClick={() => router.back()} className="text-sm text-[var(--bhn-text)] dark:text-[#ededed] border-b-2 border-[var(--bhn-brand-500)] dark:border-[var(--bhn-brand-400)] pb-1 cursor-pointer">
                        Exit Quiz
                    </button>

                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4 sm:gap-5 text-[var(--bhn-text-muted)] dark:text-[#b89b7d]">

                    <button onClick={() => alert('Notifications')} className="cursor-pointer">
                        <Bell size={18} />
                    </button>

                    <button onClick={() => alert('More options')} className="cursor-pointer">
                        <MoreVertical size={18} />
                    </button>

                </div>

            </div>

            {/* MAIN */}
            <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-6">

                {/* TOP TEXT */}
                <div className="w-full max-w-[700px]">

                    <p className="text-xs sm:text-sm md:text-[15px] tracking-[2px] uppercase text-[var(--bhn-text-soft)] dark:text-[#7a6a5a] font-semibold">
                        Assessment
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">

                        <h1 className="text-[28px] sm:text-[32px] md:text-[35px] leading-tight font-bold text-[var(--bhn-text)] dark:text-[#ededed]">
                            {quiz?.title ?? "Quiz"}
                        </h1>

                        <p className="text-sm text-[var(--bhn-text-muted)] dark:text-[#7a6a5a] whitespace-nowrap">
                            Question {currentQuestion + 1} of {totalQuestions || 1}
                        </p>

                    </div>

                    {/* PROGRESS */}
                    <div className="w-full h-[6px] bg-[var(--bhn-border-strong)] rounded-full mt-5 overflow-hidden">
                        <div
                            className="h-full bg-[var(--bhn-brand-500)] dark:bg-[var(--bhn-brand-400)] transition-all duration-300"
                            style={{
                                width: `${(currentQuestion / totalQuestions) * 100}%`,
                            }}
                        />
                    </div>

                </div>

                {/* QUESTION CARD */}
                <div className="w-full max-w-[700px] bg-white rounded-2xl border border-[var(--bhn-border)] dark:border-[#374151] shadow-sm mt-6 sm:mt-4 overflow-hidden">

                    <div className="p-4 sm:p-4 md:p-5">

                        {/* QUESTION */}
                        <h2 className="text-[24px] sm:text-[30px] md:text-[35px] leading-[36px] sm:leading-[42px] md:leading-[48px] font-semibold text-[var(--bhn-text)] dark:text-[#a89080]">
                            {current?.question || ""}
                        </h2>

                        {/* OPTIONS */}
                        <div className="mt-6 sm:mt-4 space-y-4 sm:space-y-5">

                            {options.map((option, index) => {
                                const active = selected === option._id;

                                return (
                                    <button
                                        key={option._id}
                                        onClick={() => handleSelectOption(option._id)}
                                        className={`w-full flex items-start sm:items-center gap-4 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 rounded-xl border transition-all duration-200 text-left ${active
                                            ? "border-[var(--bhn-brand-500)] dark:border-[var(--bhn-brand-400)] bg-[var(--bhn-brand-50)]"
                                            : "border-[var(--bhn-border)] dark:border-[#374151] bg-white hover:border-[var(--bhn-border-strong)]"
                                            }`}
                                    >

                                        {/* CIRCLE */}
                                        <div
                                            className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${active
                                                    ? "border-[var(--bhn-brand-500)] dark:border-[var(--bhn-brand-400)]"
                                                    : "border-[var(--bhn-border-strong)] dark:border-[#374151]"
                                                }`}
                                        >
                                            {active && (
                                                <div className="w-3 h-3 rounded-full bg-[var(--bhn-brand-500)] dark:bg-[var(--bhn-brand-400)]" />
                                            )}
                                        </div>
                                        {/* TEXT */}
                                        <p
                                            className={`text-base sm:text-lg leading-relaxed ${active
                                                ? "text-[var(--bhn-text)] dark:text-[#ededed] font-medium"
                                                : "text-[var(--bhn-text-muted)] dark:text-[#a89080]"
                                                }`}
                                        >
                                            {option.text}
                                        </p>

                                    </button>
                                );
                            })}

                        </div>

                    </div>

                    {/* FOOTER */}
                    <div className="bg-[var(--bhn-brand-50)] dark:bg-[#1a1a1a] border-t border-[var(--bhn-border)] dark:border-[#374151] px-4 sm:px-6 md:px-5 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                        <button onClick={() => alert('Report submitted. Our team will review the issue.')} className="text-sm text-[var(--bhn-text-soft)] dark:text-[#7a6a5a] cursor-pointer">
                            ⚑ Report Issue
                        </button>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">

                            <button
                                onClick={() => {
                                    if (currentQuestion < totalQuestions - 1) {
                                        setCurrentQuestion((prev) => prev + 1);
                                    }
                                }}
                                className="flex-1 sm:flex-none px-5 sm:px-6 py-3 rounded-lg border border-[var(--bhn-border)] dark:border-[#374151] text-[var(--bhn-text-muted)] dark:text-[#7a6a5a] bg-white text-sm font-medium cursor-pointer hover:bg-[var(--bhn-surface-2)] dark:bg-[#171717] transition"
                            >
                                Skip
                            </button>

                            <button
                                onClick={() => {
                                    if (currentQuestion < totalQuestions - 1) {
                                        setCurrentQuestion((prev) => prev + 1);
                                    } else {
                                        handleSubmitQuiz();
                                    }
                                }}
                                disabled={submitLoading}
                                className="
                                flex-1
                                sm:flex-none
                                 px-5
                                 sm:px-7
                                 py-3
                                 rounded-lg
                                 bhn-btn bhn-btn-primary
                                 disabled:cursor-not-allowed
                                 text-white
                                 text-sm
                                 font-medium
                                 flex
                                 items-center
                                 justify-center
                                 gap-2
                                 transition-all
                                 duration-150
                              "
                            >
                                {submitLoading ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : currentQuestion < totalQuestions - 1
                                    ? "Next Question →"
                                    : "Submit Quiz"}
                            </button>

                        </div>

                    </div>

                </div>

                {/* HINT */}
                <div className="w-full max-w-[700px] mt-6 sm:mt-4 bg-[var(--bhn-brand-50)] dark:bg-[#1a1a1a] border border-[var(--bhn-border)] dark:border-[#374151] rounded-xl p-4 sm:p-5">

                    <div className="flex items-start gap-3">

                        <div className="mt-1 text-[var(--bhn-brand-500)] dark:text-[var(--bhn-brand-400)] flex-shrink-0">
                            ✦
                        </div>

                        <div>

                            <h3 className="text-sm font-semibold text-[var(--bhn-brand-800)] dark:text-[#a89080]">
                                Study Hint
                            </h3>

                            <p className="text-sm text-[var(--bhn-text-muted)] dark:text-[#7a6a5a] mt-1 leading-relaxed">
                                {quiz?.hint || ""}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* BOTTOM CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-4 px-4 sm:px-6 lg:px-5 pb-6 sm:pb-8">

                {/* CARD 1 */}
                <div onClick={() => router.push('/student/quiz-history')} className="bg-[var(--bhn-brand-50)] dark:bg-[#1a1a1a] rounded-2xl p-5 sm:p-4 min-h-[120px] cursor-pointer">

                    <Clock3 className="text-[var(--bhn-brand-500)] dark:text-[var(--bhn-brand-400)]" size={20} />

                    <h3 className="mt-4 sm:mt-5 font-semibold text-[var(--bhn-brand-800)] dark:text-[#ededed]">
                        Quiz History
                    </h3>

                    <p className="text-sm text-[var(--bhn-text-muted)] dark:text-[#b89b7d] mt-2 leading-relaxed">
                        View your previous attempts and improvement charts.
                    </p>

                </div>

                {/* CARD 2 */}
                <div onClick={() => router.push('/student/discussion')} className="bg-[var(--bhn-brand-50)] dark:bg-[#1a1a1a] rounded-2xl p-5 sm:p-4 min-h-[120px] cursor-pointer">

                    <MessageSquare className="text-[var(--bhn-brand-500)] dark:text-[var(--bhn-brand-400)]" size={20} />

                    <h3 className="mt-4 sm:mt-5 font-semibold text-[var(--bhn-brand-800)] dark:text-[#ededed]">
                        Discussion
                    </h3>

                    <p className="text-sm text-[var(--bhn-text-muted)] dark:text-[#b89b7d] mt-2 leading-relaxed">
                        12 students are currently discussing this question.
                    </p>

                </div>

                {/* CARD 3 */}
                <div onClick={() => router.push('/student/reference-material')} className="bg-[var(--bhn-brand-50)] dark:bg-[#1a1a1a] rounded-2xl p-5 sm:p-4 min-h-[120px] cursor-pointer">

                    <GraduationCap className="text-[var(--bhn-brand-500)] dark:text-[var(--bhn-brand-400)]" size={20} />

                    <h3 className="mt-4 sm:mt-5 font-semibold text-[var(--bhn-brand-800)] dark:text-[#ededed]">
                        Reference Material
                    </h3>

                    <p className="text-sm text-[var(--bhn-text-muted)] dark:text-[#b89b7d] mt-2 leading-relaxed">
                        Review Module 3: Ethical Design Frameworks.
                    </p>

                </div>

            </div>

        </div>
    );
}
