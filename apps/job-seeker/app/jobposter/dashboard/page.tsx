"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CareersHeader } from "@/components/CareersHeader";
import { Footer } from "@/components/ui/Footer";
import { Badge, Button, PageHeader, statusTone, Card, EmptyState } from "@bandhan/ui";
import { Eye, Pencil, Trash2, Search, Rocket, Layers, BriefcaseBusiness } from "lucide-react";
import { useEffect } from "react";
import {
  useDeleteJobMutation,
  useGetRecruiterDashboardQuery,
  usePublishJobMutation,
} from "../redux/services/RecruiterDashboardApi";

export default function JobsDashboard() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState("Newest");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [category, setCategory] = useState("All");
  const [postedToday, setPostedToday] = useState(false);
  const [page, setPage] = useState(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  const saveDashboardPreferences = (sort: string, status: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jobposterDashboardSort", sort);
      localStorage.setItem("jobposterDashboardStatus", status);
    }
  };

  const { data, isLoading, error, refetch } = useGetRecruiterDashboardQuery({
    search,
    status: filter === "All" ? "all" : filter.toLowerCase(),
    category: category === "All" ? "all" : category,
    postedToday: postedToday ? "true" : "false",
    sort: sortBy === "Oldest" ? "oldest" : "newest",
  });

  const [deleteJob] = useDeleteJobMutation();
  const [publishJob] = usePublishJobMutation();

  const jobs = useMemo(() => data?.data?.jobs || [], [data]);
  const subscription = data?.data?.subscription;

  const handleDeleteJob = async (jobId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this job?");
    if (!confirmed) return;

    try {
      await deleteJob(jobId).unwrap();
      setStatusType("success");
      setStatusMessage("Job deleted successfully.");
      await refetch();
    } catch (error: any) {
      setStatusType("error");
      setStatusMessage(error?.data?.message || "Unable to delete job.");
    }
  };

  const handlePublishJob = async (jobId: string) => {
    try {
      await publishJob(jobId).unwrap();
      setStatusType("success");
      setStatusMessage("Job published successfully.");
      await refetch();
    } catch (error: any) {
      setStatusType("error");
      setStatusMessage(error?.data?.message || "Unable to publish job.");
    }
  };

  const filteredJobs = useMemo(() => {
    let dataJobs = [...jobs];

    if (search) {
      const lowerSearch = search.toLowerCase();
      dataJobs = dataJobs.filter((job) =>
        job.jobTitle.toLowerCase().includes(lowerSearch) ||
        job.jobCategory?.toLowerCase().includes(lowerSearch) ||
        job.location?.toLowerCase().includes(lowerSearch) ||
        job.jobType?.toLowerCase().includes(lowerSearch) ||
        job.experienceLevel?.toLowerCase().includes(lowerSearch)
      );
    }

    if (filter !== "All") {
      dataJobs = dataJobs.filter((job) => job.status.toLowerCase() === filter.toLowerCase());
    }

    if (category !== "All") {
      dataJobs = dataJobs.filter((job) => job.jobCategory === category);
    }

    if (postedToday) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      dataJobs = dataJobs.filter((job) => {
        const createdAt = new Date(job.createdAt);
        return createdAt >= startOfDay && createdAt < endOfDay;
      });
    }

    switch (sortBy) {
      case "Newest":
        dataJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;

      case "Oldest":
        dataJobs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;

      case "Most Applicants":
        dataJobs.sort((a, b) => (b.totalApplicants || 0) - (a.totalApplicants || 0));
        break;

      case "Least Applicants":
        dataJobs.sort((a, b) => (a.totalApplicants || 0) - (b.totalApplicants || 0));
        break;

      case "Job Title (A-Z)":
        dataJobs.sort((a, b) => a.jobTitle.localeCompare(b.jobTitle));
        break;

      case "Job Title (Z-A)":
        dataJobs.sort((a, b) => b.jobTitle.localeCompare(a.jobTitle));
        break;

      default:
        break;
    }

    return dataJobs;
  }, [jobs, filter, search, sortBy]);

  useEffect(() => {
  if (filteredJobs.length > 0) {
    localStorage.setItem(
      "selectedJobId",
      filteredJobs[0]._id
    );
  }
}, [filteredJobs]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const paginatedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-[#FBF4ED] dark:bg-[#1a1a1a] flex flex-col">
      <CareersHeader variant="jobposter" activeTab="dashboard" />

      <div className="flex flex-1">

        <main className="flex-1 px-6 py-8 lg:px-12 max-w-7xl mx-auto w-full">

          {/* PAGE HEADER */}
          <PageHeader
            title="Job Dashboard"
            subtitle="Manage your active listings, review candidate flow, and optimize your hiring pipeline."
            actions={
              <Link href="/jobposter/jobpost">
                <Button className="rounded-xl px-5">+ Create Job</Button>
              </Link>
            }
          />

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              ["ACTIVE JOBS", data?.data?.stats?.activeJobs ?? 0, ""],
              ["DRAFT JOBS", data?.data?.stats?.draftJobs ?? 0, ""],
              ["CLOSED JOBS", data?.data?.stats?.closedJobs ?? 0, ""],
              ["TOTAL APPLICANTS", data?.data?.stats?.totalApplicants ?? 0, "Across all time"],
              ["CURRENT PLAN", subscription?.planName ?? "Free", subscription?.expiryDate ? `Active until ${new Date(subscription.expiryDate).toLocaleDateString("en-GB")}` : "Basic access"],
            ].map(([label, value, sub]) => (
              <div key={label} className="bhn-stat">
                <div className="bhn-stat-label">
                  <span>{label}</span>
                </div>
                <div className="bhn-stat-value">{value}</div>
                {sub ? (
                  <p style={{ fontSize: "var(--bhn-text-xs)", color: "var(--bhn-success-600)", fontWeight: 600, margin: 0 }}>
                    {sub}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {statusMessage && (
            <div className={`rounded-2xl p-4 mb-6 text-sm ${statusType === "success" ? "bhn-alert bhn-alert-success" : "bhn-alert bhn-alert-danger"}`}>
              {statusMessage}
            </div>
          )}

          {/* FILTER BAR */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search job title, profession, location"
                className="bhn-input pl-9"
              />
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                className="bhn-select w-auto"
              >
                {[
                  "All",
                  "Software Development",
                  "Design & Creative",
                  "Marketing",
                  "Sales",
                  "Finance",
                  "Human Resources",
                  "Customer Support",
                  "Education",
                  "Healthcare",
                  "Engineering",
                  "Other",
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setPostedToday((current) => !current);
                  setPage(1);
                }}
                className={["bhn-chip", postedToday ? "bhn-chip-active" : ""].filter(Boolean).join(" ")}
              >
                {postedToday ? "Today: On" : "Today"}
              </button>
            </div>

            <div className="flex gap-2">
              {["All", "Active", "Draft", "Closed"].map((f) => {
                const isActive = filter === f;
                return (
                  <button
                    key={f}
                          onClick={() => {
                      setFilter(f);
                      setPage(1);
                      saveDashboardPreferences(sortBy, f);
                    }}
                    className={["bhn-chip", isActive ? "bhn-chip-active" : ""].filter(Boolean).join(" ")}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Sort by:
              </span>

              <select
                value={sortBy}
                onChange={(e) => {
                  const newSort = e.target.value;
                  setSortBy(newSort);
                  setPage(1);
                  saveDashboardPreferences(newSort, filter);
                }}
                className="bhn-select w-auto"
              >
                <option>Newest</option>
                <option>Oldest</option>
                <option>Most Applicants</option>
                <option>Least Applicants</option>
                <option>Job Title (A-Z)</option>
                <option>Job Title (Z-A)</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <Card padded={false}>

            <div className="hidden md:grid grid-cols-5 text-xs text-gray-500 px-5 pt-4">
                <p>JOB TITLE</p>
                <p>STATUS</p>
                <p>APPLICANTS</p>
                <p>POSTED DATE</p>
                <p>ACTIONS</p>
              </div>

            <div className="space-y-3 p-5">
              {isLoading && <p className="text-sm text-gray-500">Loading jobs...</p>}
              {!isLoading && error && <p className="text-sm text-red-600">Unable to load dashboard data.</p>}
              {!isLoading && !error && paginatedJobs.length === 0 && (
                <EmptyState
                  icon={<BriefcaseBusiness size={28} />}
                  title="No jobs found"
                  description={search
                    ? `No jobs found for "${search}". Try another title, category, location, or profession.`
                    : "No jobs found for the current filters."}
                />
              )}
              {!isLoading && !error && paginatedJobs.map((job) => (
                <div
                  key={job._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
  localStorage.setItem("selectedJobId", job._id);

  router.push(`/jobposter/Application?jobId=${job._id}`);
}}
                  className="bhn-card bhn-card-hover grid grid-cols-1 md:grid-cols-5 items-start md:items-center p-4 rounded-xl cursor-pointer gap-3"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{job.jobTitle}</p>
                    <p className="text-xs text-gray-500">{job.location || "Location not added"} | {job.jobType || "N/A"}</p>
                  </div>

                  <span>
                    <Badge tone={statusTone(job.status)}>{job.status}</Badge>
                  </span>

                  <p className="text-gray-700">{job.totalApplicants}</p>
                  <p className="text-gray-700">{new Date(job.createdAt).toLocaleDateString()}</p>

                  <div className="flex gap-3 text-gray-600 flex-wrap md:justify-end md:items-center mt-2 md:mt-0">
                    <Eye
                      size={16}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobposter/jobdetails?jobId=${job._id}`);
                      }}
                    />
                    <Pencil
                      size={16}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobposter/jobpost?jobId=${job._id}`);
                      }}
                    />
                    <Layers
                      size={18}
                      className="cursor-pointer text-[#7A3E2B] dark:text-[#c9a882] hover:text-[#5f2f21] dark:hover:text-[#a05a30]"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobposter/hiringpipline?jobId=${job._id}`);
                      }}
                    />
                    <Rocket
                      size={18}
                      className="cursor-pointer text-[#7A3E2B] dark:text-[#c9a882] hover:text-[#5f2f21] dark:hover:text-[#a05a30]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublishJob(job._id);
                      }}
                    />
                    <Trash2
                      size={16}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteJob(job._id);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col gap-3 md:flex-row justify-between items-center mt-6 text-sm px-5 pb-5">
              <p className="text-gray-500">
                Showing {filteredJobs.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredJobs.length)} of {filteredJobs.length} jobs
              </p>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageIndex = index + 1;
                  return (
                    <button
                      key={pageIndex}
                      onClick={() => setPage(pageIndex)}
                      className={["bhn-chip", page === pageIndex ? "bhn-chip-active" : ""].filter(Boolean).join(" ")}
                    >
                      {pageIndex}
                    </button>
                  );
                })}
              </div>
            </div>

          </Card>
        </main>
      </div>

      <Footer />
    </div>
  );
}