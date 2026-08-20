"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Building } from "lucide-react";
import { CareersHeader } from "@/components/CareersHeader";
import { useGetJobSeekerApplicationsQuery } from "../redux/services/JobsApi";

const statusColors: Record<string, string> = {
  INTERVIEW: "bg-[#FFE5E5] text-[#D96969]",
  "IN REVIEW": "bg-[#F5E8E0] text-[#9B7B6F]",
  APPLIED: "bg-[#F5E8E0] text-[#9B7B6F]",
  REJECTED: "bg-[#FFE5E5] text-[#D96969]",
};

const CompanyIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center">
    <Building size={20} className="text-[#8B6F5F]" />
  </div>
);

export default function ApplicationsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recent");
  const [page, setPage] = useState(1);
  const limit = 10;

  const statusQuery = activeFilter === "All"
    ? undefined
    : activeFilter === "Interviews"
    ? "interview"
    : activeFilter.toLowerCase();

  const { data: applicationsResponse, isLoading, isFetching } = useGetJobSeekerApplicationsQuery({
    page,
    limit,
    search: searchTerm,
    status: statusQuery,
    sort: sortOption,
  });

  const applications = useMemo(() => {
    return applicationsResponse?.data ?? [];
  }, [applicationsResponse]);

  const getTimelineSteps = (application: (typeof applications)[number]) => {
    if (application.timeline && !Array.isArray(application.timeline) && typeof application.timeline === "object") {
      const statusTimeline = application.timeline as {
        applied?: boolean;
        reviewed?: boolean;
        interview?: boolean;
        offer?: boolean;
      };

      return [
        { label: "Applied", done: Boolean(statusTimeline.applied) },
        { label: "Reviewed", done: Boolean(statusTimeline.reviewed) },
        { label: "Interview", done: Boolean(statusTimeline.interview) },
        { label: "Offer", done: Boolean(statusTimeline.offer) },
      ];
    }

    const fallbackSteps = ["Applied", "Reviewed", "Interview", "Offer"];
    return fallbackSteps.map((label, index) => ({ label, done: index === 0 }));
  };

  const summary = applicationsResponse?.summary;

  return (
    <div className="min-h-screen bg-[#FBF4ED] text-[#3D2B1F] flex flex-col">
      {/* HEADER */}
      <CareersHeader variant="jobs" activeTab="Applications" />

      {/* MAIN LAYOUT */}
      <div className="flex flex-1">
        <main className="flex-1 w-full px-4 py-5 sm:px-6 md:px-5 lg:px-10 xl:px-12 space-y-6">

          {/* Breadcrumb + Title */}
          <div>
            <p className="text-xs text-[#A48871] uppercase tracking-widest font-semibold mb-2">
              Home • Applications
            </p>
            <h2 className="text-2xl sm:text-xl font-semibold text-[#3D2B1F] mb-1">Applications</h2>
            <p className="text-sm text-[#7E5F49]">Track and manage your active job applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "TOTAL APPLICATIONS", value: summary?.totalApplications ?? applications.length ?? 0 },
              { label: "IN REVIEW", value: summary?.reviewed ?? 0 },
              { label: "INTERVIEW STAGE", value: summary?.interview ?? 0 },
              { label: "REJECTED", value: summary?.rejected ?? 0 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-[#E8D1C2] rounded-3xl p-5"
              >
                <p className="text-[10px] text-[#A48871] font-semibold uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl sm:text-xl font-bold text-[#3D2B1F]">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="flex items-center gap-3 bg-white border border-[#E8D1C2] rounded-full px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#E0B08A]/40 transition-all w-full">
              <Search size={18} className="text-[#A48871] flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search job or company"
                className="flex-1 bg-transparent outline-none text-sm text-[#3D2B1F] placeholder:text-[#B49B84]"
              />
            </div>

            {/* Filter Pills & Sort - Wrapped on Mobile */}
            <div className="flex flex-wrap gap-2 items-center">
              {["All", "Applied", "Interviews", "Rejected"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeFilter === filter
                      ? "bg-[#8B6F5F] text-white"
                      : "bg-white text-[#7E5F49] border border-[#E8D1C2] hover:bg-[#FFF2E9]"
                  }`}
                >
                  {filter}
                </button>
              ))}
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold bg-white text-[#7E5F49] border border-[#E8D1C2] outline-none hover:bg-[#FFF2E9] cursor-pointer ml-auto"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-3">
            {applications.length > 0 ? (
              applications.map((app, index) => {
                const status = app.status?.toUpperCase() || "APPLIED";
                const timelineSteps = getTimelineSteps(app);

                return (
                  <div
                    key={app.applicationId ?? app.id ?? app._id ?? index}
                    className="bg-white border border-[#E8D1C2] rounded-3xl p-5 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex gap-4 mb-4">
                      <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#FFF2E9] flex items-center justify-center">
                        <CompanyIcon />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-base font-semibold text-[#3D2B1F] line-clamp-1">
                            {app.jobTitle || app.title || app.job?.jobTitle}
                          </h3>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap flex-shrink-0 ${
                              statusColors[status] || statusColors.APPLIED
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="text-xs text-[#7E5F49] font-medium">
                          {app.companyName || app.recruiter?.companyName || "Unknown Company"} • {app.location || app.job?.location || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-2 my-4 px-4 py-3 bg-[#FFF2E9] rounded-2xl overflow-x-auto">
                      {timelineSteps.map((step, idx) => {
                        return (
                          <div key={step.label} className="flex items-center flex-1 min-w-fit">
                            <div
                              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                step.done ? "bg-[#C97755] text-white" : "bg-[#E0B08A] text-[#8B6F5E]"
                              }`}
                            >
                              {step.done ? "✓" : idx + 1}
                            </div>
                            {idx < timelineSteps.length - 1 && (
                              <div
                                className={`flex-1 h-0.5 mx-1 ${
                                  step.done ? "bg-[#C97755]" : "bg-[#E0B08A]"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-[#E8D1C2]">
                      <div className="text-xs text-[#8D6F5E]">
                        <p className="font-medium">Last update {app.appliedAt || app.createdAt || app.appliedDate || "N/A"}</p>
                      </div>
                      <Link
                        href={`/Jobseeker/applications/${encodeURIComponent(app.applicationId || app.id || app._id || "")}`}
                        className="text-xs font-semibold text-[#C97755] hover:text-[#A05F45] transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-5 rounded-3xl border border-[#E8D1C2] text-center text-sm text-[#7E5F49]">
                {isLoading || isFetching ? "Loading applications..." : "No applications found."}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}