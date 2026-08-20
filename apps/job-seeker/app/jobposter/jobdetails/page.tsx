"use client";

import { CareersHeader } from "@/components/CareersHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/Footer";
import Image from "next/image";
import { MoreVertical } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetJobDetailsQuery, useCloseJobMutation } from "../redux/services/JobApi";
import { Suspense, useEffect, useMemo, useState } from "react";

const statusStyle: Record<string, string> = {
  SHORTLISTED: "bg-[#FDE7DA] dark:bg-[#2a1a10] text-[#9A4D2E] dark:text-[#d4875a]",
  INTERVIEWED: "bg-[#FDE7DA] dark:bg-[#2a1a10] text-[#B45309] dark:text-[#d4875a]",
  APPLIED: "bg-gray-100 text-gray-600",
  REJECTED: "bg-[#FCE8E4] dark:bg-[#2a1515] text-[#9D2B1F] dark:text-[#e06050]",
  REVIEWED: "bg-[#FDE7DA] dark:bg-[#2a1a10] text-[#B45309] dark:text-[#d4875a]",
};

export default function JobDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6EDE7] dark:bg-[#1a1a1a]" />}>
      <JobDetailPageContent />
    </Suspense>
  );
}

function JobDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("jobId") ?? "";
  const { data, isLoading, isError, error } = useGetJobDetailsQuery(jobId, {
    skip: !jobId,
  });
  const [closeJob, { isLoading: isClosing }] = useCloseJobMutation();
  const [activeTab, setActiveTab] = useState(1);

  const job = data?.data?.job;
  const stats = data?.data?.stats;
  const applicants = data?.data?.applicants ?? [];
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const totalCandidates = stats?.totalApplicants ?? applicants.length;
  const totalPages = Math.max(1, Math.ceil(totalCandidates / pageSize));

  const paginatedApplicants = useMemo(
    () => applicants.slice((page - 1) * pageSize, page * pageSize),
    [applicants, page, pageSize]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  return (
    <div className="min-h-screen bg-[#F6EDE7] dark:bg-[#1a1a1a] flex flex-col">
      <CareersHeader variant="jobposter" activeTab="Jobs" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-6">

        {/* 🔥 JOB HEADER */}
        <Card className="p-4 rounded-2xl border bg-[#F4E8E1] dark:bg-[#2a2a2a] shadow-sm">
          <div className="flex flex-col md:flex-row justify-between gap-6">

            <div>
              <h1 className="text-xl font-semibold text-[#3B2A21] dark:text-[#ededed]">
                {isLoading ? "Loading job..." : job?.title ?? "Job details"}
              </h1>

              <p className="text-sm text-[#7E5F49] dark:text-[#b89b7d] mt-1">
                {isLoading
                  ? "Loading company and location..."
                  : `${job?.company ?? "Company"} • ${job?.location ?? "Location"} • Posted ${job?.postedDate ? new Date(job.postedDate).toLocaleDateString() : "—"}`}
              </p>

              <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-[#E7D3C6] dark:bg-[#2a2018] text-[#7A3F23] dark:text-[#c9a882] font-medium">
                {job?.status?.toUpperCase() ?? "ACTIVE"}
              </span>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                variant="secondary"
                onClick={() => router.push(`/jobposter/jobpost?jobId=${jobId}`)}
              >
                Edit Job
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  if (!jobId) return;
                  try {
                    await closeJob(jobId).unwrap();
                    router.refresh();
                  } catch (err: any) {
                    alert(err?.data?.message || err?.message || "Unable to close job.");
                  }
                }}
                disabled={isClosing}
              >
                {isClosing ? "Closing..." : "Close Job"}
              </Button>
              <Button 
                onClick={() => router.push(`/jobposter/jobupgrade?jobId=${jobId}`)}
              className="bg-[#7A3F23] dark:bg-[#b86a3a] hover:bg-[#5f2f19] dark:hover:bg-[#a05a30] text-white">
                Promote Job
              </Button>
            </div>
          </div>
        </Card>

        {/* 📊 STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Applicants",
              value: stats?.totalApplicants ?? 0,
              width: "100%",
            },
            {
              label: "Shortlisted",
              value: stats?.shortlisted ?? 0,
              width: stats?.totalApplicants ? `${Math.round(((stats?.shortlisted ?? 0) / stats.totalApplicants) * 100)}%` : "0%",
            },
            {
              label: "Interviewed",
              value: stats?.interviewed ?? 0,
              width: stats?.totalApplicants ? `${Math.round(((stats?.interviewed ?? 0) / stats.totalApplicants) * 100)}%` : "0%",
            },
            {
              label: "Rejected",
              value: stats?.rejected ?? 0,
              width: stats?.totalApplicants ? `${Math.round(((stats?.rejected ?? 0) / stats.totalApplicants) * 100)}%` : "0%",
            },
          ].map((item) => (
            <Card key={item.label} className="p-5 bg-white dark:bg-[#171717] rounded-xl border">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-2xl font-semibold mt-1">{item.value}</p>

              {/* Progress Bar */}
              <div className="h-1 bg-gray-200 rounded-full mt-3">
                <div
                  className="h-1 bg-[#7A3F23] dark:bg-[#b86a3a] rounded-full"
                  style={{ width: item.width }}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* 📂 TABS */}
        <div className="flex gap-4 border-b text-sm font-medium text-[#7E5F49] dark:text-[#b89b7d]">
          {["Overview", "Applicants", "Messages", "Settings"].map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`pb-3 ${
                i === activeTab
                  ? "border-b-2 border-[#7A3F23] dark:border-[#c9a882] text-[#7A3F23] dark:text-[#c9a882]"
                  : ""
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 👥 TABLE */}
        <Card className="p-4 bg-white dark:bg-[#171717] rounded-2xl border">

          {/* Header */}
          <div className="hidden md:grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.5fr] text-xs text-gray-500 mb-4 uppercase tracking-widest">
            <p className="font-semibold">Candidate</p>
            <p className="font-semibold">Applied date</p>
            <p className="font-semibold">Experience</p>
            <p className="font-semibold">Match score</p>
            <p className="font-semibold">Status</p>
            <span />
          </div>

          {/* Rows */}
          <div className="space-y-3">
  {isLoading ? (
    <div className="rounded-3xl border border-[#E9DDD5] dark:border-[#374151] bg-white dark:bg-[#171717] p-5 text-center">
      <p className="text-sm text-[#8A7A72] dark:text-[#a89080]">Loading applicants...</p>
    </div>
  ) : isError ? (
    <div className="rounded-3xl border border-[#E9DDD5] dark:border-[#374151] bg-white dark:bg-[#171717] p-5 text-center">
      <p className="text-sm text-[#8A7A72] dark:text-[#a89080]">{(error as { message?: string } | undefined)?.message || "Unable to load applicants."}</p>
    </div>
  ) : applicants.length === 0 ? (
    <div className="rounded-3xl border border-[#E9DDD5] dark:border-[#374151] bg-white dark:bg-[#171717] p-5 text-center">
      <p className="text-sm text-[#8A7A72] dark:text-[#a89080]">No applicants have applied for this job yet.</p>
    </div>
  ) : (
    paginatedApplicants.map((item) => (
      <div
        key={item.applicationId}
        className="grid grid-cols-1 md:grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.5fr] items-center bg-[#FAF3EE] dark:bg-[#1a1a1a] p-4 rounded-xl gap-3 md:gap-0 transition-all hover:shadow-sm relative"
      >
        {/* 1. Candidate Info (Avatar + Name) */}
        <div className="flex items-center gap-3 md:col-span-1">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {item.profileImage ? (
              <Image
                src={item.profileImage}
                alt={item.fullName ?? "Candidate"}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#D8C2B2] dark:bg-[#2a2018] flex items-center justify-center text-xs text-white">
                {item.fullName?.charAt(0) ?? "?"}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{item.fullName ?? "Unknown Candidate"}</p>
            <p className="text-xs text-gray-500 truncate md:hidden lg:block">{item.email ?? "No email"}</p>
          </div>
        </div>

        {/* 2. Applied Date */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase md:hidden">Applied:</span>
          <p className="text-sm text-gray-600">
            {item.appliedDate ? new Date(item.appliedDate).toLocaleDateString() : "—"}
          </p>
        </div>

        {/* 3. Experience */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase md:hidden">Experience:</span>
          <p className="text-sm text-gray-600">{item.experienceLevel ?? "Fresher"}</p>
        </div>

        {/* 4. Match Score */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase md:hidden">Score:</span>
          <div className="flex flex-col md:block">
            <p className="text-sm font-medium">{item.status === "Shortlisted" ? "90" : item.status === "Reviewed" ? "75" : "55"}%</p>
            <div className="h-1 bg-gray-200 rounded-full mt-1 w-20">
              <div
                className="h-1 bg-[#7A3F23] dark:bg-[#b86a3a] rounded-full transition-all"
                style={{ width: `${item.status === "Shortlisted" ? 90 : item.status === "Reviewed" ? 75 : 55}%` }}
              />
            </div>
          </div>
        </div>

        {/* 5. Status */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase md:hidden">Status:</span>
          <span
            className={`text-[10px] md:text-xs px-3 py-1 rounded-full font-semibold ${statusStyle[item.status ?? "APPLIED"]}`}
          >
            {(item.status ?? "APPLIED").toUpperCase()}
          </span>
        </div>

        {/* 6. Actions */}
        <div className="absolute top-4 right-4 md:static md:flex md:justify-end">
          <button onClick={() => alert('Options')} className="text-gray-400 hover:text-gray-600 p-1">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
    ))
  )}
</div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mt-6 text-sm">
            <p className="text-gray-500">
              Showing {paginatedApplicants.length} of {totalCandidates} candidates
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`px-3 py-1 rounded-md transition ${
                      page === pageNumber
                        ? "bg-[#7A3E2E] dark:bg-[#b86a3a] text-white"
                        : "bg-white dark:bg-[#171717] border border-[#D9D0C6] dark:border-[#374151] text-[#6B5346] dark:text-[#8b7060] hover:bg-[#F5EBE3] dark:hover:bg-[#2a2a2a]"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            )}
          </div>

        </Card>
      </main>

      <Footer />
    </div>
  );
}