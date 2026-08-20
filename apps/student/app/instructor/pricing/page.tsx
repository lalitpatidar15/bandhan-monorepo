"use client";

import React, { useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Info,
  Tag,
  Rocket,
} from "lucide-react";
import { useEffect, useState } from "react";
import CurriculumHeader from "@/components/common/CurriculumHeader";
import { useUpdatePricingMutation, useUpdateEmiMutation, useUpdateVisibilityMutation, usePublishCourseMutation, useGetPricingPageQuery } from "@/app/redux/instructor-services/courseApi";

function PricingPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = (searchParams.get("courseId") || (params.id as string | undefined) || "") as string;
  const [updatePricing, { isLoading: isSavingPricing }] = useUpdatePricingMutation();
  const [updateEmi] = useUpdateEmiMutation();
  const [updateVisibility] = useUpdateVisibilityMutation();
  const [publishCourse, { isLoading: isPublishing }] = usePublishCourseMutation();
  const { data: pricingPageData, refetch: refetchPricingPage } = useGetPricingPageQuery(courseId, { skip: !courseId });
  const course = pricingPageData?.data?.course || pricingPageData?.data;
  const courseTitle = course?.title || "Course Title";
  const courseCategory = course?.category || "Category";
  const courseStatus = course?.status || "draft";
  const courseLessons = course?.totalLessons ?? course?.curriculumSummary?.totalLessons ?? 0;
  const courseDuration = course?.totalDuration ?? course?.duration ?? "";
  const courseThumbnail = course?.thumbnail || "";
  const publishReadiness = pricingPageData?.data?.publishReadiness || {};
  const [enableDiscount, setEnableDiscount] = useState(true);
  const [enableEMI, setEnableEMI] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("3");
  const [selected, setSelected] = useState("Public");
  const [basicPrice, setBasicPrice] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [pricingReady, setPricingReady] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const hydratedCourseId = useRef<string | null>(null);

  const handleSavePricing = async () => {
    if (!courseId) {
      alert("Missing course id.");
      return false;
    }

    const priceValue = Number(basicPrice.replace(/[^\d.]/g, ""));
    if (!priceValue || Number.isNaN(priceValue)) {
      alert("Please enter a valid base price.");
      return false;
    }

    try {
      await updatePricing({
        courseId,
        basePrice: priceValue,
        enableDiscount,
        discountPercentage: enableDiscount ? Number(discountValue || 0) : 0,
      }).unwrap();
      return true;
    } catch (error: any) {
      console.error(error);
      alert(error?.data?.message || error?.message || "Unable to save pricing.");
      return false;
    }
  };

  const handleSaveEmi = async () => {
    if (!courseId) {
      return false;
    }

    const plans = enableEMI
      ? [{ months: Number(selectedMonth || 0) }]
      : [];

    try {
      await updateEmi({
        courseId,
        enabled: enableEMI,
        plans,
      }).unwrap();
      return true;
    } catch (error: any) {
      console.error(error);
      return false;
    }
  };

  const handleSaveVisibility = async () => {
    if (!courseId) {
      return false;
    }

    try {
      await updateVisibility({
        courseId,
        visibility: selected.toLowerCase(),
      }).unwrap();
      return true;
    } catch (error: any) {
      console.error(error);
      return false;
    }
  };

  const handleSaveAllSettings = async () => {
    const pricingSaved = await handleSavePricing();
    if (!pricingSaved) return false;

    const [emiSaved, visibilitySaved] = await Promise.all([handleSaveEmi(), handleSaveVisibility()]);
    if (!emiSaved || !visibilitySaved) return false;

    await refetchPricingPage();
    return true;
  };

  const handlePublish = async () => {
    if (isSavingSettings || isSavingPricing || isPublishing) return;
    setIsSavingSettings(true);

    try {
      const saved = await handleSaveAllSettings();
      if (!saved) return;

      await publishCourse({ courseId }).unwrap();
      router.push("/instructor/performance");
    } catch (error: any) {
      console.error(error);
      alert(error?.data?.message || error?.message || "Unable to publish course.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    if (!courseId || hydratedCourseId.current === courseId || !pricingPageData?.data) return;

    const pricing = pricingPageData.data.pricing || {};
    const emi = pricingPageData.data.emi || {};
    setBasicPrice(pricing.basePrice != null ? String(pricing.basePrice) : "");
    setDiscountValue(pricing.discountPercentage != null ? String(pricing.discountPercentage) : "0");
    setEnableDiscount(Boolean(pricing.enableDiscount));
    setEnableEMI(Boolean(emi.enabled));
    setSelectedMonth(String(emi.plans?.[0]?.months || emi.months || "3"));
    setSelected(String(pricingPageData.data.visibility || "public").replace(/^./, (value: string) => value.toUpperCase()));
    hydratedCourseId.current = courseId;
  }, [courseId, pricingPageData]);

  useEffect(() => {
    const isReady = Boolean(
      basicPrice.trim() &&
      selected &&
      (!enableDiscount || discountValue.trim()) &&
      (!enableEMI || Boolean(selectedMonth))
    );

    setPricingReady(isReady);

  }, [basicPrice, discountValue, enableDiscount, enableEMI, selectedMonth, selected]);

  const price = Number(basicPrice.replace(/[^\d.]/g, "")) || 0;

  const discount = enableDiscount
    ? Number(discountValue) || 0
    : 0;

  const finalPrice =
    enableDiscount && discount > 0
      ? price - (price * discount) / 100
      : price;

  const estimatedEarning = finalPrice > 0 ? Math.round(finalPrice * 0.8) : 0;
  const estimatedFee = finalPrice > 0 ? Math.round(finalPrice * 0.2) : 0;

  const emiAmount =
    enableEMI && Number(selectedMonth) > 0
      ? Math.floor(finalPrice / Number(selectedMonth))
      : 0;

  const options = [
    {
      title: "Public",
      desc: "Visible to all students on the marketplace",
    },
    {
      title: "Private",
      desc: "Only students with the direct link can access",
    },
    {
      title: "Draft",
      desc: "Hidden from everyone, only visible in your panel",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EF] text-[#2D201B] overflow-x-hidden">

      {/* HEADER */}
      <CurriculumHeader currentStep={4} />

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* RESPONSIVE GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-4">

          {/* ================= LEFT SIDE ================= */}
          <div className="space-y-5">

            {/* COURSE PRICING */}
            <div className="bg-white rounded-2xl border border-[#E8DDD5] p-4 sm:p-4">

              <h2 className="text-2xl sm:text-[24px] font-serif font-semibold mb-6">
                Course Pricing
              </h2>

              <div>

                <label className="text-sm text-[#7A6C64] mb-2 block">
                  Basic Price (₹)
                </label>

                <input
                  type="text"
                  placeholder="2,499"
                  value={basicPrice}
                  onChange={(event) => setBasicPrice(event.target.value)}
                  className="
                  w-full
                  h-12
                  rounded-xl
                  border
                  border-[#E3D7CF]
                  px-4
                  outline-none
                  text-[15px]
                  placeholder:text-[#B7AAA1]
                  focus:border-[#8B4A28]
                 "
                />

                <p className="text-xs text-[#A19188] mt-2">
                  Courses between ₹999–₹2,999 perform best
                </p>

              </div>

            </div>

            {/* DISCOUNT */}
            <div className="bg-white rounded-2xl border border-[#E8DDD5] p-4 sm:p-4">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

                <h2 className="text-2xl sm:text-[24px] font-serif font-semibold">
                  Discounts
                </h2>

                {/* Toggle */}
                <div className="flex items-center gap-3">

                  <div
                    onClick={() => setEnableDiscount(!enableDiscount)}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300
              ${enableDiscount ? "bg-[#8A4A26]" : "bg-[#D8CCC4]"}
            `}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300
                ${enableDiscount ? "right-0.5" : "left-0.5"}
              `}
                    />
                  </div>

                  <span className="text-sm text-[#6F5E55]">
                    Enable Discount
                  </span>

                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">

                {/* Input */}
                <div>

                  <label className="text-sm text-[#7A6C64] mb-2 block">
                    Discount Percentage (%)
                  </label>

                  <input
                    type="text"
                    placeholder="40"
                    value={discountValue}
                    onChange={(event) => setDiscountValue(event.target.value)}
                    disabled={!enableDiscount}
                    className={`
                    w-full
                    h-12
                    rounded-xl
                    border
                    border-[#E3D7CF]
                    px-4
                    outline-none
                    text-[15px]
                    placeholder:text-[#B7AAA1]
                    transition
                    focus:border-black
                    focus:ring-0
                    ${enableDiscount
                        ? "bg-white text-black"
                        : "bg-[#F1ECE8] text-gray-400 cursor-not-allowed"
                      }
                      `}
                  />
                </div>

                {/* Price Box */}
                <div
                  className={`rounded-xl min-h-[48px] flex items-center gap-3 px-4 lg:mt-7
                   ${enableDiscount
                      ? "bg-[#F8F5F2]"
                      : "bg-[#EFEAE6] opacity-60"
                    }
                      `}
                >
                  <Tag size={16} className="text-[#8A4A26]" />

                  <span className="text-sm text-[#6B5A52]">
                    {price > 0 ? (
                      `Students will pay ₹${finalPrice}`
                    ) : (
                      "Enter course price"
                    )}
                  </span>

                </div>

              </div>

            </div>

            {/* EMI OPTION */}
            <div className="bg-white rounded-2xl border border-[#E8DDD5] p-4 sm:p-4">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

                <h2 className="text-2xl sm:text-[24px] font-serif font-semibold">
                  EMI Option
                </h2>

                {/* Toggle */}
                <div className="flex items-center gap-3">

                  <div
                    onClick={async () => {
                      const nextValue = !enableEMI;
                      if (!courseId) return;
                      const pricingSaved = await handleSavePricing();
                      if (!pricingSaved) return;
                      setEnableEMI(nextValue);
                      try {
                        await updateEmi({
                          courseId,
                          enabled: nextValue,
                          plans: nextValue ? [{ months: Number(selectedMonth || 0) }] : [],
                        }).unwrap();
                      } catch (error: any) {
                        console.error(error);
                      }
                    }}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300
              ${enableEMI ? "bg-[#8A4A26]" : "bg-[#EFE7E1]"}
            `}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 border border-[#DDD] transition-all duration-300
                ${enableEMI ? "right-0.5" : "left-0.5"}
              `}
                    />
                  </div>

                  <span className="text-sm text-[#6F5E55]">
                    Enable EMI
                  </span>

                </div>

              </div>

              {/* EMI Months */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {["3", "6", "12"].map((month, index) => (

                  <div
                    key={index}
                    onClick={async () => {
                      if (!enableEMI || !courseId) return;
                      const pricingSaved = await handleSavePricing();
                      if (!pricingSaved) return;
                      setSelectedMonth(month);
                      try {
                        await updateEmi({
                          courseId,
                          enabled: true,
                          plans: [{ months: Number(month) }],
                        }).unwrap();
                      } catch (error: any) {
                        console.error(error);
                      }
                    }}
                    className={`rounded-xl border h-[78px] flex flex-col items-center justify-center transition cursor-pointer
              
              ${selectedMonth === month && enableEMI
                        ? "border-[#8A4A26] bg-[#FFF9F6]"
                        : "border-[#E5DCD6] bg-white"
                      }

              ${!enableEMI
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-[#8A4A26]"
                      }
            `}
                  >

                    <span className="text-[22px] font-semibold">
                      {month}
                    </span>

                    <span className="text-xs text-[#9C8E86] tracking-wide">
                      MONTHS
                    </span>

                  </div>

                ))}

              </div>

              {/* Installment */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-6">

                <span className="text-sm text-[#8A7C74]">
                  Estimated Installment:
                </span>

                <span className="font-semibold text-[15px]">

                  {enableEMI
                    ? `₹${emiAmount}/month for ${selectedMonth} months`
                    : "EMI Disabled"}

                </span>

              </div>

            </div>

            {/* VISIBILITY */}
            <div className="bg-white rounded-2xl border border-[#E8DDD5] p-4 sm:p-4">

              <h2 className="text-2xl sm:text-[24px] font-serif font-semibold mb-6">
                Visibility Settings
              </h2>

              <div className="space-y-4">

                {options.map((item, index) => {

                  const active = selected === item.title;

                  return (
                    <div
                      key={index}
                      onClick={async () => {
                        setSelected(item.title);
                        if (courseId) {
                          try {
                            await updateVisibility({ courseId, visibility: item.title.toLowerCase() }).unwrap();
                          } catch (error: any) {
                            console.error(error);
                          }
                        }
                      }}
                      className={`border rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all duration-300

                ${active
                          ? "border-[#D7C3B8] bg-[#FFF9F6]"
                          : "border-[#ECE3DD] bg-white hover:border-[#D7C3B8]"
                        }
              `}
                    >

                      {/* Radio */}
                      <div
                        className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0

                  ${active
                            ? "border-[#8A4A26]"
                            : "border-[#D8CDC6]"
                          }
                `}
                      >

                        {active && (
                          <div className="w-2 h-2 rounded-full bg-[#8A4A26]" />
                        )}

                      </div>

                      {/* Content */}
                      <div>

                        <h4 className="font-medium text-[15px] text-[#2D201B]">
                          {item.title}
                        </h4>

                        <p className="text-xs text-[#9B8D85] mt-1 leading-relaxed">
                          {item.desc}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>

              {/* Selected Option */}
              <div className="mt-5 text-sm text-[#8A4A26] font-medium">
                Selected: {selected}
              </div>

            </div>

          </div>

          {/* ================= RIGHT SIDEBAR ================= */}
          <div className="space-y-4">

            {/* COURSE CARD */}
            <div className="bg-white rounded-2xl border border-[#E8DDD5] overflow-hidden">

              <div
                className="h-[180px] relative flex items-center justify-center px-4 text-center"
                style={{ backgroundColor: courseThumbnail ? "transparent" : "#111" }}
              >
                {courseThumbnail && (
                  <img src={courseThumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}

                <span className="absolute top-3 left-3 text-[10px] bg-white px-2 py-1 rounded font-semibold">
                  {courseStatus.toUpperCase()}
                </span>

                <h3 className="text-white text-2xl sm:text-[28px] font-light tracking-wide relative z-10">
                  {courseTitle}
                </h3>

              </div>

              <div className="p-5">

                <h3 className="font-semibold text-[17px] leading-snug">
                  {courseTitle}
                </h3>

                <p className="text-sm text-[#8D7F77] mt-1">
                  {courseCategory}
                </p>

                <div className="flex flex-wrap gap-4 mt-4 text-xs text-[#8B7B73]">
                  <span>{courseLessons} Lessons</span>
                  {courseDuration && <span>{courseDuration}</span>}
                </div>

              </div>

            </div>

            {/* PUBLISH READINESS */}
            <div className="bg-white rounded-2xl border border-[#E8DDD5] p-5">

              <h3 className="text-xs tracking-wide uppercase text-[#9B8C83] mb-4">
                Publish Readiness
              </h3>

              <div className="space-y-3">

                {[
                  { label: "Basic info completed", done: !!publishReadiness?.basicInfo },
                  { label: "Curriculum added", done: !!publishReadiness?.curriculum },
                  { label: "Content uploaded", done: !!publishReadiness?.content },
                  { label: "Pricing set", done: !!(publishReadiness?.pricing ?? pricingReady) },
                ].map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >

                    <CheckCircle
                      size={18}
                      className={`${item.done ? "text-[#22C55E]" : "text-[#D0C1B8]"} shrink-0`}
                    />

                    <span className={`text-sm ${item.done ? "text-[#2D201B]" : "text-[#5E514A]"}`}>
                      {item.label}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* ESTIMATED EARNING */}
            <div className="bg-[#F3E9E1] rounded-2xl border border-[#E8DDD5] p-5">

              <div className="flex items-center justify-between">

                <h3 className="text-xs tracking-wide uppercase text-[#9B8C83]">
                  Estimated Earnings
                </h3>

                <Info size={14} className="text-[#B39D90]" />

              </div>

              <div className="mt-4">

                <p className="text-[32px] font-semibold">
                  {estimatedEarning > 0 ? `₹${estimatedEarning}` : "—"}
                </p>

                <p className="text-sm text-[#8B7D75]">
                  per sale
                </p>

                <p className="text-xs text-[#AA9B93] mt-3 leading-relaxed">
                  This reflects your take-home after the 20% platform fee.
                  {finalPrice > 0 && (
                    <span> Based on ₹{finalPrice} selling price.</span>
                  )}
                </p>

                {finalPrice > 0 ? (
                  <p className="text-xs text-[#AA9B93] mt-2">
                    Estimated fee: ₹{estimatedFee}
                  </p>
                ) : (
                  <p className="text-xs text-[#AA9B93] mt-2">
                    Enter a price to calculate fee.
                  </p>
                )}

              </div>

            </div>

            {/* BUTTON */}
            <button
              onClick={handlePublish}
              disabled={isSavingSettings || isSavingPricing || isPublishing}
              className="
              w-full h-14 rounded-xl bg-[#8A4A26] text-white
              font-medium flex items-center justify-center gap-2
              transition-all duration-200
              hover:opacity-95 hover:scale-[1.02]
              active:scale-[0.96]
              active:shadow-inner
              shadow-md hover:shadow-lg
            "
            >

              <Rocket
                size={18}
                className="transition-transform duration-200"
              />

              {isSavingSettings || isSavingPricing || isPublishing ? "Publishing..." : "Publish Course"}

            </button>

            {/* EXTRA BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 text-sm text-[#7D6E66]">

              <button
                onClick={async () => {
                  const saved = await handleSaveAllSettings();
                  if (saved) {
                    alert("Settings saved as draft.");
                  }
                }}
                className="hover:text-[#8A4A26] transition"
              >
                Save as Draft
              </button>

              <button onClick={() => router.push(`/course-preview?courseId=${encodeURIComponent(courseId)}`)} className="hover:text-[#8A4A26] transition">
                Preview Course
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#E6DAD2] mt-4 bg-[#F3E9E1]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row items-center justify-between gap-5 text-sm text-[#8F7D74] text-center lg:text-left">

          <h3 className="font-semibold text-[#8A4A26]">
            Sahara Academy
          </h3>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-5">

            <span onClick={() => window.open("/instructor/policy", "_blank")} className="cursor-pointer hover:underline">Instructor Policy</span>
            <span onClick={() => window.open("/help", "_blank")} className="cursor-pointer hover:underline">Help Center</span>
            <span onClick={() => window.open("/terms", "_blank")} className="cursor-pointer hover:underline">Terms of Service</span>

          </div>

          <span>
            © 2024 Sahara Academy. All rights reserved.
          </span>

        </div>

      </footer>

    </div>
  );
}

export default function PricingPage() {
  return <React.Suspense fallback={<div className="min-h-screen bg-[#F7F3EF]" />}><PricingPageContent /></React.Suspense>;
}
