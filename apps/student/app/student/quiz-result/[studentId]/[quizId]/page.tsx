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
            <div className="bg-[#F7F3EF] dark:bg-[#171717] min-h-screen flex items-center justify-center">
                <p className="text-lg text-[#2B1D18] dark:text-[#ededed]">Loading results...</p>
            </div>
        );
    }

    if (isError || !result) {
        return (
            <div className="bg-[#F7F3EF] dark:bg-[#171717] min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md text-center bg-white rounded-3xl border border-[#E8DDD5] dark:border-[#374151] p-5 shadow-sm">
                    <p className="text-xl font-semibold text-[#4A3A33] dark:text-[#a89080] mb-3">
                        Unable to load results
                    </p>
                    <p className="text-sm text-[#7B6A62] dark:text-[#b89b7d] mb-6">
                        There was a problem fetching your quiz results. Please try
                        again or contact support.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="px-5 py-3 rounded-lg bg-[#8B4A28] dark:bg-[#b86a3a] text-white text-sm font-medium hover:bg-[#744024] dark:hover:bg-[#a05a30] transition"
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
        <div className="min-h-screen bg-[#F7F3EF] dark:bg-[#171717] flex flex-col">
            {/* HEADER */}
            <div className="min-h-[72px] border-b border-[#E7DDD6] dark:border-[#374151] bg-[#F7F3EF] dark:bg-[#171717] px-4 sm:px-6 lg:px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 sm:gap-5 lg:gap-4">
                    <AcademyLogo className="h-7 sm:h-8 w-auto object-contain" />

                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-8">
                {/* RESULT CARD */}
                <div className="w-full max-w-[700px] bg-white rounded-3xl border border-[#E8DDD5] dark:border-[#374151] shadow-sm overflow-hidden">
                    {/* TOP SECTION - PASS/FAIL */}
                    <div
                        className={`p-5 sm:p-4 text-center ${
                            passed ? "bg-[#E8F5E9]" : "bg-[#FFEBEE]"
                        }`}
                    >
                        <div className="flex justify-center mb-4">
                            {passed ? (
                                <CheckCircle
                                    size={80}
                                    className="text-[#4CAF50]"
                                    strokeWidth={1.5}
                                />
                            ) : (
                                <XCircle
                                    size={80}
                                    className="text-[#F44336]"
                                    strokeWidth={1.5}
                                />
                            )}
                        </div>

                        <h1
                            className={`text-2xl sm:text-2xl font-bold mb-2 ${
                                passed ? "text-[#2E7D32]" : "text-[#C62828]"
                            }`}
                        >
                            {passed ? "Congratulations!" : "Try Again"}
                        </h1>

                        <p
                            className={`text-lg ${
                                passed ? "text-[#558B2F]" : "text-[#AD1457]"
                            }`}
                        >
                            {passed
                                ? "You have successfully passed the quiz!"
                                : "You did not pass this quiz. Review and try again!"}
                        </p>
                    </div>

                    {/* SCORE SECTION */}
                    <div className="px-6 sm:px-5 py-8 border-b border-[#E8DDD5] dark:border-[#374151]">
                        <div className="grid grid-cols-3 gap-4 sm:gap-4 text-center">
                            {/* SCORE */}
                            <div>
                                <p className="text-2xl sm:text-2xl font-bold text-[#8B4A28] dark:text-[#c9a882]">
                                    {score}
                                </p>
                                <p className="text-sm text-[#8A776E] dark:text-[#7a6a5a] mt-2">
                                    Correct Answers
                                </p>
                            </div>

                            {/* TOTAL */}
                            <div>
                                <p className="text-2xl sm:text-2xl font-bold text-[#7B6A62] dark:text-[#b89b7d]">
                                    {totalMarks}
                                </p>
                                <p className="text-sm text-[#8A776E] dark:text-[#7a6a5a] mt-2">
                                    Total Questions
                                </p>
                            </div>

                            {/* PERCENTAGE */}
                            <div>
                                <p className="text-2xl sm:text-2xl font-bold text-[#8B4A28] dark:text-[#c9a882]">
                                    {percentage.toFixed(0)}%
                                </p>
                                <p className="text-sm text-[#8A776E] dark:text-[#7a6a5a] mt-2">
                                    Score
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ANSWERS REVIEW SECTION */}
                    <div className="px-6 sm:px-5 py-8">
                        <h2 className="text-2xl font-bold text-[#2B1D18] dark:text-[#ededed] mb-6">
                            Answer Review
                        </h2>

                        <div className="space-y-4">
                            {answers.map((answer: any, index: number) => (
                                <div
                                    key={answer._id}
                                    className={`p-4 rounded-lg border-l-4 ${
                                        answer.isCorrect
                                            ? "border-l-[#4CAF50] bg-[#F1F8F4]"
                                            : "border-l-[#F44336] bg-[#FEF5F5]"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            {answer.isCorrect ? (
                                                <CheckCircle
                                                    size={20}
                                                    className="text-[#4CAF50]"
                                                />
                                            ) : (
                                                <XCircle
                                                    size={20}
                                                    className="text-[#F44336]"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-[#2B1D18] dark:text-[#ededed] mb-1">
                                                Question {index + 1}
                                            </p>
                                            <p
                                                className={`text-sm ${
                                                    answer.isCorrect
                                                        ? "text-[#2E7D32]"
                                                        : "text-[#C62828]"
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
                    <div className="bg-[#FBF1EC] dark:bg-[#1a1a1a] border-t border-[#EADDD5] dark:border-[#374151] px-6 sm:px-5 py-6 flex flex-col sm:flex-row gap-4 cursor-pointer">
                        <button
                            onClick={() => router.push(`/student/progress/${studentId}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#E0D2C8] dark:border-[#374151] text-[#8B4A28] dark:text-[#c9a882] bg-white text-sm font-medium hover:bg-[#FAFAF8] dark:bg-[#171717] transition cursor-pointer"
                        >
                            <Home size={18} />
                            Progress & Certificates
                        </button>

                        <button
                            onClick={() => router.back()}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#8B4A28] dark:bg-[#b86a3a] text-white text-sm font-medium hover:bg-[#744024] dark:hover:bg-[#a05a30] transition cursor-pointer"
                        >
                            Retake Quiz
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* ADDITIONAL INFO */}
                <div className="w-full max-w-[700px] mt-4 bg-[#F9EFE8] dark:bg-[#1a1a1a] border border-[#EEE0D7] dark:border-[#374151] rounded-xl p-4">
                    <h3 className="font-semibold text-[#5A4439] dark:text-[#a89080] mb-3">
                        What's Next?
                    </h3>
                    <ul className="space-y-2 text-sm text-[#8A776E] dark:text-[#7a6a5a]">
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
