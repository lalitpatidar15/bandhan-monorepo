"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  Users,
  CheckCircle2,
  DollarSign,
  Star,
  MessageSquare,
  MoreHorizontal,
  UserPlus,
  MessageSquareQuote,
  GraduationCap,
  PencilLine,
  CirclePlus,
  Tag,
  MessageSquareText,
} from "lucide-react";


import InstructorHeader from "@/components/common/CourseHeader";
import { useGetInstructorOverviewQuery, useGetInstructorCourseDashboardQuery } from "@/app/redux/instructor-services/DashboardApi";

export default function CoursePerformanceDashboard() {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const { data: overviewData, isLoading } = useGetInstructorOverviewQuery();
  const firstCourseId = useMemo(() => overviewData?.data?.courses?.[0]?._id, [overviewData]);
  const activeCourseId = courseId || firstCourseId;

  const { data: courseDashboard, isLoading: isDashboardLoading } =
    useGetInstructorCourseDashboardQuery(activeCourseId, { skip: !activeCourseId });

  const dashboard = courseDashboard?.data;

  const [selectedPeriod, setSelectedPeriod] = useState("7D");

  const getBadgeStyle = (change: string | undefined) => {
    if (!change || change === "Stable" || change === "0%") return "bg-[#EFE7E1] text-[#6F5E55]";
    if (change.startsWith("+")) return "bg-[#DFF6E7] text-[#16A34A]";
    if (change.startsWith("-")) return "bg-[#FBE7E4] text-[#C2410C]";
    return "bg-[#EFE7E1] text-[#6F5E55]";
  };

  const ov = dashboard?.overview;
  const statCards = [
    {
      icon: <Users size={18} className="text-[#8A4A26]" />,
      label: "Total Students",
      value: ov?.totalStudents?.toLocaleString() ?? "0",
      badge: ov?.totalStudentsChange ?? "0%",
    },
    {
      icon: <CheckCircle2 size={18} className="text-[#8A4A26]" />,
      label: "Completion Rate",
      value: ov?.completionRate != null ? `${ov.completionRate}%` : "0%",
      badge: ov?.completionRateChange ?? "0%",
    },
    {
      icon: <DollarSign size={18} className="text-[#8A4A26]" />,
      label: "Total Revenue",
      value: ov?.totalRevenue != null ? `₹${Number(ov.totalRevenue).toLocaleString("en-IN")}` : "₹0",
      badge: ov?.totalRevenueChange ?? "0%",
    },
    {
      icon: <Star size={18} className="text-[#8A4A26]" />,
      label: "Average Rating",
      value: ov?.averageRating?.toFixed(2) ?? "0.00",
      badge: ov?.averageRatingChange ?? "Stable",
    },
  ];

  const tabs = [
    {
      name: "Overview",
      path: "/instructor/performance",
    },
    {
      name: "Students",
      path: "/instructor/performance/student",
    },
    {
      name: "Review",
      path: "/instructor/performance/review",
    },
  ];

  const uploadedCourses: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    students: string;
    lessons: string;
    price: string;
    rating: string;
    updated: string;
    progress: number;
  }> = (overviewData?.data?.courses || []).map((course: any) => ({
    id: course._id,
    title: course.title,
    category: course.category || "Course",
    status: course.status === "published" ? "Published" : "Draft",
    students: String(course.totalStudents ?? 0),
    lessons: String(course.curriculumSummary?.totalLessons ?? 0),
    price: `₹${Number(course.pricing?.finalPrice ?? course.pricing?.basePrice ?? 0).toLocaleString("en-IN")}`,
    rating: Number(course.rating ?? 0).toFixed(1),
    updated: course.updatedAt ? `Updated ${new Date(course.updatedAt).toLocaleDateString()}` : "",
    progress: course.curriculumSummary?.completion ?? 0,
  }));

  return (
    <div className="w-full min-h-screen bg-[#F7F3EF] overflow-x-hidden">

      {/* HEADER */}
      <InstructorHeader />

      {/* MAIN */}
      <div className="pt-6 sm:pt-8 px-4 sm:px-6 lg:px-5 w-full">

        <div className="w-full max-w-[1800px] mx-auto">

          {/* PAGE TITLE */}
          <div className="mb-6">

            <h1 className="
              text-[28px]
              sm:text-[34px]
              lg:text-[42px]
              leading-tight
              font-serif
              font-semibold
              text-[#2D201B]
            ">
              My Uploaded Courses
            </h1>
            <p className="mt-2 max-w-3xl text-sm sm:text-base text-[#7C6C64]">
              Review every course you have uploaded, check publishing status, and open performance, students, or reviews.
            </p>

          </div>

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
            mb-6
            whitespace-nowrap
          "
          >
            {tabs.map((tab) => {
              const isActive = pathname === tab.path;

              return (
                <button
                  key={tab.name}
                  onClick={() => router.push(tab.path)}
                  className={`
                  text-[15px]
                  sm:text-[17px]
                  font-medium
                  pb-2
                  transition-all
                  duration-200
                  cursor-pointer
                  flex-shrink-0

              ${isActive
                      ? "text-[#8A4A26] border-b-2 border-[#8A4A26]"
                      : "text-[#7C6C64] hover:text-[#8A4A26]"
                    }
            `}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* UPLOADED COURSE LIST */}
          <div className="bg-white rounded-2xl border border-[#E8DDD5] p-4 sm:p-4 mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
              <div>
                <h2 className="text-[24px] sm:text-[28px] font-serif font-semibold text-[#2D201B]">
                  Uploaded Courses
                </h2>
                <p className="text-sm text-[#8F8178] mt-1">
                  {uploadedCourses.length} courses available in your instructor library.
                </p>
              </div>

              <button
                onClick={() => router.push("/instructor/curriculum")}
                className="h-11 rounded-xl bg-[#8A4A26] px-5 text-sm font-semibold text-white hover:bg-[#713719] transition"
              >
                Add New Course
              </button>
            </div>

            <div className="grid gap-4">
              {isLoading && <p className="text-sm text-[#8F8178]">Loading courses...</p>}
              {uploadedCourses.map((course) => (
                <article
                  key={course.title}
                  className="rounded-xl border border-[#EFE7E2] bg-[#FCFAF8] p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#2D201B]">
                          {course.title}
                        </h3>
                        <span className="rounded-full bg-[#F4ECE6] px-3 py-1 text-xs font-semibold text-[#8A4A26]">
                          {course.category}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            course.status === "Published"
                              ? "bg-[#DFF6E7] text-[#16A34A]"
                              : course.status === "Draft"
                                ? "bg-[#EFE7E1] text-[#6F5E55]"
                                : "bg-[#FFF4D7] text-[#A16207]"
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-3 text-sm text-[#6F5E55] sm:grid-cols-2 lg:grid-cols-5">
                        <span>{course.students} students</span>
                        <span>{course.lessons} lessons</span>
                        <span>{course.price} price</span>
                        <span>{course.rating} rating</span>
                        <span>{course.updated}</span>
                      </div>

                      <div className="mt-4 max-w-xl">
                        <div className="mb-2 flex justify-between text-xs text-[#8F8178]">
                          <span>Course completion</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#E8DDD5]">
                          <div
                            className="h-full rounded-full bg-[#8A4A26]"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                      <button
                        onClick={() => router.push(`/instructor/performance?courseId=${course.id}`)}
                        className="h-10 rounded-lg border border-[#DEC9BC] px-3 text-sm font-medium text-[#5D4C44] hover:border-[#8A4A26] hover:text-[#8A4A26]"
                      >
                        Performance
                      </button>
                      <button
                        onClick={() => router.push(`/instructor/performance/student?courseId=${course.id}`)}
                        className="h-10 rounded-lg border border-[#DEC9BC] px-3 text-sm font-medium text-[#5D4C44] hover:border-[#8A4A26] hover:text-[#8A4A26]"
                      >
                        Students
                      </button>
                      <button
                        onClick={() => router.push(`/instructor/performance/review?courseId=${course.id}`)}
                        className="h-10 rounded-lg border border-[#DEC9BC] px-3 text-sm font-medium text-[#5D4C44] hover:border-[#8A4A26] hover:text-[#8A4A26]"
                      >
                        Reviews
                      </button>
                      <button
                        onClick={() => router.push(`/instructor/curriculum2/${course.id}`)}
                        className="h-10 rounded-lg bg-[#8A4A26] px-3 text-sm font-semibold text-white hover:bg-[#713719]"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* TOP MAIN GRID */}
          <div className="
            grid
            grid-cols-1
            xl:grid-cols-[1fr_320px]
            gap-4
            w-full
          ">

            {/* LEFT SIDE */}
            <div className="space-y-6 w-full">

              {/* STATS */}
              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                2xl:grid-cols-4
                gap-4
                w-full
              ">

                {statCards.map((card, index) => (
                  <div
                    key={index}
                    className="
                      bg-white
                      rounded-2xl
                      border
                      border-[#E8DDD5]
                      p-5
                    "
                  >

                    <div className="flex items-center justify-between">

                      <div className="
                        w-10
                        h-10
                        rounded-xl
                        bg-[#F4ECE6]
                        flex
                        items-center
                        justify-center
                      ">
                        {card.icon}
                      </div>

                      <span
                        className={`
                          text-[11px]
                          px-2
                          py-1
                          rounded-full
                          font-medium
                          ${getBadgeStyle(card.badge)}
                        `}
                      >
                        {card.badge}
                      </span>

                    </div>

                    <p className="
                      text-xs
                      uppercase
                      text-[#9B8D84]
                      mt-5
                    ">
                      {card.label}
                    </p>

                    <h2 className="
                      text-[32px]
                      sm:text-[40px]
                      leading-none
                      mt-2
                      font-semibold
                      text-[#2D201B]
                      break-words
                    ">
                      {card.value}
                    </h2>

                  </div>
                ))}

              </div>

              {/* CHART + ENGAGEMENT */}
              <div className="
                grid
                grid-cols-1
                2xl:grid-cols-[1fr_320px]
                gap-4
                w-full
              ">

                {/* ENROLLMENT */}
                <div className="
                  bg-white
                  rounded-2xl
                  border
                  border-[#E8DDD5]
                  p-4
                  sm:p-4
                  w-full
                ">

                  <div className="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-start
                    lg:justify-between
                    gap-4
                  ">

                    <div>

                      <h2 className="
                        text-[24px]
                        sm:text-[28px]
                        font-serif
                        font-semibold
                        text-[#2D201B]
                      ">
                        Enrollment Trends
                      </h2>

                      <p className="
                        text-sm
                        text-[#9C8E86]
                      ">
                        Daily student growth over time
                      </p>

                    </div>

                    <div className="
                      bg-[#F4ECE6]
                      rounded-xl
                      p-1
                      flex
                      gap-2
                      w-fit
                    ">

                      {["7D", "30D", "6M", "1Y"].map(
                        (item, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedPeriod(item)}
                            className={`
                              px-3
                              py-1
                              text-xs
                              rounded-lg
                              ${item === selectedPeriod
                                ? "bg-white text-[#8A4A26] shadow-sm"
                                : "text-[#6F5E55]"
                              }
                            `}
                          >
                            {item}
                          </button>
                        )
                      )}

                    </div>

                  </div>

                  {/* GRAPH */}
                  <div className="
                    h-[240px]
                    sm:h-[260px]
                    flex
                    items-end
                    gap-2
                    sm:gap-5
                    mt-6
                    px-1
                    sm:px-2
                  ">

                    {(dashboard?.enrollmentTrends?.length
                      ? dashboard.enrollmentTrends.map((t: { day: string; students: number }) => ({
                          label: t.day,
                          value: t.students,
                        }))
                      : [
                          { label: "Mon", value: 0 },
                          { label: "Tue", value: 0 },
                          { label: "Wed", value: 0 },
                          { label: "Thu", value: 0 },
                          { label: "Fri", value: 0 },
                          { label: "Sat", value: 0 },
                          { label: "Sun", value: 0 },
                        ]
                    ).map((item: { label: string; value: number }, index: number, arr: { label: string; value: number }[]) => {
                      const maxVal = Math.max(...arr.map((d) => d.value), 1);
                      const barHeight = Math.max((item.value / maxVal) * 200, 4);
                      return (
                        <div
                          key={index}
                          className="
                            flex-1
                            flex
                            flex-col
                            items-center
                            gap-3
                          "
                        >
                          <div
                            style={{
                              height: `${barHeight}px`,
                            }}
                            className={`
                              w-full
                              rounded-t-md
                              ${item.value > 0 ? "bg-[#8A4A26]" : "bg-[#E4D6CB]"}
                            `}
                          />
                          <span className="
                            text-[10px]
                            sm:text-[11px]
                            text-[#9C8E86]
                            uppercase
                          ">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}

                  </div>

                </div>

                {/* ENGAGEMENT */}
                <div className="
                  bg-white
                  rounded-2xl
                  border
                  border-[#E8DDD5]
                  p-4
                ">

                  <h2 className="
                    text-[24px]
                    sm:text-[28px]
                    font-serif
                    font-semibold
                    text-[#2D201B]
                  ">
                    Engagement
                  </h2>

                  <p className="
                    text-sm
                    text-[#9C8E86]
                  ">
                    Average watch time (mins)
                  </p>

                  <div className="
                    flex
                    justify-center
                    mt-6
                  ">

                    <div className="
                      w-[180px]
                      h-[180px]
                      sm:w-[210px]
                      sm:h-[210px]
                      rounded-full
                      border-[8px]
                      border-[#8A4A26]
                      flex
                      items-center
                      justify-center
                    ">

                      <div className="text-center">

                        <h2 className="
                          text-[34px]
                          sm:text-[40px]
                          leading-none
                          font-semibold
                          text-[#2D201B]
                        ">
                          {dashboard?.engagement?.averageWatchTime?.toFixed(1) ?? "0.0"}
                        </h2>

                        <p className="
                          text-sm
                          tracking-wide
                          text-[#8B7B73]
                          mt-2
                        ">
                          MIN/DAY
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="mt-6 space-y-4">

                    <div className="
                      flex
                      items-center
                      justify-between
                    ">

                      <div className="
                        flex
                        items-center
                        gap-2
                      ">

                        <div className="
                          w-3
                          h-3
                          rounded-full
                          bg-[#8A4A26]
                        " />

                        <span className="
                          text-sm
                          text-[#6F5E55]
                        ">
                          Video Content
                        </span>

                      </div>

                      <span className="
                        text-sm
                        font-medium
                      ">
                        {dashboard?.engagement?.videoMinutes != null ? `${dashboard.engagement.videoMinutes}m` : "0m"}
                      </span>

                    </div>

                    <div className="
                      flex
                      items-center
                      justify-between
                    ">

                      <div className="
                        flex
                        items-center
                        gap-2
                      ">

                        <div className="
                          w-3
                          h-3
                          rounded-full
                          bg-[#E8DDD5]
                        " />

                        <span className="
                          text-sm
                          text-[#6F5E55]
                        ">
                          Assignments
                        </span>

                      </div>

                      <span className="
                        text-sm
                        font-medium
                      ">
                        {dashboard?.engagement?.assignmentMinutes != null ? `${dashboard.engagement.assignmentMinutes}m` : "0m"}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-6">

              {/* QUICK ACTIONS */}
              <div
                className="
                bg-white
                rounded-2xl
                border
                border-[#E8DDD5]
                p-4
              "
              >
                <h2
                  className="
                  text-[24px]
      sm:text-[28px]
      font-serif
      font-semibold
      mb-6
      text-[#2D201B]
    "
                >
                  Quick Actions
                </h2>

                <div className="space-y-4">

                  {(dashboard?.quickActions ?? []).map((action: { title: string; route: string }, index: number) => {

                    const actionIcon = {
                      "Edit Course": PencilLine,
                      "Add Lesson": CirclePlus,
                      "View Reviews": MessageSquareText,
                      "Update Pricing": Tag,
                    }[action.title] ?? PencilLine;

                    const Icon = actionIcon;

                    return (
                      <button
                        key={index}
                        onClick={() => router.push(action.route)}
                        className="
            w-full
            h-14
            border
            border-[#DEC9BC]
            rounded-xl
            flex
            items-center
            gap-3
            px-5
            text-[#5D4C44]
            hover:border-[#8A4A26]
            hover:text-[#8A4A26]
            hover:bg-[#FCF8F5]
            transition-all
            duration-200
          "
                      >

                        <Icon
                          size={20}
                          strokeWidth={2}
                          className="text-[#6E564B]"
                        />

                        <span
                          className="
              text-[15px]
              font-medium
            "
                        >
                          {action.title}
                        </span>

                      </button>
                    );
                  })}

                </div>
              </div>

              {/* SUPPORT CARD */}
              <div className="
                bg-[#F2E5DB]
                rounded-2xl
                p-4
              ">

                <h3 className="
                  text-[18px]
                  font-semibold
                  text-[#2D201B]
                ">
                  Instructor Support
                </h3>

                <p className="
                  text-sm
                  text-[#7B6B63]
                  leading-relaxed
                  mt-4
                ">
                  Need help optimizing your curriculum?
                  Schedule a 1:1 call with our Academy mentors.
                </p>

                <button
                  onClick={() => window.open("mailto:support@bandhan.com", "_blank")}
                  className="
                  w-full
                  h-14
                  rounded-xl
                  bg-[#8A4A26]
                  text-white
                  font-medium
                  mt-6
                ">
                  Schedule Call
                </button>

              </div>

            </div>

          </div>

          {/* BOTTOM SECTION */}
          <div className="
            grid
            grid-cols-1
            2xl:grid-cols-[450px_1fr]
            gap-4
            w-full
            pb-20
            mt-6
          ">

            {/* RECENT ACTIVITY */}
            <div className="
              bg-white
              rounded-2xl
              border
              border-[#E8DDD5]
              p-5
              sm:p-5
            ">

              <div className="
                flex
                items-center
                justify-between
                gap-4
                mb-4
              ">

                <h2 className="
                  text-[24px]
                  sm:text-[28px]
                  leading-none
                  font-serif
                  font-semibold
                  text-[#2D201B]
                ">
                  Recent Activity
                </h2>

                <button
                  onClick={() => router.push("/instructor/performance")}
                  className="
                  text-[14px]
                  text-[#8A4A26]
                  font-semibold
                  tracking-wide
                  whitespace-nowrap
                ">
                  VIEW ALL
                </button>

              </div>

              <div className="space-y-6">

                {(dashboard?.recentActivities?.length
                  ? dashboard.recentActivities
                  : []
                ).map((item: { type: string; message: string; time: string }, index: number) => {
                  const activityIcon = () => {
                    switch (item.type?.toLowerCase()) {
                      case "enrollment":
                        return <UserPlus size={18} className="text-[#8A4A26]" />;
                      case "review":
                        return <MessageSquareQuote size={18} className="text-[#B14D45]" />;
                      case "completion":
                        return <GraduationCap size={18} className="text-[#16A34A]" />;
                      default:
                        return <MessageSquare size={18} className="text-[#8A4A26]" />;
                    }
                  };
                  const activityBg = () => {
                    switch (item.type?.toLowerCase()) {
                      case "enrollment":
                        return "bg-[#F4ECE6]";
                      case "review":
                        return "bg-[#F6ECEB]";
                      case "completion":
                        return "bg-[#DDF5E5]";
                      default:
                        return "bg-[#F4ECE6]";
                    }
                  };
                  return (
                    <div
                      key={index}
                      className="
                        flex
                        items-start
                        gap-4
                      "
                    >
                      <div
                        className={`
                          w-12
                          h-12
                          rounded-full
                          flex
                          items-center
                          justify-center
                          shrink-0
                          ${activityBg()}
                        `}
                      >
                        {activityIcon()}
                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="
                          text-[16px]
                          sm:text-[18px]
                          leading-[28px]
                          font-medium
                          text-[#2D201B]
                        ">
                          {item.message}
                        </p>

                        <p className="
                          text-[14px]
                          text-[#8F8178]
                          mt-1
                        ">
                          {item.time}
                        </p>

                      </div>
                    </div>
                  );
                })}

              </div>

            </div>

            {/* STUDENT SNAPSHOT */}
            <div
              className="
              bg-[#FDFCFB]
              rounded-[28px]
              border
              border-[#E9DDD4]
              px-4
              sm:px-5
              py-7
              w-full
            "
            >
              {/* Header */}
              <div
                className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-4
                mb-4
                "
              >
                <h2
                  className="
                  text-[24px]
                  sm:text-[28px]
                  leading-none
                  font-serif
                  font-semibold
                  text-[#221815]
                 "
                >
                  Student Snapshot
                </h2>

                <button
                  onClick={() => router.push(`/instructor/performance/student?courseId=${activeCourseId}`)}
                  className="
                  text-[14px]
                  tracking-wide
                  font-semibold
                  text-[#9A542D]
                  uppercase
                  text-left
              "
                >
                  VIEW STUDENTS
                </button>
              </div>

              {/* TABLE */}
              <div className="w-full">

                {/* HEAD */}
                <div
                  className="
                  hidden
                  md:grid
                  grid-cols-[1.6fr_1fr_0.7fr_60px]
                  items-center
                  px-1
                  pb-5
                  border-b
                  border-[#E8DDD5]
                 "
                >
                  <p
                    className="
                    text-[13px]
                    tracking-[3px]
              ]     font-semibold
                    text-[#6E5A50]
                    uppercase
                      "
                  >
                    Name
                  </p>

                  <p
                    className="
                    text-[13px]
                    tracking-[3px]
                    font-semibold
                    text-[#6E5A50]
                    uppercase
                 "
                  >
                    Progress
                  </p>

                  <p
                    className="
                    text-[13px]
                    tracking-[3px]
                    font-semibold
                    text-[#6E5A50]
                    uppercase
                   "
                  >
                    Status
                  </p>

                  <p
                    className="
                    text-[13px]
                    tracking-[3px]
                    font-semibold
                    text-[#6E5A50]
                    uppercase
                    text-right
                  "
                  >
                    Actions
                  </p>
                </div>

                {/* ROWS */}
                <div>
                  {(dashboard?.studentSnapshots?.length
                    ? dashboard.studentSnapshots
                    : []
                  ).map((student: { name: string; progress: number; status: string; profileImage?: string }, index: number) => {
                    const statusUpper = (student.status || "active").toUpperCase();
                    return (
                      <div
                        key={index}
                        className="
                          grid
                          grid-cols-1
                          md:grid-cols-[1.6fr_1fr_0.7fr_60px]
                          gap-5
                          md:gap-0
                          items-start
                          md:items-center
                          py-6
                          border-b
                          last:border-none
                          border-[#EEE3DB]
                        "
                      >
                        {/* STUDENT */}
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={student.profileImage || "/bandhan.png"}
                            alt={student.name}
                            className="
                              w-[52px] h-[52px] rounded-full border border-[#E8DDD5] object-cover shrink-0
                            "
                          />
                          <h3 className="text-[18px] sm:text-[20px] font-medium text-[#2B211D] break-words">
                            {student.name}
                          </h3>
                        </div>

                        {/* PROGRESS */}
                        <div className="w-full md:pr-6">
                          <div className="w-full h-[8px] bg-[#EFE5DE] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#8F4B28] rounded-full"
                              style={{ width: `${student.progress ?? 0}%` }}
                            />
                          </div>
                          <p className="text-[14px] text-[#3B2E28] mt-2 font-medium">
                            {student.progress ?? 0}%
                          </p>
                        </div>

                        {/* STATUS */}
                        <div>
                          <span
                            className={`
                              inline-flex items-center justify-center px-4 h-[35px] rounded-full text-[13px] font-semibold
                              ${statusUpper === "ACTIVE" || statusUpper === "COMPLETED"
                                ? "bg-[#E4F4E8] text-[#1D9A4C]"
                                : "bg-[#EFE4DB] text-[#7A6455]"
                              }
                            `}
                          >
                            {statusUpper}
                          </span>
                        </div>

                        {/* ACTION */}
                        <div className="flex md:justify-end">
                          <button
                            onClick={() => router.push(`/instructor/performance/student?courseId=${activeCourseId}`)}
                            className="
                              w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F4ECE6] transition
                            "
                          >
                            <MoreHorizontal size={24} className="text-[#2B211D]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
