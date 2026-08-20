"use client";

import StudentHeader from "@/components/common/StudentHeader";
import Button from "@/components/common/Button";
import { Trash2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/app/redux/services/courseApi";

export default function WishlistPage() {
  const router = useRouter();
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { data: wishlistData, isLoading, error } = useGetWishlistQuery({});

  const wishlistCourses = wishlistData?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3EF] dark:bg-[#171717]">
        <StudentHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <p className="text-lg text-[#2D201B] dark:text-[#ededed]">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F3EF] dark:bg-[#171717]">
        <StudentHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <p className="text-lg text-red-600">Failed to load wishlist. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EF] dark:bg-[#171717]">
      <StudentHeader />
      <div className="px-4 sm:px-6 lg:px-5 py-8 sm:py-6">
        <div>
          <h1 className="text-[28px] sm:text-[35px] font-bold text-[#2D201B] dark:text-[#ededed] leading-tight">
            My Wishlist
          </h1>
          <p className="text-[#8A7A71] dark:text-[#7a6a5a] mt-3 text-base sm:text-lg">
            Courses you've saved for later
          </p>
        </div>

        {wishlistCourses.length === 0 ? (
          <div className="mt-6 text-center text-gray-500 text-lg">
            No courses in wishlist yet ❤️
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-7 mt-6">
            {wishlistCourses.map((item: any) => {
              const courseId = String(item.courseId?._id || item.courseId || item.wishlistId || "");
              if (!courseId) return null;

              const course = item.courseId && typeof item.courseId === "object" ? item.courseId : item;
              const title = course.title || item.title || "Untitled Course";
              const thumbnail = course.thumbnail || course.image || item.thumbnail || "/placeholder.png";
              const instructorName =
                course.instructor ||
                item.instructor ||
                item.instructorName ||
                item.instructorFullName ||
                (item.courseId && item.courseId.instructor?.fullName) ||
                "Instructor";
              const rating = course.rating ?? item.rating ?? 0;
              const totalReviews = course.totalReviews ?? item.totalReviews ?? item.totalStudents ?? 0;
              const price = course.price ?? item.price ?? 0;

              return (
                <div
                  key={courseId}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E7DDD6] dark:border-[#374151] hover:shadow-md transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={thumbnail}
                      alt={title}
                      className="w-full h-[220px] sm:h-[240px] object-cover"
                    />

                    <button
                      onClick={async () => {
                        const confirmed = window.confirm(
                          "Are you sure you want to remove this course from your wishlist?"
                        );

                        if (!confirmed) return;

                        setRemovingId(courseId);

                        try {
                          await removeFromWishlist(courseId).unwrap();
                        } catch (err) {
                          console.error("Failed to remove from wishlist", err);
                        } finally {
                          setRemovingId(null);
                        }
                      }}
                      disabled={isRemoving || removingId === courseId}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-[#F5EDE8] dark:hover:bg-[#1a1a1a] transition-all disabled:opacity-50"
                    >
                      <Trash2 size={16} className="text-[#8B4A28] dark:text-[#c9a882]" />
                    </button>
                  </div>

                  <div className="p-5">
                    <h2 className="text-[18px] font-semibold text-[#2D201B] dark:text-[#ededed] leading-snug min-h-[58px]">
                      {title}
                    </h2>

                    <p className="text-[#8A7A71] dark:text-[#7a6a5a] mt-3 text-sm">
                      {instructorName}
                    </p>

                    <div className="flex items-center gap-2 mt-4">
                      <Star
                        size={15}
                        fill="#F59E0B"
                        className="text-[#F59E0B]"
                      />

                      <span className="text-sm text-[#6F5F57] font-medium">
                        {rating}
                      </span>

                      <span className="text-[#A3948C] dark:text-[#6a5a4a] text-sm">
                        ({totalReviews} reviews)
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                      <h3 className="text-[26px] sm:text-[30px] font-bold text-[#8B4A28] dark:text-[#c9a882]">
                        ₹{price}
                      </h3>

                      <Button
                        onClick={() => {
                          router.push(`/student/enroll/${courseId}`);
                        }}
                        className="bg-[#8B4A28] dark:bg-[#b86a3a] hover:bg-[#744024] dark:hover:bg-[#a05a30] text-white px-5 py-2 rounded-xl text-sm transition-all duration-200 w-full sm:w-auto"
                      >
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
