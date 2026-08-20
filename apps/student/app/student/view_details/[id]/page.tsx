"use client";

import { useParams } from "next/navigation";
import StudentHeader from "@/components/common/StudentHeader";
import Button from "@/components/common/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  useAddToWishlistMutation,
  useGetCourseByIdQuery,
  useGetWishlistStatusQuery,
  useRemoveFromWishlistMutation,
} from "@/app/redux/services/courseApi";

interface Lesson {

  _id?: string;

  title: string;

  duration?: string;

  time?: string;

  type?: string;

  completed?: boolean;

  isLocked?: boolean;

}

interface CourseModule {
  _id?: string;
  id?: string | number;
  title: string;
  lessons?: Lesson[];
}

export default function CourseDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: res, isLoading, error, refetch } = useGetCourseByIdQuery(id || "", {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const courseData = res?.data?.course || res?.course || res;
  const instructorData = res?.data?.instructor || courseData?.instructor || {};
  const pricingData = res?.data?.pricing || {};
  const curriculumData = res?.data?.curriculum || [];
  const reviewsData = res?.data?.reviews || [];

  const course = courseData || {};
  const isEnrolled = res?.data?.isEnrolled || false;
  const instructor = instructorData || {};
  const courseId = String(course?._id || course?.courseId || course?.id || id || "");
  const courseThumbnail = course?.thumbnail || course?.image || "/course.png";
  const courseTitle = course?.title || "";
  const courseDescription = course?.description || "";
  const instructorName = instructor?.fullName || course?.instructor || "";
  const courseRating = course?.rating ?? 0;
  const courseReviews = course?.totalReviews ?? reviewsData.length ?? 0;
  const discountEnabled = pricingData?.enableDiscount ?? pricingData?.enabled ?? false;
  const discountPercentage = Number(pricingData?.discountPercentage ?? course?.discountPercentage ?? 0) || 0;
  const basePrice = Number(pricingData?.basePrice ?? pricingData?.price ?? course?.price ?? 0) || 0;
  const courseOldPrice = (pricingData?.oldPrice ?? pricingData?.basePrice ?? course?.oldPrice) || "";
  const finalPrice = discountEnabled && discountPercentage > 0
    ? Math.round(basePrice - (basePrice * discountPercentage) / 100)
    : basePrice;
  const coursePrice = pricingData?.finalPrice ?? finalPrice;
  const emiMonthsFromData = Number(pricingData?.months ?? pricingData?.emiMonths ?? 0) || 0;
  const defaultEmiMonths = emiMonthsFromData > 0 ? emiMonthsFromData : 0;
  const computedEmiPlans = defaultEmiMonths > 0
    ? Array.from({ length: Math.min(defaultEmiMonths, 12) }, (_, i) => `${i + 1} ${i === 0 ? "Month" : "Months"}`)
    : ["3 Months", "6 Months", "12 Months"];
  const emiPlans = computedEmiPlans as readonly string[];
  type EMIPlan = string;
  const emiEnabledFromData = pricingData?.enabled ?? pricingData?.enableEMI ?? false;
  const coursePriceNumber = typeof coursePrice === "number"
    ? coursePrice
    : Number(String(coursePrice || "").replace(/[^0-9]/g, "")) || 0;
  const [selectedPlan, setSelectedPlan] = useState<EMIPlan>("3 Months");
  const [emiEnabled, setEmiEnabled] = useState(true);
  const monthlyPricing: Record<EMIPlan, number> = {
    "3 Months": Math.ceil(coursePriceNumber / 3),
    "6 Months": Math.ceil(coursePriceNumber / 6),
    "12 Months": Math.ceil(coursePriceNumber / 12),
  };
  const selectedMonthCount = Number((selectedPlan || "3 Months").replace(/[^0-9]/g, "")) || 0;
  const emiMonthly = selectedMonthCount > 0 ? Math.ceil(coursePriceNumber / selectedMonthCount) : 0;

  const router = useRouter();

  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();
  const [hasToken, setHasToken] = useState(false);
  const { data: wishlistStatus } = useGetWishlistStatusQuery(courseId, {
    skip: !courseId || !hasToken,
  });
  const isWishlisted = Boolean(wishlistStatus?.isWishlisted);
  const isWishlistLoading = isAddingToWishlist || isRemovingFromWishlist;
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [lockedMessage, setLockedMessage] = useState("");
  const modules: CourseModule[] = course?.modules ?? curriculumData ?? [];
  const totalLessons = modules.reduce((sum: number, m: CourseModule) => sum + (m.lessons?.length || 0), 0);

  useEffect(() => {
    setEmiEnabled(emiEnabledFromData);
  }, [emiEnabledFromData, emiMonthsFromData]);

  useEffect(() => {
    if (modules.length > 0 && !openModule) {
      const firstModuleKey = String(modules[0]._id || modules[0].id || modules[0].title || 0);
      setOpenModule(firstModuleKey);
    }

    setHasToken(Boolean(localStorage.getItem("token")));
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[var(--bhn-bg)] min-h-screen">
        <StudentHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <p className="text-lg text-[var(--bhn-text)]">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="bg-[var(--bhn-bg)] min-h-screen">
        <StudentHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <p className="text-lg text-[var(--bhn-error-600)]">Failed to load course details. Please try again.</p>
        </div>
      </div>
    );
  }



  return (
    <div className="bg-[var(--bhn-bg)] min-h-screen">
      <StudentHeader />

      <div
        className="
          flex
          flex-col
          xl:flex-row
          gap-5
          px-4
          sm:px-6
          md:px-5
          lg:px-6
          py-6
        "
      >

        {/* LEFT SIDE */}
        <div className="flex-1 w-full">

          {/* IMAGE */}
          <img
            src={courseThumbnail}
            alt={courseTitle}
            className="
              w-full
              h-[220px]
              sm:h-[320px]
              md:h-[420px]
              object-cover
              rounded-xl
            "
          />

          {/* TITLE */}
          <h1
            className="
              text-2xl
              sm:text-xl
              lg:text-2xl
              font-semibold
              mt-5
              leading-snug
            "
          >
            {course.title}
          </h1>

          {/* AUTHOR + RATING */}
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
              mt-3
              text-sm
              sm:text-base
              text-gray-600
            "
          >
            <span>{instructorName}</span>

            <span className="text-[#F59E0B] font-medium">
              ⭐ {courseRating}
            </span>

            <span className="text-gray-400">
              ({courseReviews} reviews)
            </span>
          </div>

          {/* ABOUT */}
          <h2
            className="
              mt-4
              font-semibold
              text-2xl
              sm:text-xl
            "
          >
            About this course
          </h2>

          <p
            className="
              text-gray-600
              mt-2
              leading-relaxed
              text-sm
              sm:text-base
            "
          >
            {course.description}
          </p>

          {/* LONG DESCRIPTION */}
          {course.longDescription && (
            <p
              className="
                text-gray-600
                mt-3
                leading-relaxed
                text-sm
                sm:text-base
              "
            >
              {course.longDescription}
            </p>
          )}

          {/* LOCKED LESSON MESSAGE */}
          {lockedMessage && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              <span>{lockedMessage}</span>
              <button onClick={() => setLockedMessage("")} className="text-amber-600 font-bold ml-2 text-lg leading-none">&times;</button>
            </div>
          )}

          {/* CURRICULUM */}
          <h2
            className="
             mt-4
            text-[34px]
            font-bold
            text-[#241B18] dark:text-[#ededed]
            mb-4
            "
          >
            Curriculum
          </h2>

          <div className="space-y-5">

            {modules.map((module, moduleIndex) => {

              const moduleKey = String(module._id || module.id || module.title || moduleIndex);
              const isOpen = openModule === moduleKey;

              return (
                <div
                  key={moduleKey}
                  className="
                    bhn-card
                    overflow-hidden
                    transition-all
                    duration-300
                     "
                >

                  {/* HEADER */}
                  <button
                    onClick={() =>
                      setOpenModule(
                        isOpen ? null : moduleKey
                      )
                    }
                    className={`
                      w-full
                      flex
                      items-center
                      justify-between
                      px-4
                      sm:px-6
                      py-5
                      sm:py-7
                      transition-all
                      duration-300

                                ${isOpen
                        ? "bg-[#F6EAE4] dark:bg-[#1a1a1a]"
                        : "bg-white"
                      }
                            `}
                  >

                    <div className="flex items-center gap-3 sm:gap-5 text-left">

                      <span
                        className="
                          text-[var(--bhn-brand-700)]
                          font-bold
                          text-sm
                          sm:text-base
                          "
                      >
                        {String(moduleIndex + 1).padStart(2, "0")}
                      </span>

                      <h3
                        className="
                          font-semibold
                          text-base
                          sm:text-xl
                          lg:text-[25px]
                          text-[#2B211E] dark:text-[#ededed]
                          "
                      >
                        {module.title}
                      </h3>

                    </div>

                    {/* ICON */}
                    <div
                      className="
                        text-[#2B211E] dark:text-[#ededed]
                        transition-all
                        duration-300
                                "
                    >
                      {isOpen ? (
                        <ChevronUp
                          size={28}
                          strokeWidth={2}
                        />
                      ) : (
                        <ChevronDown
                          size={28}
                          strokeWidth={2}
                        />
                      )}
                    </div>

                  </button>

                  {/* CONTENT */}
                  <div
                    className={`
                      transition-all
                      duration-300
                      overflow-hidden

                                ${isOpen
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0"
                      }
                            `}
                  >

                    <div
                      className="
                        px-5
                        sm:px-6
                        lg:px-12
                        py-6
                        sm:py-8
                        bg-white
                        space-y-6
                                "
                    >

                      {module.lessons?.map((lesson, index) => (
                        <button
                          key={lesson._id || index}
                          onClick={() => {

                            if (lesson.isLocked) {
                              setLockedMessage("Complete previous lesson first");
                              return;
                            }

                            router.push(
                              `/student/course-player/${courseId}?lesson=${index}`
                            );

                          }}
                          className="
                          w-full
                          flex
                          items-center
                          justify-between
                          gap-4
                          text-left
                           p-3
                          rounded-lg
                          hover:bg-[#F6EAE4] dark:hover:bg-[#1a1a1a] dark:hover:bg-[#1a1a1a] dark:bg-[#1a1a1a]
                          transition-all
                          duration-200
                          cursor-pointer
                         "
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <img
                              src={
                                lesson.isLocked
                                  ? "/lock.png"
                                  : lesson.type === "video"
                                    ? "/video.png"
                                    : "/doc.png"
                              }
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />

                            <span className="text-sm sm:text-lg lg:text-[21px] text-[#685C56] dark:text-[#a89080]">
                              {lesson.title}
                            </span>
                          </div>

                          <span className="text-sm sm:text-lg lg:text-[21px] text-[#685C56] dark:text-[#a89080]">
                            {lesson.duration ?? lesson.time ?? ""}
                          </span>
                        </button>
                      ))}



                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT SIDE CARD */}
        <div
          className="
            w-full
            xl:w-[420px]
            2xl:w-[480px]
          "
        >

          <div
            className="
              bhn-card
              p-5
              sm:p-5
              shadow-[var(--bhn-shadow)]
              xl:sticky
              xl:top-4
            "
          >

            {/* PRICE */}
            <div>

              <div className="flex items-center gap-3 flex-wrap">

                <h1
                  className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    text-[var(--bhn-brand-600)]
                  "
                >
                  ₹{coursePrice}
                </h1>

                <span
                  className="
                    line-through
                    text-lg
                    sm:text-2xl
                    text-[var(--bhn-text-soft)]
                  "
                >
                  {courseOldPrice ? `₹${courseOldPrice}` : ""}
                </span>

              </div>

              {discountEnabled && discountPercentage > 0 ? (
                <div
                  className="
                    bhn-badge
                    bhn-badge-brand
                    mt-4
                  "
                >
                  {discountPercentage}% OFF
                </div>
              ) : (
                <div
                  className="
                    bhn-badge
                    bhn-badge-neutral
                    mt-4
                  "
                >
                  No discount available
                </div>
              )}

            </div>

            {/* EMI TOGGLE */}
            <div className="flex items-center justify-between mt-4">

              <h3
                className="
                  text-lg
                  sm:text-2xl
                  font-semibold
                  text-[#2B1D18] dark:text-[#ededed]
                "
              >
                Show EMI Options
              </h3>

              <button
                onClick={() => setEmiEnabled(!emiEnabled)}
                className={`
                  w-16
                  h-9
                  rounded-full
                  flex
                  items-center
                  px-1
                  transition-all
                  duration-300
                  ${emiEnabled ? "bg-[var(--bhn-brand-600)]" : "bg-[var(--bhn-neutral-300)]"}
                `}
              >

                <div
                  className={`
                    w-7
                    h-7
                    bg-white
                    rounded-full
                    shadow-md
                    transform
                    transition-all
                    duration-300
                    ${emiEnabled ? "translate-x-7" : "translate-x-0"}
                  `}
                />

              </button>

            </div>

            {/* EMI MONTHS */}
            {emiEnabled && (
              <>

                <div
                  className="
                    bg-[var(--bhn-surface-2)]
                    rounded-2xl
                    p-2
                    flex
                    flex-wrap
                    gap-2
                    mt-6
                  "
                >

                  {emiPlans.map((plan: EMIPlan) => (
                    <button
                      key={plan}
                      onClick={() => setSelectedPlan(plan)}
                      className={`
                        flex-1
                        min-w-[90px]
                        py-3
                        rounded-xl
                        text-sm
                        sm:text-base
                        font-medium
                        transition-all
                        duration-200
                        ${selectedPlan === plan
                          ? "bg-white text-[var(--bhn-brand-700)] shadow-sm"
                          : "text-[var(--bhn-text-muted)]"
                        }
                      `}
                    >
                      <div>{plan}</div>
                      <div className="text-xs text-[var(--bhn-brand-700)] mt-1">
                        ₹{monthlyPricing[plan]}/mo
                      </div>
                    </button>
                  ))}

                </div>

                <p
                  className="
                    text-center
                    text-lg
                    sm:text-xl
                    text-[var(--bhn-text-muted)]
                    mt-4
                  "
                >
                  Pay just <span className="font-semibold">₹{emiMonthly}/mo</span> for {selectedPlan.toLowerCase()}
                </p>

              </>
            )}

            {/* BUTTONS */}
            <div className="mt-6 space-y-4">

              <Button
                onClick={() => {
                  if (!courseId) {
                    console.error("Missing course ID for enroll");
                    return;
                  }
                  router.push(`/student/enroll/${id}`);
                }}
                className="
                  w-full
                  py-4
                  rounded-[var(--bhn-radius)]
                  text-lg
                  sm:text-xl
                  font-semibold
                "
              >
                Enroll Now
              </Button>

              <Button
                onClick={async () => {
                  const wishlistId = String(courseId || id);
                  if (!localStorage.getItem("token")) {
                    router.push(`/student/auth?next=${encodeURIComponent(`/student/view_details/${wishlistId}`)}`);
                    return;
                  }
                  try {
                    if (isWishlisted) {
                      await removeFromWishlist(wishlistId).unwrap();
                    } else {
                      await addToWishlist(wishlistId).unwrap();
                    }
                  } catch (err) {
                    console.error("Wishlist update failed", err);
                  }
                }}
                disabled={isWishlistLoading}
                variant="outline"
                className="
                w-full
                py-4
                rounded-[var(--bhn-radius)]
                text-lg
                sm:text-xl
                font-semibold
                flex
                items-center
                justify-center
                gap-3
                   "
              >
                <span
                  className={`text-2xl transition-all ${isWishlisted
                    ? "text-[var(--bhn-error-500)]"
                    : "text-[var(--bhn-brand-600)]"
                    }`}
                >
                  {isWishlisted ? "❤️" : "🤍"}
                </span>

                <span className="text-[var(--bhn-text)]">
                  {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                </span>
              </Button>

            </div>

            {/* DIVIDER */}
            <div className="border-t mt-4 mb-4" />

            {/* INCLUDES */}
            <div>

              <h3
                className="
                  text-xl
                  sm:text-2xl
                  font-semibold
                  mb-6
                  text-[#2B1D18] dark:text-[#ededed]
                "
              >
                Includes:
              </h3>

              <div
                className="
                  space-y-5
                  text-sm
                  sm:text-lg
                  text-[#5E514B] dark:text-[#a89080]
                "
              >

                <div className="flex items-center gap-4">
                  <span className="text-[#8B5E3C] dark:text-[#c9a882]">▣</span>
                  <p>{(course.duration || course.totalDuration || "Self-paced")} of on-demand video</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[#8B5E3C] dark:text-[#c9a882]">▤</span>
                  <p>{totalLessons} lessons • {modules.length} modules</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[#8B5E3C] dark:text-[#c9a882]">◉</span>
                  <p>{course.language || "English"}{course.subtitle ? ` • ${course.subtitle}` : ""}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[#8B5E3C] dark:text-[#c9a882]">∞</span>
                  <p>Certificate of completion</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[#8B5E3C] dark:text-[#c9a882]">∞</span>
                  <p>Full lifetime access</p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
