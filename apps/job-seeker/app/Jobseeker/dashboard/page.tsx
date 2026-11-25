"use client";

import Link from "next/link";
import { CareersHeader } from "@/components/CareersHeader";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@bandhan/ui";
import { useGetJobSeekerDashboardQuery } from "../redux/services/JobsApi";

function formatDate(value?: string) {
  if (!value) return "Recently applied";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useGetJobSeekerDashboardQuery();

  const dashboardData = data?.data as {
    welcome?: {
      fullName?: string;
      profilePhoto?: string;
      resume?: string;
      skills?: string[];
      experienceLevel?: string;
    };
    profileCompletion?: {
      overall?: number;
      resume?: number;
      skills?: number;
      experience?: number;
    };
  } | undefined;

  const welcomeName = dashboardData?.welcome?.fullName || "there";
  const summary = data?.data?.summary;
  const recentApplications = data?.data?.recentApplications || [];
  const recommendedJobs = data?.data?.recommendedJobs || [];
  const quickActions = data?.data?.quickActions;

  const clampPercent = (value?: number) =>
    typeof value === "number" ? Math.min(100, Math.max(0, value)) : 0;

  const resumeUploaded = Boolean(dashboardData?.welcome?.resume);
  const hasSkills = Boolean((dashboardData?.welcome?.skills?.length ?? 0) > 0);
  const hasExperience = Boolean(dashboardData?.welcome?.experienceLevel);

  const resumePercent = clampPercent(
    dashboardData?.profileCompletion?.resume ?? (resumeUploaded ? 100 : 0)
  );
  const skillsPercent = clampPercent(
    dashboardData?.profileCompletion?.skills ?? (hasSkills ? 100 : 0)
  );
  const experiencePercent = clampPercent(
    dashboardData?.profileCompletion?.experience ?? (hasExperience ? 100 : 0)
  );

  const completedSections = [resumeUploaded, hasSkills, hasExperience].filter(Boolean).length;
  const calculatedOverall = completedSections === 0 ? 0 : completedSections === 3 ? 100 : Math.round((completedSections / 3) * 100);
  const overallPercent = clampPercent(
    dashboardData?.profileCompletion?.overall ?? calculatedOverall
  );

  return (
    <div className="min-h-screen bg-[var(--bhn-bg)] text-[var(--bhn-text)] flex flex-col">
      {/* HEADER */}
      <CareersHeader variant="jobs" activeTab="Dashboard" />

      {/* MAIN LAYOUT */}
      <div className="flex flex-1">
        <main className="flex-1 w-full px-4 py-5 sm:px-6 md:px-5 lg:px-10 xl:px-12 space-y-6">

          {/* WELCOME CARD */}
          <Card className="rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5 sm:p-4 md:p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              
              <div>
                <h1 className="text-lg sm:text-base font-semibold">
                  Welcome back, {welcomeName}!
                </h1>

                <p className="text-sm sm:text-base text-[var(--bhn-text-muted)] mt-2">
                  Here's what's happening with your job search.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Link href="/Jobseeker/profile" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full">
                    Update Profile
                  </Button>
                </Link>

                <Link href="/Jobseeker/resume" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full">
                    View Resume
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              ["Applications", summary?.applications ?? 0, "📄"],
              ["Messages", summary?.messages ?? 0, "✉️"],
              ["Notifications", summary?.notifications ?? 0, "🔔"],
              ["Saved Jobs", summary?.savedJobs ?? 0, "💼"],
            ].map(([label, value, icon]) => (
              <Card
                key={label}
                className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-600)] shrink-0">
                    {icon}
                  </div>

                  <div>
                    <p className="text-xs sm:text-xs uppercase tracking-widest text-[var(--bhn-text-muted)]">
                      {label}
                    </p>

                    <p className="text-xl font-semibold">{value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* RECENT APPLICATIONS */}
            <Card className="rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5 sm:p-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">
                  Recent Applications
                </h2>

                <Link
                  href="/Jobseeker/applications"
                  className="text-sm text-[var(--bhn-error-600)] font-medium"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="rounded-2xl bg-[var(--bhn-brand-50)] p-4 text-sm text-[var(--bhn-text-muted)]">Loading recent applications...</div>
                ) : isError ? (
                  <div className="rounded-2xl bg-[var(--bhn-brand-50)] p-4 text-sm text-[var(--bhn-text-muted)]">{(error as { data?: { message?: string } } | undefined)?.data?.message || "Unable to load recent applications."}</div>
                ) : recentApplications.length === 0 ? (
                  <div className="rounded-2xl bg-[var(--bhn-brand-50)] p-4 text-sm text-[var(--bhn-text-muted)]">No recent applications yet.</div>
                ) : recentApplications.map((app) => (
                  <div
                    key={app.applicationId}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[var(--bhn-brand-50)] p-4 rounded-2xl"
                  >
                    <div>
                      <p className="font-semibold">{app.jobTitle || "Untitled role"}</p>

                      <p className="text-sm text-[var(--bhn-text-muted)]">
                        {app.companyName || "Unknown company"}
                      </p>

                      <p className="text-xs text-[var(--bhn-text-soft)]">
                        Applied {formatDate(app.appliedAt)}
                      </p>
                    </div>

                    <span
                      className="text-xs px-3 py-1 rounded-full font-semibold w-fit bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-600)]"
                    >
                      {app.status || "Applied"}
                    </span>
                  </div>
                ))
              </div>
            </Card>

            {/* RECOMMENDED JOBS */}
            <Card className="rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5 sm:p-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">
                  Recommended Jobs
                </h2>

                <Link
                  href="/Jobseeker/jobs"
                  className="text-sm text-[var(--bhn-error-600)] font-medium"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="rounded-2xl bg-[var(--bhn-brand-50)] p-4 text-sm text-[var(--bhn-text-muted)]">Loading recommended jobs...</div>
                ) : isError ? (
                  <div className="rounded-2xl bg-[var(--bhn-brand-50)] p-4 text-sm text-[var(--bhn-text-muted)]">Unable to load recommended jobs.</div>
                ) : recommendedJobs.length === 0 ? (
                  <div className="rounded-2xl bg-[var(--bhn-brand-50)] p-4 text-sm text-[var(--bhn-text-muted)]">No recommended jobs right now.</div>
                ) : recommendedJobs.map((job) => {
                  const tags = [job.jobType, job.experienceLevel, job.location].filter(Boolean) as string[];
                  const salaryText = job.salaryMin && job.salaryMax
                    ? `₹${job.salaryMin} - ₹${job.salaryMax}`
                    : job.salaryMin
                      ? `₹${job.salaryMin}`
                      : "Salary not disclosed";

                  return (
                    <div key={job.jobId} className="bg-[var(--bhn-brand-50)] p-4 rounded-2xl">
                      <p className="font-semibold text-base">{job.jobTitle || "Untitled role"}</p>

                      <p className="text-sm text-[var(--bhn-text-muted)] mt-1">
                        {job.companyName || "Unknown company"} • {job.location || "Remote"}
                      </p>

                      <p className="text-sm font-semibold mt-2">{salaryText}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {tags.map((tag) => (
                          <span key={tag} className="text-xs bg-[var(--bhn-surface)] px-3 py-1 rounded-full text-[var(--bhn-text-muted)]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link href={`/Jobseeker/job-detail?jobId=${encodeURIComponent(job.jobId || "")}`}>
                        <Button variant="primary" className="w-full mt-4">
                          Apply Now
                        </Button>
                      </div>
                    )
                  )
                })
              </div>
            </Card>
          </div>

          {/* BOTTOM GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* PROFILE COMPLETION */}
            <Card className="rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5 sm:p-4">
              <h2 className="text-lg font-semibold mb-5">
                Profile Completion
              </h2>

              <div className="space-y-4">
                {[
                  ["Resume", `${resumePercent}%`],
                  ["Skills", `${skillsPercent}%`],
                  ["Experience", `${experiencePercent}%`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--bhn-text-muted)]">{label}</span>

                      <span className="font-medium">{value}</span>
                    </div>

                    <div className="h-2 bg-[var(--bhn-neutral-100)] rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-[var(--bhn-brand-600)] rounded-full"
                        style={{ width: value }}
                      />
                    </div>
                  </div>
                ))
              </div>

              <Link href="/Jobseeker/profile">
                <Button variant="primary" className="w-full mt-6">
                  Complete Profile ({overallPercent}%)
                </Button>
              </Link>
            </Card>

            {/* QUICK ACTIONS */}
            <Card className="rounded-lg border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5 sm:p-4">
              <h2 className="text-lg font-semibold mb-5">
                Quick Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/Jobseeker/jobs">
                  <div className="p-4 rounded-xl border-2 border-[var(--bhn-border)] bg-[var(--bhn-brand-50)] hover:bg-[var(--bhn-brand-100)] hover:border-[var(--bhn-brand-400)] transition-all cursor-pointer h-full flex items-center gap-3">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <p className="font-semibold text-[var(--bhn-text)]">Search Jobs</p>
                      <p className="text-xs text-[var(--bhn-text-muted)]">Browse opportunities</p>
                    </div>
                  </div>
                </Link>

                <Link href="/Jobseeker/resume">
                  <div className="p-4 rounded-xl border-2 border-[var(--bhn-border)] bg-[var(--bhn-brand-50)] hover:bg-[var(--bhn-brand-100)] hover:border-[var(--bhn-brand-400)] transition-all cursor-pointer h-full flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-semibold text-[var(--bhn-text)]">Update Resume</p>
                      <p className="text-xs text-[var(--bhn-text-muted)]">Manage your resume</p>
                    </div>
                  </div>
                </Link>

                <Link href="/Jobseeker/profile">
                  <div className="p-4 rounded-xl border-2 border-[var(--bhn-border)] bg-[var(--bhn-brand-50)] hover:bg-[var(--bhn-brand-100)] hover:border-[var(--bhn-brand-400)] transition-all cursor-pointer h-full flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="font-semibold text-[var(--bhn-text)]">Edit Profile</p>
                      <p className="text-xs text-[var(--bhn-text-muted)]">Update your info</p>
                    </div>
                  </div>
                </Link>

                <Link href="/Jobseeker/messages">
                  <div className="p-4 rounded-xl border-2 border-[var(--bhn-border)] bg-[var(--bhn-brand-50)] hover:bg-[var(--bhn-brand-100)] hover:border-[var(--bhn-brand-400)] transition-all cursor-pointer h-full flex items-center gap-3">
                    <span className="text-2xl">✉️</span>
                    <div>
                      <p className="font-semibold text-[var(--bhn-text)]">Messages</p>
                      <p className="text-xs text-[var(--bhn-text-muted)]">Chat with recruiters</p>
                    </div>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}