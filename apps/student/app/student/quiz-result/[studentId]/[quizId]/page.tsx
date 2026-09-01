"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetQuizResultQuery } from "@/app/redux/services/courseApi";
import { CheckCircle, XCircle, ArrowRight, Home } from "lucide-react";
import AcademyLogo from "@/components/common/AcademyLogo";

export default function QuizResultPage() {
    const router = useRouter();
    const params = useParams();
    const studentId = Array.isArray(params.studentId)
        ? params.studentId[0]
        : params.studentId ?? "";
    const quizId = Array.isArray(params.quizId)
        ? params.quizId[0]
        : params.quizId ?? "";

    const {
        data: resultResponse,
        isLoading,
        isError,
    } = useGetQuizResultQuery(
        { studentId, quizId },
        { skip: !studentId || !quizId }
    );

    const result = resultResponse?.data ?? resultResponse;

    if (isLoading) {
        return (
            <div className="bg-[var(--bhn-bg)] dark:bg-[#171717] min-h-screen flex items-center justify-center">
                <p className="text-lg text-[var(--bhn-text)] dark:text-[#ededed]">Loading results...</p>
            </div>
        );
    }

    if (isError || !result) {
        return (
            <div className="bg-[var(--bhn-bg)] dark:bg-[#171717] min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md text-center bg-white rounded-3xl border border-[var(--bhn-border)] dark:border-[#374151] p-5 shadow-sm">
                    <p className="text-xl font-semibold text-[var(--bhn-text)] dark:text-[#a89080] mb-3">
                        Unable to load results
                    </p>
                    <p className="text-sm text-[var(--bhn-text-muted)] dark:text-[#b89b7d] mb-6">
                        There was a problem fetching your quiz results. Please try
                        again or contact support.
                    </p>
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

    const passed = result.passed;
    const percentage = result.percentage;
    const score = result.score;
    const totalMarks = result.totalMarks;
    const answers = result.answers || [];

    return (
        <div className="min-h-screen bg-[var(--bhn-bg)] dark:bg-[#171717] flex flex-col">
            {/* HEADER */}
            <div className="min-h-[72px] border-b border-[var(--bhn-border)] dark:border-[#374151] bg-[var(--bhn-bg)] dark:bg-[#171717] px-4 sm:px-6 lg:px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 sm:gap-5 lg:gap-4">
                    <AcademyLogo className="h-7 sm:h-8 w-auto object-contain" />

                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-8">
                {/* RESULT CARD */}
                <div className="w-full max-w-[700px] bg-white rounded-3xl border border-[var(--bhn-border)] dark:border-[#374151] shadow-sm overflow-hidden">
                    {/* TOP SECTION - PASS/FAIL */}
                    <div
                        className={`p-5 sm:p-4 text-center ${
                            passed ? "bg-green-50" : "bg-red-50"
                        }`}
                    >
                        <div className="flex justify-center mb-4">
                            {passed ? (
                                <CheckCircle
                                    size={80}
                                    className="text-green-600"
                                    strokeWidth={1.5}
                                />
                            ) : (
                                <XCircle
                                    size={80}
                                    className="text-red-600"
                                    strokeWidth={1.5}
                                />
                            )}
                        </div>

                        <h1
                            className={`text-2xl sm:text-2xl font-bold mb-2 ${
                                passed ? "text-green-700" : "text-red-700"
                            }`}
                        >
                            {passed ? "Congratulations!" : "Try Again"}
                        </h1>

                        <p
                            className={`text-lg ${
                                passed ? "text-green-600" : "text-red-600"
                            }`}
                        >
                            {passed
                                ? "You have successfully passed the quiz!"
                                : "You did not pass this quiz. Review and try again!"}
                        </p>
                    </div>

                    {/* SCORE SECTION */}
                    <div className="px-6 sm:px-5 py-8 border-b border-[var(--bhn-border)] dark:border-[#374151]">
                        <div className="grid grid-cols-3 gap-4 sm:gap-4 text-center">
                            {/* SCORE */}
                            <div>
                                <p className="text-2xl sm:text-2xl font-bold text-[var(--bhn-brand-500)] dark:text-[var(--bhn-brand-400)]">
                                    {score}
                                </p>
                                <p className="text-sm text-[var(--bhn-text-muted)] dark:text-[#7a6a5a] mt-2">
                                    Correct Answers
                                </p>
                            </div>

                            {/* TOTAL */}
                            <div>
                                <p className="text-2xl sm:text-2xl font-bold text-[var(--bhn-text-muted)] dark:text-[#b89b7d]">
                                    {totalMarks}
                                </p>
                                <p className="text-sm text-[var(--bhn-text-muted)] dark:text-[#7a6a5a] mt-2">
                                    Total Questions
                                </p>
                            </div>

                            {/* PERCENTAGE */}
                            <div>
                                <p className="text-2xl sm:text-2xl font-bold text-[var(--bhn-brand-500)] dark:text-[var(--bhn-brand-400)]">
                                    {percentage.toFixed(0)}%
                                </p>
                                <p className="text-sm text-[var(--bhn-text-muted)] dark:text-[#7a6a5a] mt-2">
                                    Score
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ANSWERS REVIEW SECTION */}
                    <div className="px-6 sm:px-5 py-8">
                        <h2 className="text-2xl font-bold text-[var(--bhn-text)] dark:text-[#ededed] mb-6">
                            Answer Review
                        </h2>

                        <div className="space-y-4">
                            {answers.map((answer: any, index: number) => (
                                <div
                                    key={answer._id}
                                    className={`p-4 rounded-lg border-l-4 ${
                                        answer.isCorrect
                                            ? "border-l-green-600 bg-green-50"
                                            : "border-l-red-600 bg-red-50"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            {answer.isCorrect ? (
                                                <CheckCircle
                                                    size={20}
                                                    className="text-green-600"
                                                />
                                            ) : (
                                                <XCircle
                                                    size={20}
                                                    className="text-red-600"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-[var(--bhn-text)] dark:text-[#ededed] mb-1">
                                                Question {index + 1}
                                            </p>
                                            <p
                                                className={`text-sm ${
                                                    answer.isCorrect
                                                        ? "text-green-700"
                                                        : "text-red-700"
                                                }`}
                                            >
                                                {answer.isCorrect
                                                    ? "Correct"
                                                    : "Incorrect"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="bg-[var(--bhn-brand-50)] dark:bg-[#1a1a1a] border-t border-[var(--bhn-border)] dark:border-[#374151] px-6 sm:px-5 py-6 flex flex-col sm:flex-row gap-4 cursor-pointer">
                        <button
                            onClick={() => router.push(`/student/progress/${studentId}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[var(--bhn-border)] dark:border-[#374151] text-[var(--bhn-brand-500)] dark:text-[var(--bhn-brand-400)] bg-white text-sm font-medium hover:bg-[var(--bhn-brand-100)] dark:bg-[#171717] transition cursor-pointer"
                        >
                            <Home size={18} />
                            Progress & Certificates
                        </button>

                        <button
                            onClick={() => router.back()}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bhn-btn bhn-btn-primary cursor-pointer"
                        >
                            Retake Quiz
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* ADDITIONAL INFO */}
                <div className="w-full max-w-[700px] mt-4 bg-[var(--bhn-brand-50)] dark:bg-[#1a1a1a] border border-[var(--bhn-border)] dark:border-[#374151] rounded-xl p-4">
                    <h3 className="font-semibold text-[var(--bhn-brand-800)] dark:text-[#a89080] mb-3">
                        What's Next?
                    </h3>
                    <ul className="space-y-2 text-sm text-[var(--bhn-text-muted)] dark:text-[#7a6a5a]">
                        <li>
                            • Review your answers and study the topics you need
                            improvement on
                        </li>
                        <li>
                            • Check the course materials and lesson notes for
                            clarification
                        </li>
                        <li>
                            {passed
                                ? "• Proceed to the next module or lesson"
                                : "• You can retake this quiz after 24 hours"}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
