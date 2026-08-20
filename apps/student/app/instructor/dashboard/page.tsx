"use client";

import InstructorHeader from "@/components/common/CourseHeader";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MessageSquare,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PageHeader, StatCard, Badge, statusTone } from "@bandhan/ui";
import { useGetInstructorOverviewQuery } from "@/app/redux/instructor-services/DashboardApi";
import { useEffect, useState } from "react";

export default function InstructorDashboard() {
  const { data, isLoading, isError } = useGetInstructorOverviewQuery();
  const overview = data?.data?.overview;
  const [tasks, setTasks] = useState<string[]>([]);
  const [todayEvents, setTodayEvents] = useState<Array<{title:string;time?:string;slots?:number;questions?:number;type:string}>>([]);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://bandhan-backend-gykw.onrender.com/api";
    fetch(`${apiBase}/instructor/page-resources`)
      .then(res => res.json())
      .then(json => {
        if (json?.success && json?.data) {
          setTasks(json.data.tasks || []);
          setTodayEvents(json.data.todaySchedule || []);
        }
      })
      .catch(() => {});
  }, []);
  const stats = [
    {
      label: "Active Courses",
      value: String(overview?.activeCourses ?? 0),
      change: `${overview?.totalCourses ?? 0} total courses`,
      icon: BookOpen,
    },
    {
      label: "Enrolled Learners",
      value: Number(overview?.totalStudents ?? 0).toLocaleString("en-IN"),
      change: `${overview?.completionRate ?? 0}% completion rate`,
      icon: Users,
    },
    {
      label: "Total Earnings",
      value: `₹${Number(overview?.totalRevenue ?? 0).toLocaleString("en-IN")}`,
      change: "Completed payments",
      icon: IndianRupee,
    },
    {
      label: "Avg Rating",
      value: Number(overview?.averageRating ?? 0).toFixed(1),
      change: `${overview?.totalReviews ?? 0} reviews`,
      icon: Star,
    },
  ];
  const courses = (data?.data?.courses ?? []).map((course: any) => ({
    id: course._id,
    title: course.title,
    students: course.totalStudents ?? 0,
    progress: course.curriculumSummary?.completion ?? 0,
    status: course.status === "published" ? "Published" : "Draft",
  }));

  return (
    <main className="min-h-screen bg-[var(--bhn-bg)] text-[var(--bhn-text)]">
      <InstructorHeader />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-5 lg:py-8">
        <PageHeader
          title="Dashboard"
          subtitle="Track course performance, learner activity, earnings, and pending teaching tasks from one place."
          actions={
            <>
              <Link
                href="/instructor/curriculum"
                className="bhn-btn bhn-btn-primary"
              >
                <PlayCircle size={17} />
                Create Content
              </Link>
              <Link
                href="/instructor/analytics"
                className="bhn-btn bhn-btn-secondary"
              >
                View Analytics
                <ArrowUpRight size={16} />
              </Link>
            </>
          }
        />

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading && <p className="text-sm text-[var(--bhn-text-muted)]">Loading dashboard...</p>}
          {isError && <p className="text-sm text-[var(--bhn-error-600)]">Unable to load dashboard data.</p>}
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="flex flex-col gap-2">
                <StatCard
                  label={item.label}
                  value={item.value}
                  icon={<Icon size={20} />}
                  accent
                />
                <p className="px-1 text-xs font-medium text-[var(--bhn-brand-700)]">
                  {item.change}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="bhn-card p-5 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="bhn-card-title text-xl">Course Performance</h2>
                <p className="bhn-card-sub mt-1">
                  Continue improving your highest impact learning programs.
                </p>
              </div>
              <Link
                href="/instructor/performance"
                className="text-sm font-semibold text-[var(--bhn-brand-700)] hover:underline"
              >
                Manage courses
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {courses.map((course: { id: string; title: string; students: number; progress: number; status: string }) => (
                <div
                  key={course.id}
                  className="bhn-card bhn-card-pad"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[var(--bhn-text)]">{course.title}</p>
                      <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">
                        {course.students} learners enrolled
                      </p>
                    </div>
                    <Badge tone={statusTone(course.status)}>{course.status}</Badge>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-xs text-[var(--bhn-text-muted)]">
                      <span>Completion</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--bhn-surface-3)]">
                      <div
                        className="h-full rounded-full bg-[var(--bhn-brand-500)]"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="bhn-card bhn-card-pad">
              <h2 className="bhn-card-title text-xl">Today</h2>
              <div className="mt-5 space-y-4">
                {todayEvents.length > 0 ? todayEvents.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    {event.type === "live" ? (
                      <CalendarDays className="mt-0.5 text-[var(--bhn-brand-600)]" size={18} />
                    ) : event.type === "office" ? (
                      <Clock3 className="mt-0.5 text-[var(--bhn-brand-600)]" size={18} />
                    ) : (
                      <MessageSquare className="mt-0.5 text-[var(--bhn-brand-600)]" size={18} />
                    )}
                    <div>
                      <p className="text-sm font-semibold">{event.title}</p>
                      <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">
                        {event.time || (event.slots ? `${event.slots} learner slots booked` : `${event.questions} unanswered questions`)}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-[var(--bhn-text-muted)]">No events scheduled for today.</p>
                )}
              </div>
            </section>

            <section className="bhn-card bhn-card-pad">
              <h2 className="bhn-card-title text-xl">Pending Tasks</h2>
              <div className="mt-5 space-y-3">
                {tasks.map((task) => (
                  <div key={task} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={17} className="text-[var(--bhn-brand-600)]" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
