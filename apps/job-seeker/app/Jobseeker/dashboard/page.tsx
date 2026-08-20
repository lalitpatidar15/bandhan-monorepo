"use client";

import Link from "next/link";
import { CareersHeader } from "@/components/CareersHeader";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetJobSeekerDashboardQuery } from "../redux/services/JobsApi";

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Applied: "bg-yellow-100 text-yellow-700",
  Interview: "bg-green-100 text-green-700",
  Reviewed: "bg-green-100 text-green-700",
  Shortlisted: "bg-blue-100 text-blue-700",
  Rejected: "bg-red-100 text-red-700",
};

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
    <div className="min-h-screen bg-[#FBF4ED] text-[#3D2B1F] flex flex-col">
      {/* HEADER */}
      <CareersHeader variant="jobs" activeTab="Dashboard" />

      {/* MAIN LAYOUT */}
      <div className="flex flex-1">
        <main className="flex-1 w-full px-4 py-5 sm:px-6 md:px-5 lg:px-10 xl:px-12 space-y-6">

          {/* WELCOME CARD */}
          <Card className="rounded-[24px] border border-[#E8D1C2] bg-white p-5 sm:p-4 md:p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              
              <div>
                <h1 className="text-2xl sm:text-xl font-semibold">
                  Welcome back, {welcomeName}!
                </h1>

                <p className="text-sm sm:text-base text-[#7E5F49] mt-2">
                  Here’s what’s happening with your job search.
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
                className="rounded-3xl border border-[#E8D7CB] bg-white p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#FFF2E9] text-xl shrink-0">
                    {icon}
                  </div>

                  <div>
                    <p className="text-[11px] sm:text-xs uppercase tracking-widest text-[#A48871]">
                      {label}
                    </p>

                    <p className="text-2xl font-semibold">{value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* RECENT APPLICATIONS */}
            <Card className="rounded-[28px] border border-[#E8D7CB] bg-white p-5 sm:p-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">
                  Recent Applications
                </h2>

                <Link
                  href="/Jobseeker/applications"
                  className="text-sm text-[#B24E2E] font-medium"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="rounded-2xl bg-[#FFF4EE] p-4 text-sm text-[#8D6F5E]">Loading recent applications...</div>
                ) : isError ? (
                  <div className="rounded-2xl bg-[#FFF4EE] p-4 text-sm text-[#8D6F5E]">{(error as { data?: { message?: string } } | undefined)?.data?.message || "Unable to load recent applications."}</div>
                ) : recentApplications.length === 0 ? (
                  <div className="rounded-2xl bg-[#FFF4EE] p-4 text-sm text-[#8D6F5E]">No recent applications yet.</div>
                ) : (
                  recentApplications.map((app) => (
                    <div
                      key={app.applicationId}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#FFF4EE] p-4 rounded-2xl"
                    >
                      <div>
                        <p className="font-semibold">{app.jobTitle || "Untitled role"}</p>

                        <p className="text-sm text-[#8D6F5E]">
                          {app.companyName || "Unknown company"}
                        </p>

                        <p className="text-xs text-[#A48871]">
                          Applied {formatDate(app.appliedAt)}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold w-fit ${statusStyles[app.status || "Applied"] || "bg-gray-100 text-gray-700"}`}
                      >
                        {app.status || "Applied"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* RECOMMENDED JOBS */}
            <Card className="rounded-[28px] border border-[#E8D7CB] bg-white p-5 sm:p-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">
                  Recommended Jobs
                </h2>

                <Link
                  href="/Jobseeker/jobs"
                  className="text-sm text-[#B24E2E] font-medium"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="rounded-2xl bg-[#FFF4EE] p-4 text-sm text-[#8D6F5E]">Loading recommended jobs...</div>
                ) : isError ? (
                  <div className="rounded-2xl bg-[#FFF4EE] p-4 text-sm text-[#8D6F5E]">Unable to load recommended jobs.</div>
                ) : recommendedJobs.length === 0 ? (
                  <div className="rounded-2xl bg-[#FFF4EE] p-4 text-sm text-[#8D6F5E]">No recommended jobs right now.</div>
                ) : (
                  recommendedJobs.map((job) => {
                    const tags = [job.jobType, job.experienceLevel, job.location].filter(Boolean) as string[];
                    const salaryText = job.salaryMin && job.salaryMax
                      ? `₹${job.salaryMin} - ₹${job.salaryMax}`
                      : job.salaryMin
                        ? `₹${job.salaryMin}`
                        : "Salary not disclosed";

                    return (
                      <div key={job.jobId} className="bg-[#FFF4EE] p-4 rounded-2xl">
                        <p className="font-semibold text-base">{job.jobTitle || "Untitled role"}</p>

                        <p className="text-sm text-[#8D6F5E] mt-1">
                          {job.companyName || "Unknown company"} • {job.location || "Remote"}
                        </p>

                        <p className="text-sm font-semibold mt-2">{salaryText}</p>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {tags.map((tag) => (
                            <span key={tag} className="text-xs bg-white px-3 py-1 rounded-full text-[#7E5F49]">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <Link href={`/Jobseeker/job-detail?jobId=${encodeURIComponent(job.jobId || "")}`}>
                          <Button variant="primary" className="w-full mt-4">
                            Apply Now
                          </Button>
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* BOTTOM GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* PROFILE COMPLETION */}
            <Card className="rounded-[28px] border border-[#E8D7CB] bg-white p-5 sm:p-4">
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
                      <span className="text-[#7E5F49]">{label}</span>

                      <span className="font-medium">{value}</span>
                    </div>

                    <div className="h-2 bg-[#F2D4BD] rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-[#3D2B1F] rounded-full"
                        style={{ width: value }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/Jobseeker/profile">
                <Button variant="primary" className="w-full mt-6">
                  Complete Profile ({overallPercent}%)
                </Button>
              </Link>
            </Card>

            {/* QUICK ACTIONS */}
            <Card className="rounded-[28px] border border-[#E8D7CB] bg-white p-5 sm:p-4">
              <h2 className="text-lg font-semibold mb-5">
                Quick Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/Jobseeker/jobs">
                  <div className="p-4 rounded-2xl border-2 border-[#E8D1C2] bg-[#FFF2E9] hover:bg-[#FFE5D9] hover:border-[#C97755] transition-all cursor-pointer h-full flex items-center gap-3">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <p className="font-semibold text-[#3D2B1F]">Search Jobs</p>
                      <p className="text-xs text-[#7E5F49]">Browse opportunities</p>
                    </div>
                  </div>
                </Link>

                <Link href="/Jobseeker/resume">
                  <div className="p-4 rounded-2xl border-2 border-[#E8D1C2] bg-[#FFF2E9] hover:bg-[#FFE5D9] hover:border-[#C97755] transition-all cursor-pointer h-full flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-semibold text-[#3D2B1F]">Update Resume</p>
                      <p className="text-xs text-[#7E5F49]">Manage your resume</p>
                    </div>
                  </div>
                </Link>

                <Link href="/Jobseeker/profile">
                  <div className="p-4 rounded-2xl border-2 border-[#E8D1C2] bg-[#FFF2E9] hover:bg-[#FFE5D9] hover:border-[#C97755] transition-all cursor-pointer h-full flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="font-semibold text-[#3D2B1F]">Edit Profile</p>
                      <p className="text-xs text-[#7E5F49]">Update your info</p>
                    </div>
                  </div>
                </Link>

                <Link href="/Jobseeker/messages">
                  <div className="p-4 rounded-2xl border-2 border-[#E8D1C2] bg-[#FFF2E9] hover:bg-[#FFE5D9] hover:border-[#C97755] transition-all cursor-pointer h-full flex items-center gap-3">
                    <span className="text-2xl">✉️</span>
                    <div>
                      <p className="font-semibold text-[#3D2B1F]">Messages</p>
                      <p className="text-xs text-[#7E5F49]">Chat with recruiters</p>
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