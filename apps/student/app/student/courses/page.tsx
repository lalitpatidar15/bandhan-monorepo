"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import StudentHeader from "@/components/common/StudentHeader";
import { PageHeader, StatCard } from "@bandhan/ui";
import { useGetCoursesQuery, useGetDashboardQuery } from "@/app/redux/services/courseApi";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  MessageCircle,
  PlayCircle,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";

export default function CoursesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All Topics");
  const [activeLevel, setActiveLevel] = useState("All Levels");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>(["All Topics"]);
  const [liveClasses, setLiveClasses] = useState<Array<{title:string;instructor:string;time:string;learners:string}>>([]);
  const [practiceSets, setPracticeSets] = useState<Array<{title:string;questions:number;duration:string;level:string}>>([]);
  const [learningTracks, setLearningTracks] = useState<string[]>([]);

  // Fetch courses from API
  const { data: coursesData, isLoading, error } = useGetCoursesQuery({});
  const { data: dashboardData } = useGetDashboardQuery(undefined);

  const dashStats = dashboardData?.data;
  const heroHours = dashStats?.totalLearningHours ?? 0;
  const heroCourses = dashStats?.inProgressCourses ?? dashStats?.totalCourses ?? 0;
  const heroGoal = dashStats?.completionRate ?? 0;

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://bandhan-backend-gykw.onrender.com/api";
    fetch(`${apiBase}/student/page-resources`)
      .then(res => res.json())
      .then(json => {
        if (json?.success && json?.data) {
          setCategories(json.data.categories || ["All Topics"]);
          setLiveClasses(json.data.liveClasses || []);
          setPracticeSets(json.data.practiceSets || []);
          setLearningTracks(json.data.learningTracks || []);
        }
      })
      .catch(() => {});
  }, []);
  
  // Extract courses array from response (handle both array and object responses)
  const courses = Array.isArray(coursesData)
    ? coursesData
    : (coursesData?.data?.courses || coursesData?.courses || coursesData?.data || []);

  const normalizedCourses = courses.map((course: any) => ({
    ...course,
    image: course.thumbnail || course.image || undefined,
    instructorName: course.instructor?.fullName || course.instructor || "Unknown",
    courseId: course._id || course.courseId || "",
    reviews: course.totalReviews ?? course.reviews ?? 0,
    price: course.price ?? 0,
    oldPrice: course.oldPrice || "",
    duration: course.duration || course.totalDuration || course.estimatedDuration || "",
    category: course.category || "",
  }));

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return normalizedCourses.filter((course: any) => {
      const matchesCategory =
        activeCategory === "All Topics" ||
        course.category?.toLowerCase() === activeCategory.toLowerCase();

      const matchesLevel =
        activeLevel === "All Levels" ||
        course.level?.toLowerCase() === activeLevel.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        [course.title, course.author, course.instructorName, course.category, course.description, course.subtitle]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [activeCategory, activeLevel, search, normalizedCourses]);

  const featuredCourse = normalizedCourses[0];
  const continueCourse = normalizedCourses[1];

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--bhn-bg)] text-[var(--bhn-text)]">
        <StudentHeader />
        <div className="bhn-spinner-center">
          <span className="bhn-spinner bhn-spinner-lg" />
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-[var(--bhn-bg)] text-[var(--bhn-text)]">
        <StudentHeader />
        <div className="mx-auto max-w-7xl px-4 py-8 text-center">
          <p className="text-lg text-[var(--bhn-error-600)]">Failed to load courses. Please try again.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bhn-bg)] text-[var(--bhn-text)]">
      <StudentHeader />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-5">
        {/* PAGE HEADER */}
        <PageHeader
          title="Student Dashboard"
          subtitle="Crack your next skill goal with live classes, tests, and guided courses."
          actions={
            <Button
              variant="outline"
              onClick={() => document.getElementById("recommended-courses")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Courses
            </Button>
          }
        />

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          <StatCard
            label="Hours learned"
            value={heroHours}
            icon={<Clock3 size={18} />}
            accent
          />
          <StatCard
            label="Courses active"
            value={heroCourses}
            icon={<BookOpen size={18} />}
          />
          <StatCard
            label="Weekly goal"
            value={`${heroGoal}%`}
            icon={<Target size={18} />}
          />
          <StatCard
            label="Certificates"
            value={dashStats?.completedCourses ?? 0}
            icon={<GraduationCap size={18} />}
          />
        </div>

        {/* HERO */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl bg-[#2D201B] p-4 text-white shadow-sm sm:p-5 lg:p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#F5CF9E]">
              <Sparkles size={17} />
              Personalized learning dashboard
            </p>
            <h1 className="mt-4 max-w-3xl text-2xl font-semibold leading-tight sm:text-2xl">
              Crack your next skill goal with live classes, tests, and guided courses.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#E8DAD0] sm:text-base">
              Learn from expert mentors, continue your saved courses, join upcoming live sessions, and practice with focused tests from one place.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() =>
                  document
                    .getElementById("recommended-courses")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="
                bg-[var(--bhn-surface)]
                !text-[#2D201B] dark:text-[#ededed]
                border border-[#E5D7CC] dark:border-[#374151]
                hover:bg-[#F7EFE8] dark:hover:bg-[#1a1a1a] dark:bg-[#1a1a1a]
                hover:!text-[#2D201B] dark:text-[#ededed]
               "
                size="lg"
              >
                Explore Courses
              </Button>
              <Button
                onClick={() => document.getElementById("live-classes")?.scrollIntoView({ behavior: "smooth" })}
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-[var(--bhn-surface)]/10"
              >
                Join Live Class
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                [String(heroHours), "Hours learned"],
                [String(heroCourses), "Courses active"],
                [`${heroGoal}%`, "Weekly goal"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-[var(--bhn-surface)]/10 p-4">
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#E8DAD0]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-[var(--bhn-border)] dark:border-[#374151] bg-[var(--bhn-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Continue Learning</h2>
              <Flame className="text-[var(--bhn-brand-700)] dark:text-[#c9a882]" size={22} />
            </div>
            {continueCourse ? (
              <>
                <img
                  src={continueCourse.image}
                  alt={continueCourse.title}
                  className="mt-5 h-40 w-full rounded-2xl object-cover"
                />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-700)] dark:text-[#c9a882]">
                  {continueCourse.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-6">{continueCourse.title}</h3>
                <p className="mt-2 text-sm text-[var(--bhn-text-muted)] dark:text-[#b89b7d]">Lesson {continueCourse.currentLesson ?? 6} of {continueCourse.totalLessons ?? 18} • {continueCourse.progress ?? 42}% completed</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E8DDD5] dark:bg-[#2a2a2a]">
                  <div className="h-full rounded-full bg-[var(--bhn-brand-600)] dark:bg-[#b86a3a]" style={{ width: `${continueCourse.progress ?? 42}%` }} />
                </div>
                <Button
                  onClick={() => router.push(`/student/course-player/${continueCourse.courseId}`)}
                  className="mt-5 w-full"
                >
                  Resume Course
                </Button>
              </>
            ) : (
              <div className="mt-5 rounded-2xl bg-[var(--bhn-surface-2)] dark:bg-[#171717] p-4 text-center">
                <p className="text-sm text-[var(--bhn-text-muted)] dark:text-[#b89b7d]">No courses to continue yet. Start exploring available courses!</p>
                <Button
                  onClick={() => document.getElementById("recommended-courses")?.scrollIntoView({ behavior: "smooth" })}
                  className="mt-4 w-full"
                >
                  Browse Courses
                </Button>
              </div>
            )}
          </aside>
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Live Classes", text: "Join upcoming mentor-led sessions", icon: PlayCircle, target: "live-classes" },
            { title: "Practice Tests", text: "Attempt timed quizzes and drills", icon: Target, target: "practice-tests" },
            { title: "Doubt Support", text: "Ask questions and track answers", icon: MessageCircle, target: "recommended-courses" },
            { title: "Learning Paths", text: "Follow role-based roadmaps", icon: Trophy, target: "learning-paths" },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                onClick={() => document.getElementById(item.target)?.scrollIntoView({ behavior: "smooth" })}
                className="bhn-card bhn-card-hover p-5 text-left"
              >
                <div className="bhn-icon-tile">
                  <Icon size={21} />
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">{item.text}</p>
              </button>
            );
          })}
        </div>

        {/* LIVE CLASSES + PRACTICE */}
        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section id="live-classes" className="rounded-3xl border border-[var(--bhn-border)] dark:border-[#374151] bg-[var(--bhn-surface)] p-5 shadow-sm sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bhn-brand-700)] dark:text-[#c9a882]">Live learning</p>
                <h2 className="mt-1 text-2xl font-semibold">Upcoming Live Classes</h2>
              </div>
              <Button variant="outline" onClick={() => router.push("/student/mycourse")}>
                View Schedule
              </Button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {liveClasses.map((item) => (
                <article key={item.title} className="rounded-2xl bg-[var(--bhn-surface-2)] dark:bg-[#171717] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--bhn-brand-700)] dark:text-[#c9a882]">
                    <CalendarDays size={16} />
                    {item.time}
                  </div>
                  <h3 className="mt-3 font-semibold leading-6">{item.title}</h3>
                  <p className="mt-2 text-sm text-[var(--bhn-text-muted)] dark:text-[#b89b7d]">{item.instructor}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-[var(--bhn-text-muted)] dark:text-[#b89b7d]">
                    <Users size={15} />
                    {item.learners}
                  </p>
                  <Button className="mt-4 w-full" onClick={() => router.push("/student/mycourse")}>
                    Remind Me
                  </Button>
                </article>
              ))}
            </div>
          </section>

        </div>

        <section id="recommended-courses" className="mt-6 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-[var(--bhn-border)] dark:border-[#374151] bg-[var(--bhn-surface)] p-5 shadow-sm">
            <h3 className="text-lg font-bold">Filters</h3>
            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-3 text-sm font-semibold">Category</p>
                {["All Topics", "Design", "Development", "Marketing", "Business"].map((cat) => (
                  <label key={cat} className="mb-3 flex cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="radio"
                      name="category"
                      checked={activeCategory === cat}
                      onChange={() => setActiveCategory(cat)}
                      className="accent-[var(--bhn-brand-600)]"
                    />
                    {cat}
                  </label>
                ))}
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold">Level</p>
                {["All Levels", "Beginner", "Intermediate", "Advanced"].map((level) => (
                  <label key={level} className="mb-3 flex cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="radio"
                      name="level"
                      checked={activeLevel === level}
                      onChange={() => setActiveLevel(level)}
                      className="accent-[var(--bhn-brand-600)]"
                    />
                    {level}
                  </label>
                ))}
              </div>

              <div className="rounded-2xl bg-[var(--bhn-surface-2)] dark:bg-[#1a1a1a] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Award size={16} />
                  Weekly Goal
                </p>
                <p className="mt-2 text-sm text-[var(--bhn-text-muted)] dark:text-[#b89b7d]">Complete 3 lessons this week to keep your streak.</p>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="rounded-3xl border border-[var(--bhn-border)] dark:border-[#374151] bg-[var(--bhn-surface)] p-4 shadow-sm">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)] dark:text-[#7a6a5a]" size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search courses, mentors, topics..."
                  className="h-12 w-full rounded-2xl border border-[var(--bhn-border)] dark:border-[#374151] bg-[var(--bhn-surface-2)] dark:bg-[#171717] pl-11 pr-4 outline-none focus:border-[var(--bhn-brand-500)]"
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-3">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveCategory(item)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeCategory === item
                        ? "bg-[var(--bhn-brand-600)] dark:bg-[#b86a3a] text-white shadow-sm"
                        : "bg-[var(--bhn-surface-3)] dark:bg-[#171717] text-[#5F554D] dark:text-[#a89080] hover:bg-[#E8DDD5] dark:hover:bg-[#2a2a2a]"
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              
              {filteredCourses.map((course: any, idx: string) => (
                <article
                  key={course?.courseId || course?._id || idx}
                  className="bhn-card bhn-card-hover overflow-hidden"
                >
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="h-52 w-full object-cover" />
                  ) : (
                    <div className="flex h-52 w-full items-center justify-center bg-[var(--bhn-surface-3)] text-sm text-[var(--bhn-text-soft)]">
                      No image available
                    </div>
                  )}
                  <div className="p-5">
                    <span className="bhn-badge bhn-badge-brand uppercase">
                      {course.category}
                    </span>
                    <h3 className="mt-2 min-h-[52px] text-lg font-semibold leading-6">{course.title}</h3>
                    <p className="mt-2 text-sm text-[var(--bhn-text-muted)]">{course.instructorName}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--bhn-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Star size={15} className="fill-[#F59E0B] text-[#F59E0B]" />
                        {course.rating} ({course.reviews ?? course.totalReviews ?? "240 reviews"})
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock3 size={15} />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={15} />
                        Certificate
                      </span>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xl font-bold text-[var(--bhn-brand-600)]">{course.price}</p>
                        <p className="text-xs text-[var(--bhn-text-soft)] line-through">{course.oldPrice}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/student/view_details/${course.courseId}`)}
                        >
                         View Details
                        </Button>
                        <Button onClick={() => router.push(`/student/enroll/${course.courseId}`)}>
                          Enroll
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>


            {filteredCourses.length === 0 && (
              <div className="bhn-empty bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-[var(--bhn-radius-lg)] mt-5">
                <GraduationCap size={36} />
                <h3 className="bhn-empty-title">No courses found</h3>
                <p className="bhn-empty-desc">Try another search term or category.</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
