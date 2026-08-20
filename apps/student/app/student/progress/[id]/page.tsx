"use client";

import StudentHeader from "@/components/common/StudentHeader";
import Button from "@/components/common/Button";
import {
  Download,
  Share2,
  Filter,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useGetProgressQuery } from "@/app/redux/services/courseApi";


export default function ProgressPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  const { data: progressResponse, isLoading: isProgressLoading, isError: isProgressError } = useGetProgressQuery(id, {
    skip: !id,
  });

  // Extract progress data from API response
  const progress = progressResponse?.data ?? progressResponse;

  const completedCourses = progress?.recentlyCompleted ?? progress?.completedCourses ?? [];
  const certificateItems = progress?.certificates
    ? progress.certificates.map((certificate: any, index: number) => ({
        id: certificate._id ?? certificate.courseId ?? index,
        title: certificate.title ?? "Certificate",
        date: certificate.issuedDate
          ? new Date(certificate.issuedDate).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : certificate.date ?? "Unknown date",
      }))
    : [];

  const overallProgress = progress?.statistics?.overallProgress ?? progress?.overallProgress ?? 0;
  const coursesCompleted = progress?.statistics?.coursesCompleted ?? progress?.coursesCompleted ?? 0;
  const coursesInProgress = progress?.statistics?.coursesInProgress ?? progress?.coursesInProgress ?? 0;
  const hoursLearned = progress?.statistics?.totalLearningHours ?? progress?.hoursLearned ?? 0;

  const weeklyActivity = progress?.weeklyProgress ?? progress?.weeklyActivity ?? [];
  const weeklyChartData = weeklyActivity.length === 7
    ? weeklyActivity
    : hoursLearned > 0
      ? Array(7).fill(Math.round((hoursLearned / 7) * 10))
      : [0, 0, 0, 0, 0, 0, 0];

  const [sortOrder, setSortOrder] = useState("latest");

  const sortedCertificates = useMemo(() => {
    return [...certificateItems].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [certificateItems, sortOrder]);

  if (isProgressLoading) {
    return (
      <div className="bg-[#F7F3EF] dark:bg-[#171717] min-h-screen flex items-center justify-center p-4">
        <div className="rounded-3xl border border-[#E8DDD5] dark:border-[#374151] bg-white p-5 shadow-sm text-center">
          <p className="text-lg font-semibold text-[#2B1D18] dark:text-[#ededed]">Loading progress...</p>
          <p className="text-sm text-[#7B6A62] dark:text-[#b89b7d] mt-2">Fetching your course progress data.</p>
        </div>
      </div>
    );
  }

  if (isProgressError) {
    return (
      <div className="bg-[#F7F3EF] dark:bg-[#171717] min-h-screen flex items-center justify-center p-4">
        <div className="rounded-3xl border border-[#E8DDD5] dark:border-[#374151] bg-white p-5 shadow-sm text-center">
          <p className="text-lg font-semibold text-[#C05C5C]">Unable to load progress</p>
          <p className="text-sm text-[#7B6A62] dark:text-[#b89b7d] mt-2">Please try again later or return to your courses.</p>
          <button
            onClick={() => router.push("/student/courses")}
            className="mt-5 px-6 py-3 rounded-lg bg-[#8B4A28] dark:bg-[#b86a3a] text-white text-sm font-medium hover:bg-[#744024] dark:hover:bg-[#a05a30] transition"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const handleDownload = async (certificate: any) => {
    const token = localStorage.getItem("token");
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://bandhan-backend-gykw.onrender.com/api";
    const certId = certificate.id ?? certificate._id ?? "";
    try {
      const res = await fetch(`${apiBase}/student/progress/${id}/certificate/${certId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${certificate.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Certificate download failed. Please try again.");
      }
    } catch {
      alert("Certificate download failed. Please try again.");
    }
  };

  const handleShare = async (certificate: any) => {
    const shareData = {
      title: certificate.title,
      text: `I earned the certificate: ${certificate.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.url}`
        );

        alert("Certificate link copied!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EF] dark:bg-[#171717]">

      {/* HEADER */}
      <StudentHeader />

      <div className="px-4 sm:px-6 lg:px-5 py-6">

        {/* TOP */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

          <div>

            {/* <p className="text-xs sm:text-sm text-[#A08E84] dark:text-[#6a5a4a]">
              Home / Dashboard / Progress & Certificates
            </p> */}

            <h1 className="text-xl sm:text-2xl font-bold text-[#2D201B] dark:text-[#ededed] mt-3 leading-tight">
              Progress & Certificates
            </h1>

            <p className="text-[#8A7A71] dark:text-[#7a6a5a] mt-2 text-base sm:text-lg">
              Track your learning journey and achievements
            </p>

          </div>

          <Button
            onClick={() => router.push("/student/courses")}
            className="bg-[#8B4A28] dark:bg-[#b86a3a] text-white px-5 sm:px-4 py-2 text-sm hover:bg-[#744024] dark:hover:bg-[#a05a30] transition-all duration-200 w-full sm:w-fit cursor-pointer">
            Browse More Courses
          </Button>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">

          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E8DDD5] dark:border-[#374151]">

            <p className="text-[#C05C5C] text-sm uppercase tracking-wide">
              Courses Completed
            </p>

            <h2 className="text-xl font-bold mt-3 text-[#2D201B] dark:text-[#ededed]">
              {coursesCompleted}
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E8DDD5] dark:border-[#374151]">

            <p className="text-[#C05C5C] text-sm uppercase tracking-wide">
              In Progress
            </p>

            <h2 className="text-xl font-bold mt-3 text-[#2D201B] dark:text-[#ededed]">
              {coursesInProgress} Courses
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E8DDD5] dark:border-[#374151]">

            <p className="text-[#C05C5C] text-sm uppercase tracking-wide">
              Total Learning Hours
            </p>

            <h2 className="text-xl font-bold mt-3 text-[#2D201B] dark:text-[#ededed]">
              {hoursLearned}h
            </h2>

          </div>

        </div>

        {/* PROGRESS */}
        <div className="grid grid-cols-1 xl:grid-cols-[350px_1fr] gap-4 mt-4">

          {/* LEFT */}
          <div className="bg-white rounded-2xl p-5 sm:p-5 border border-[#E8DDD5] dark:border-[#374151]">

            <h3 className="text-lg sm:text-xl font-semibold text-[#2D201B] dark:text-[#ededed]">
              Course Completion
            </h3>

            <div className="flex justify-center mt-4 sm:mt-6">

              <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] rounded-full border-[10px] border-[#8B4A28] dark:border-[#c9a882] flex items-center justify-center">

                <div className="text-center">

                  <h1 className="text-xl sm:text-2xl font-bold text-[#2D201B] dark:text-[#ededed]">
                    {overallProgress}%
                  </h1>

                  <p className="text-[#8A7A71] dark:text-[#7a6a5a] text-sm mt-1">
                    Overall
                  </p>

                </div>

              </div>

            </div>

            <p className="text-center text-[#8A7A71] dark:text-[#7a6a5a] mt-6 sm:mt-4 leading-relaxed text-sm sm:text-base">
              {overallProgress > 0
                ? `${coursesCompleted} course${coursesCompleted !== 1 ? "s" : ""} completed, ${coursesInProgress} in progress. Keep going!`
                : "You are doing great! Complete 2 more lessons to reach your weekly goal."}
            </p>

          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-2xl p-5 sm:p-5 border border-[#E8DDD5] dark:border-[#374151] flex flex-col justify-between overflow-x-auto">

            <div className="w-full overflow-hidden">

              <h3 className="text-lg sm:text-xl font-semibold text-[#2D201B] dark:text-[#ededed]">
                Weekly Learning Activity
              </h3>

              {/* CHART */}
              <div
                className="
                flex
                items-end
                justify-between
                h-[220px]
                mt-6
                gap-2
                sm:gap-3
                px-1
                w-full
               "
              >
                {weeklyChartData.map((height: number, index: number) => (
                  <div
                    key={index}
                    className="
                    flex-1
                    bg-[#8B4A28] dark:bg-[#b86a3a]
                    rounded-t-xl
                    min-w-[24px]
                     "
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              {/* DAYS */}
              <div
                className="
                flex
                justify-between
                text-xs
                sm:text-sm
                text-[#8A7A71] dark:text-[#7a6a5a]
                mt-4
                px-1
                w-full
              "
              >
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span
                    key={day}
                    className="flex-1 text-center"
                  >
                    {day}
                  </span>
                ))}
              </div>

            </div>

              <div className="flex justify-start sm:justify-end mt-6">

              <div className="bg-[#F8EEE8] dark:bg-[#1a1a1a] text-[#8B4A28] dark:text-[#c9a882] px-4 py-2 rounded-full text-sm">
                {hoursLearned > 0 ? `${(hoursLearned / 7).toFixed(1)}h/day` : "No data yet"}
              </div>

            </div>

          </div>

        </div>

        {/* RECENTLY COMPLETED */}
        <div className="mt-6">

          <h2 className="text-2xl sm:text-xl font-bold text-[#2D201B] dark:text-[#ededed]">
            Recently Completed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">

            {completedCourses.map((course: any, index: number) => (

              <div
                key={course.courseName ?? index}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8DDD5] dark:border-[#374151]"
              >

                <img
                  src={course.image}
                  className="w-full h-[220px] object-cover"
                  alt={course.title}
                />

                <div className="p-5">

                  <div className="inline-block bg-[#EAF7EF] dark:bg-[#0a2018] text-[#4F8B68] text-xs px-3 py-1 rounded-full font-medium">
                    COMPLETED
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold mt-4 text-[#2D201B] dark:text-[#ededed] leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-[#8A7A71] dark:text-[#7a6a5a] mt-2 text-sm sm:text-base">
                    By {course.author}
                  </p>

                  <button
                    onClick={() => alert("Certificate download will be available upon course completion.")}
                    className="
                    text-[#8B4A28] dark:text-[#c9a882]
                    font-medium
                    mt-5
                    text-sm
                    sm:text-base
                    cursor-pointer
                    transition-all
                    duration-150
                    hover:text-[#6E3D20]
                    hover:underline
                    active:scale-95
                  "
                  >
                    View Certificate →
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* CERTIFICATES */}
        <div className="mt-4">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <h2 className="text-2xl sm:text-xl font-bold text-[#2D201B] dark:text-[#ededed]">
              My Certificates
            </h2>

            <button
              onClick={() =>
                setSortOrder((prev) =>
                  prev === "latest" ? "oldest" : "latest"
                )
              }
              className="
               flex
               items-center
               gap-2
               text-[#8B4A28] dark:text-[#c9a882]
               text-sm
               sm:text-base
               cursor-pointer
               hover:opacity-80
              "
            >
              <Filter size={18} />

              {sortOrder === "latest"
                ? "Latest First"
                : "Oldest First"}
            </button>

          </div>

          <div className="space-y-5 mt-6">

            {sortedCertificates.map((certificate) => (

              <div
                key={certificate.id}
                className="bg-white rounded-2xl border border-[#E8DDD5] dark:border-[#374151] p-4 sm:p-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
              >

                <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-4 flex-1">

                  {/* CERTIFICATE ICON */}
                  <div className="w-full sm:w-[130px] h-[100px] bg-[#F8EEE8] dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center flex-shrink-0">

                    <div className="text-center text-[#C2AEA1] dark:text-[#7a6a5a]">

                      <div className="text-xl">✪</div>

                      <p className="text-xs mt-2">
                        BADGE
                      </p>

                    </div>

                  </div>

                  {/* INFO */}
                  <div className="flex-1">

                    <h3 className="text-xl sm:text-2xl font-semibold text-[#2D201B] dark:text-[#ededed] leading-snug">
                      {certificate.title}
                    </h3>

                    <p className="text-[#8A7A71] dark:text-[#7a6a5a] mt-2 leading-relaxed text-sm sm:text-base">
                      Mastered fundamental principles and practical applications through comprehensive coursework and hands-on projects.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-5 mt-4 text-sm text-[#8A7A71] dark:text-[#7a6a5a]">

                      <span>{certificate.date}</span>

                      <span>✔ Verified</span>

                    </div>

                  </div>

                </div>

                {/* BUTTONS */}
                <div className="flex flex-col sm:flex-row xl:flex-col gap-3 w-full xl:w-auto">

                  <button
                    onClick={() => handleDownload(certificate)}
                    className="
                    bg-[#8B4A28] dark:bg-[#b86a3a]
                    hover:bg-[#744024] dark:hover:bg-[#a05a30]
                    active:scale-95
                    text-white
                    px-5
                    py-3
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    gap-2
                    transition-all
                    duration-200
                    w-full
                    sm:w-auto
                    "
                  >
                    <Download size={18} />
                    Download PDF
                  </button>

                  <button
                    onClick={() => handleShare(certificate)}
                    className="
                     border
                     border-[#E1D3CA] dark:border-[#374151]
                     px-5
                     py-3
                     rounded-xl
                     flex
                     items-center
                     justify-center
                     gap-2
                     text-[#6E5E55] dark:text-[#a89080]
                     hover:bg-[#F9F4F1] dark:hover:bg-[#1a1a1a]
                     active:scale-95
                     transition-all
                     duration-200
                     w-full
                     sm:w-auto
                     cursor-pointer
                   "
                  >
                    <Share2 size={18} />
                    Share
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}
