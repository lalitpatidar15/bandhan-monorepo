"use client";

import InstructorHeader from "@/components/common/CourseHeader";
import { Search, Star } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
    useGetInstructorOverviewQuery,
    useGetInstructorReviewsQuery,
    useGetInstructorReviewStatsQuery,
    useReplyToInstructorReviewMutation,
} from "@/app/redux/instructor-services/DashboardApi";

function ReviewPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [activeFilter, setActiveFilter] = useState("All");
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [reviewPage, setReviewPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const REVIEWS_PER_PAGE = 5;
    const { data: overviewData } = useGetInstructorOverviewQuery();
    const courseId = searchParams.get("courseId") || overviewData?.data?.courses?.[0]?._id || "";
    const { data: reviewsResponse, isLoading } = useGetInstructorReviewsQuery(courseId, { skip: !courseId });
    const { data: statsResponse } = useGetInstructorReviewStatsQuery(courseId, { skip: !courseId });
    const [replyToReview, { isLoading: isReplying }] = useReplyToInstructorReviewMutation();
    const stats = statsResponse?.data;


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

    const allReviews: Array<{ id: string; name: string; date: string; rating: number; image: string; review: string; reply: string }> =
      (reviewsResponse?.data || []).map((review: any) => ({
        id: review._id,
        name: review.studentId?.fullName || "Student",
        date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "",
        rating: review.rating,
        image: review.studentId?.profilePhoto || "/profile.png",
        review: review.review,
        reply: review.instructorResponse,
    })).filter((review: any) => {
        if (activeFilter === "Positive") return review.rating >= 4;
        if (activeFilter === "Critical") return review.rating <= 2;
        if (activeFilter === "Unanswered") return !review.reply;
        return true;
    });

    const reviewTotalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
    const reviews = allReviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);

    return (
        <div className="min-h-screen bg-[#F7F4F1]">
            {/* HEADER */}
            <InstructorHeader />

            <div className="px-4 sm:px-6 lg:px-6 py-6">
                {/* TITLE */}
                <h1 className="text-[32px] sm:text-3xl italic font-serif text-[#2D201B]">
                    Review Management
                </h1>

                {/* TABS */}
                <div
                    className="
                    flex
                    items-center
                    gap-4
                    sm:gap-5
                    overflow-x-auto
                    border-b
                    border-[#E6DDD6]
                    pb-4
                    mt-6
                    mb-4
                    whitespace-nowrap
                      "
                >
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.path.split("?")[0];

                        return (
                            <button
                                key={tab.name}
                                onClick={() => router.push(tab.path)}
                                className={`
                                text-[15px]
                                sm:text-[17px]
                                pb-2
                                transition-all
                                duration-200
                                ${isActive
                                        ? "font-medium text-[#8A4A26] border-b-2 border-[#8A4A26]"
                                        : "text-[#7C6C64] hover:text-[#8A4A26]"
                                    }
                                    `}
                            >
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* TOP STATS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* RATING CARD */}
                    <div className="bg-[#F7EDE5] rounded-xl p-5 border border-[#E8DDD5]">
                        <p className="text-[11px] tracking-[2px] uppercase text-[#7C6C64] font-semibold text-center">
                            Average Rating
                        </p>

                        <h2 className="text-[58px] leading-none text-center italic font-serif text-[#8A4A26] mt-4">
                            {Number(stats?.averageRating ?? 0).toFixed(1)}
                        </h2>

                        <div className="flex justify-center mt-3 gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={16}
                                    fill="#8A4A26"
                                    className="text-[#8A4A26]"
                                />
                            ))}
                        </div>

                        <p className="text-sm text-[#7C6C64] text-center mt-3">
                            Based on {stats?.totalReviews ?? 0} reviews
                        </p>
                    </div>

                    {/* DISTRIBUTION */}
                    <div className="lg:col-span-2 bg-[#F7EDE5] rounded-xl p-4 border border-[#E8DDD5]">
                        <h3 className="text-[18px] font-medium text-[#2D201B] mb-6">
                            Rating Distribution
                        </h3>

                        {[5, 4, 3, 2, 1].map((star, index) => {
                            const distribution = stats?.distribution || {};
                            const counts = [distribution.fiveStar, distribution.fourStar, distribution.threeStar, distribution.twoStar, distribution.oneStar];
                            const width = stats?.totalReviews ? `${Math.round(((counts[index] || 0) / stats.totalReviews) * 100)}%` : "0%";

                            return (
                                <div
                                    key={star}
                                    className="flex items-center gap-4 mb-4"
                                >
                                    <p className="w-[40px] text-sm text-[#6F5B51]">
                                        {star} Star
                                    </p>

                                    <div className="flex-1 h-[6px] bg-[#E6D8CF] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#8A4A26] rounded-full"
                                            style={{ width }}
                                        />
                                    </div>

                                    <p className="text-sm text-[#6F5B51] w-[40px] text-right">
                                        {width}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-4">
                    {/* LEFT */}
                    <div className="flex flex-wrap gap-3">
                        {["All", "Positive", "Critical", "Unanswered"].map((item) => (
                            <button
                                key={item}
                                onClick={() => setActiveFilter(item)}
                                className={`
                                px-5
                                h-[40px]
                                rounded-lg
                                text-sm
                                border
                                transition-all
                                duration-200
                                active:scale-95
                                ${activeFilter === item
                                        ? "bg-[#F5E7DC] border-[#E2C9B9] text-[#8A4A26] shadow-sm"
                                        : "bg-white border-[#E6DDD6] text-[#6F5B51] hover:bg-[#F7EDE5]"
                                    }
                          `}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    {/* SEARCH */}
                    <div className="relative w-full lg:w-[260px]">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9D8A80]"
                        />

                        <input
                            type="text"
                            placeholder="Search reviews..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="
                             w-full
                             h-[42px]
                             rounded-lg
                             border
                             border-[#E6DDD6]
                             bg-[#F9F6F3]
                             pl-10
                             pr-4
                             text-sm
                             outline-none
                             focus:border-[#8A4A26]
                             "
                        />
                    </div>
                </div>

                {/* REVIEW LIST */}
                <div className="space-y-6 mt-4">
                    {isLoading && <p className="text-sm text-[#7C6C64]">Loading reviews...</p>}
                    {reviews.map((review, index) => (
                        <div
                            key={review.id || index}
                            className="bg-white rounded-2xl border border-[#E8DDD5] p-5 sm:p-7"
                        >
                            {/* TOP */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={review.image}
                                        alt={review.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />

                                    <div>
                                        <h3 className="text-[17px] font-semibold text-[#2D201B]">
                                            {review.name}
                                        </h3>

                                        <p className="text-sm text-[#8A7A71]">
                                            {review.date}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={14}
                                            fill={
                                                star <= review.rating ? "#8A4A26" : "transparent"
                                            }
                                            className={
                                                star <= review.rating
                                                    ? "text-[#8A4A26]"
                                                    : "text-[#C8B8AE]"
                                            }
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* REVIEW TEXT */}
                            <p className="text-[15px] leading-[28px] text-[#5E4C43] mt-6">
                                {review.review}
                            </p>

                            {/* REPLY */}
                            {review.reply ? (
                                <div className="bg-[#F8EFE8] rounded-xl p-5 mt-6">
                                    <p className="text-[11px] tracking-[2px] uppercase text-[#7C6C64] font-semibold mb-3">
                                        Instructor Response
                                    </p>

                                    <p className="text-[14px] leading-[26px] text-[#6A554B] italic">
                                        "{review.reply}"
                                    </p>

                                    <p className="text-right text-xs text-[#8A7A71] mt-2">
                                        ✓ Replied
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-[#FAF6F2] rounded-xl p-4 mt-6">
                                    <textarea
                                        value={replyDrafts[review.id] || ""}
                                        onChange={(event) => setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))}
                                        placeholder="Write a response..."
                                        className="
                                           w-full
                                           min-h-[110px]
                                           bg-white
                                           border
                                           border-[#E6DDD6]
                                           rounded-lg
                                           p-4
                                           text-sm
                                           outline-none
                                           resize-none
                                           focus:border-[#8A4A26]
                                        "
                                    />

                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            onClick={() => setReplyDrafts((current) => ({ ...current, [review.id]: "" }))}
                                            className="px-5 h-[40px] rounded-lg border border-[#E6DDD6] text-sm text-[#6F5B51] hover:bg-[#F4ECE6]"
                                        >
                                            Discard
                                        </button>

                                        <button
                                            onClick={async () => {
                                                const instructorResponse = replyDrafts[review.id]?.trim();
                                                if (!instructorResponse) return;
                                                await replyToReview({ reviewId: review.id, instructorResponse }).unwrap();
                                            }}
                                            disabled={isReplying || !replyDrafts[review.id]?.trim()}
                                            className="px-5 h-[40px] rounded-lg bg-[#8A4A26] hover:bg-[#744024] text-white text-sm disabled:opacity-50"
                                        >
                                            {isReplying ? "Posting..." : "Post Response"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* PAGINATION */}
                {allReviews.length > REVIEWS_PER_PAGE && (
                    <div className="flex justify-center items-center gap-3 mt-6 pb-10">
                        {(() => {
                            const pages: (number | string)[] = [];
                            for (let i = 1; i <= reviewTotalPages; i++) {
                                if (i === 1 || i === reviewTotalPages || (i >= reviewPage - 1 && i <= reviewPage + 1)) {
                                    pages.push(i);
                                } else if (pages[pages.length - 1] !== "...") {
                                    pages.push("...");
                                }
                            }
                            return pages.map((page, idx) =>
                                typeof page === "string" ? (
                                    <span key={`ellipsis-${idx}`} className="text-[#8A7A71]">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setReviewPage(page)}
                                        className={`w-8 h-8 rounded-full text-sm transition-all ${
                                            page === reviewPage
                                                ? "bg-[#8A4A26] text-white"
                                                : "border border-[#DCCFC6] text-[#7C6C64] hover:bg-[#F4ECE6]"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ReviewPage() {
    return <Suspense fallback={<div className="min-h-screen bg-[#F7F4F1]" />}><ReviewPageContent /></Suspense>;
}
