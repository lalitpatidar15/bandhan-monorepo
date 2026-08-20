"use client";

export const dynamic = "force-dynamic";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CareersHeader } from "@/components/CareersHeader";
import { Avatar, Badge, Input } from "@bandhan/ui";
import { useGetHiringPipelineQuery } from "../redux/services/JobApi";
import { useGetRecruiterDashboardQuery } from "../redux/services/RecruiterDashboardApi";

function mapPipelineToBoard(data: any) {
  const pipeline = data?.pipeline || {};

  const makeCard = (candidate: any) => ({
    applicationId: candidate.applicationId ?? "",
    name: candidate.fullName ?? "Unknown Candidate",
    role: candidate.currentRole
      ? `${candidate.currentRole}${candidate.experience ? ` | ${candidate.experience}` : ""}`
      : candidate.experience ?? "",
    tags: candidate.skills?.length ? candidate.skills : [],
    img: candidate.profileImage ?? "",
  });

  return {
    Applied: (pipeline.applied ?? []).map(makeCard),
    Shortlisted: (pipeline.shortlisted ?? []).map(makeCard),
    Interview: (pipeline.interview ?? []).map(makeCard),
    Offer: (pipeline.offer ?? []).map(makeCard),
  };
}

const stageTone: Record<string, "neutral" | "info" | "warning" | "success"> = {
  Applied: "neutral",
  Shortlisted: "info",
  Interview: "warning",
  Offer: "success",
};

function HiringPipelineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdFromQuery = searchParams?.get("jobId") ?? "";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");

  const { data: recruiterDashboardData, isLoading: isDashboardLoading } = useGetRecruiterDashboardQuery({
    search: "",
    status: "all",
    sort: "newest",
  });

  const fallbackJobId = recruiterDashboardData?.data?.jobs?.[0]?._id ?? "";
  const resolvedJobId = jobIdFromQuery || fallbackJobId;

  const stageQueryMap: Record<string, string> = {
    all: "all",
    Applied: "applied",
    Shortlisted: "shortlisted",
    Interview: "interview",
    Offer: "offer",
  };

  const { data, isLoading, isError } = useGetHiringPipelineQuery(
    {
      jobId: resolvedJobId,
      search: searchQuery,
      status: stageQueryMap[selectedStage] ?? "all",
      sort: "newest",
    },
    { skip: !resolvedJobId || isDashboardLoading }
  );

  const boardData = useMemo(() => {
    if (!resolvedJobId) {
      return {
        Applied: [],
        Shortlisted: [],
        Interview: [],
        Offer: [],
      };
    }

    return mapPipelineToBoard(data?.data);
  }, [resolvedJobId, data]);

  const jobTitle = data?.data?.job?.jobTitle || recruiterDashboardData?.data?.jobs?.find((job: { _id?: string; jobTitle?: string }) => job._id === resolvedJobId)?.jobTitle || "Hiring Pipeline";

  const visibleStages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const stageList = (['Applied', 'Shortlisted', 'Interview', 'Offer'] as const).filter((stage) =>
      selectedStage === 'all' ? true : stage === selectedStage
    );

    return stageList.map((stage) => {
      const list = boardData[stage] ?? [];
      const filteredList = normalizedQuery
        ? list.filter((candidate: any) => {
            const haystack = [candidate.name, candidate.role, ...(candidate.tags ?? [])]
              .join(' ')
              .toLowerCase();
            return haystack.includes(normalizedQuery);
          })
        : list;

      return { stage, list: filteredList };
    });
  }, [boardData, searchQuery, selectedStage]);

  return (
    <div className="min-h-screen bg-[#F6EEE8] dark:bg-[#171717] text-[#3E2F2A] dark:text-[#ededed] flex flex-col">
      <CareersHeader variant="jobposter" />

      <main className="flex-1 flex flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-5 lg:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Jobs › {jobTitle} ›{' '}
              <span className="text-[#7A3F23] dark:text-[#c9a882] font-medium">Pipeline</span>
            </p>
            <h1 className="text-2xl sm:text-xl font-semibold">Hiring Pipeline</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search candidates..."
              className="w-full sm:w-64"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <select
              value={selectedStage}
              onChange={(event) => setSelectedStage(event.target.value)}
              className="bhn-select w-auto sm:w-48"
            >
              <option value="all">All stages</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex-1 min-h-0">
          {isLoading && resolvedJobId ? (
            <div className="bhn-alert bhn-alert-brand mb-3 text-sm">
              Loading candidates from the API...
            </div>
          ) : null}

          {isError && resolvedJobId ? (
            <div className="bhn-alert bhn-alert-danger mb-3 text-sm">
              We could not load the pipeline right now. Please try again in a moment.
            </div>
          ) : null}

          {!resolvedJobId ? (
            <div className="bhn-card bhn-card-pad mb-3 text-sm">
              No job is selected yet. Open a job from the dashboard to review its candidate pipeline.
            </div>
          ) : null}

          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-4 h-full">
            {visibleStages.map(({ stage, list }) => (
              <section key={stage} className="flex min-h-[320px] flex-col rounded-[24px] border border-[#E7D7CB] dark:border-[#374151] bg-[#F2E2D8] dark:bg-[#2a2018] p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#4F3428] dark:text-[#ededed]">{stage}</h3>
                    <p className="text-[11px] text-gray-500">{list.length} candidates</p>
                  </div>
                  <Badge tone={stageTone[stage]}>{list.length}</Badge>
                </div>

                <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
                  {list.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#E7D7CB] dark:border-[#374151] bg-white/70 dark:bg-[#171717]/70 p-4 text-sm text-[#8C6A5A] dark:text-[#a89080]">
                      No candidates in this stage yet.
                    </div>
                  ) : null}
                  {list.map((c: any, i: number) => (
                    <div
                      key={`${stage}-${i}`}
                      className="bhn-card bhn-card-pad"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={c.img || ""}
                          name={c.name}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold text-[#3E2F2A] dark:text-[#ededed]">{c.name}</p>
                          <p className="mt-0.5 text-sm text-gray-500">{c.role}</p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {c.tags.map((t: string) => (
                              <Badge key={t} tone="neutral">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm text-[#8C6A5A] dark:text-[#a89080]">
                        {(stage === "Shortlisted" || stage === "Offer") && (
                          <Link href={c.applicationId ? `/jobposter/messages?applicationId=${encodeURIComponent(c.applicationId)}&candidateName=${encodeURIComponent(c.name)}` : "#"} className="rounded-full p-2 transition hover:bg-[#F7E9DF] dark:hover:bg-[#2a2a2a]" aria-label="Message">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 4h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </Link>
                        )}
                        <Link href={c.applicationId ? `/jobposter/profileview?applicationId=${encodeURIComponent(c.applicationId)}` : "#"} className="rounded-full p-2 transition hover:bg-[#F7E9DF] dark:hover:bg-[#2a2a2a]" aria-label="Profile">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <button onClick={() => router.push('/jobposter/jobpost')} className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#7A3F23] dark:bg-[#b86a3a] text-2xl text-white shadow-lg transition hover:bg-[#5a2d19] dark:hover:bg-[#a05a30]">
          +
        </button>
      </main>
    </div>
  );
}

export default function HiringPipeline() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6EEE8] dark:bg-[#171717] text-[#3E2F2A] dark:text-[#ededed]" />}>
      <HiringPipelineContent />
    </Suspense>
  );
}