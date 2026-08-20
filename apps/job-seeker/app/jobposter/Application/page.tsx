"use client";

import dynamic from "next/dynamic";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CareersHeader } from "@/components/CareersHeader";
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, PageHeader, Textarea, statusTone } from "@bandhan/ui";
import { MoreVertical, Search, Download, Calendar, Mail, ChevronLeft, ChevronRight, Users } from "lucide-react";
import {
  useGetApplicantsQuery,
  useUpdateApplicationStatusMutation,
  useBulkUpdateStatusMutation,
  useScheduleInterviewMutation,
  useLazyDownloadResumeQuery,
} from "../redux/services/JobApi";
import { useGetRecruiterDashboardQuery } from "../redux/services/RecruiterDashboardApi";

const PdfDocument = dynamic(
  async () => {
    const mod = await import("react-pdf");
    mod.pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    return mod.Document;
  },
  { ssr: false }
);

const PdfPage = dynamic(async () => {
  const mod = await import("react-pdf");
  return mod.Page;
}, { ssr: false });

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Applied", value: "Applied" },
  { label: "Shortlisted", value: "Shortlisted" },
  { label: "Interview", value: "Reviewed" },
  { label: "Rejected", value: "Rejected" },
];

function getApplicantResumeUrl(applicant: any): string | undefined {
  if (typeof applicant.resume === "string" && applicant.resume) {
    return applicant.resume;
  }

  if (typeof applicant.resumeUrl === "string" && applicant.resumeUrl) {
    return applicant.resumeUrl;
  }

  const seekerResume = applicant?.seekerId?.resume;
  if (typeof seekerResume === "string" && seekerResume) {
    return seekerResume;
  }

  if (seekerResume && typeof seekerResume === "object") {
    return seekerResume.resumeUrl || seekerResume.resume;
  }

  const nestedResumeUrl = applicant?.seekerId?.resumeUrl;
  if (typeof nestedResumeUrl === "string" && nestedResumeUrl) {
    return nestedResumeUrl;
  }

  return undefined;
}

function getApplicantCareerNote(applicant: any): string | undefined {
  const noteSources = [
    applicant.coverLetter,
    applicant.careerNote,
    applicant.note,
    applicant.notes,
    applicant.summary,
    applicant.description,
    applicant.bio,
    applicant.careerObjective,
    applicant.profileSummary,
  ];

  for (const field of noteSources) {
    if (typeof field === "string" && field.trim()) {
      return field.trim();
    }
  }

  const seekerNote = applicant?.seekerId;
  if (seekerNote && typeof seekerNote === "object") {
    const nestedSources = [
      seekerNote.careerNote,
      seekerNote.note,
      seekerNote.notes,
      seekerNote.summary,
      seekerNote.description,
      seekerNote.bio,
      seekerNote.careerObjective,
      seekerNote.profileSummary,
    ];

    for (const field of nestedSources) {
      if (typeof field === "string" && field.trim()) {
        return field.trim();
      }
    }
  }

  return undefined;
}

export default function ApplicantsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6EEE7] dark:bg-[#171717] text-[#3E2F2B] dark:text-[#ededed]" />}>
      <ApplicantsPageContent />
    </Suspense>
  );
}

function ApplicantsPageContent() {
  const searchParams = useSearchParams();
  const jobIdFromQuery = searchParams?.get("jobId") ?? "";
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dashboardSort, setDashboardSort] = useState<string>(() => {
    if (typeof window === "undefined") return "newest";
    return localStorage.getItem("jobposterDashboardSort") || "newest";
  });
  const [dashboardStatus, setDashboardStatus] = useState<string>(() => {
    if (typeof window === "undefined") return "all";
    const stored = localStorage.getItem("jobposterDashboardStatus");
    if (!stored) return "all";
    return stored.toLowerCase() === "all" ? "all" : stored.toLowerCase();
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isInterviewFormOpen, setIsInterviewFormOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");

  const [updateApplicationStatus, { isLoading: isStatusLoading }] = useUpdateApplicationStatusMutation();
  const [bulkUpdateStatus, { isLoading: isBulkStatusLoading }] = useBulkUpdateStatusMutation();
  const [scheduleInterview, { isLoading: isScheduleLoading }] = useScheduleInterviewMutation();
  const [triggerDownloadResume, { isLoading: isDownloadLoading }] = useLazyDownloadResumeQuery();
  const router = useRouter();
  const { data: recruiterDashboardData, isLoading: isDashboardLoading } = useGetRecruiterDashboardQuery({
    search: "",
    status: dashboardStatus === "all" ? "all" : dashboardStatus,
    sort: dashboardSort,
  });

  const fallbackJob = useMemo(() => {
    if (!recruiterDashboardData?.data?.jobs?.length) return null;

    return recruiterDashboardData.data.jobs[0];
  }, [recruiterDashboardData]);

  const fallbackJobId = fallbackJob?._id || "";
  const resolvedJobId = jobIdFromQuery || fallbackJobId;
  useEffect(() => {
    if (!jobIdFromQuery && fallbackJobId) {
      router.replace(`/jobposter/Application?jobId=${fallbackJobId}`);
    }
  }, [jobIdFromQuery, fallbackJobId, router]);

  const { data, error, isLoading, isError, refetch } = useGetApplicantsQuery(
    { jobId: resolvedJobId, search, status: filter, sort, page, limit: 10 },
    {
      skip: !resolvedJobId || isDashboardLoading,
    }
  );
  const applicants = data?.data?.applicants ?? [];
  const normalizedApplicants = applicants.map((applicant) => {
    const rawApplicant = applicant as any;

    return {
      ...applicant,
      profileImage: rawApplicant.profileImage || rawApplicant.profilePhoto || rawApplicant.seekerId?.profileImage || rawApplicant.seekerId?.profilePhoto || "",
      fullName: rawApplicant.fullName || rawApplicant.seekerId?.fullName || "Untitled",
      email: rawApplicant.email || rawApplicant.seekerId?.email || "",
      experience: rawApplicant.experience || rawApplicant.experienceLevel || rawApplicant.seekerId?.experienceLevel || "Fresher",
      role: rawApplicant.role || rawApplicant.currentRole || rawApplicant.seekerId?.currentRole || "Candidate",
      location: rawApplicant.location || rawApplicant.seekerId?.location || "",
      skills: rawApplicant.skills || rawApplicant.seekerId?.skills || [],
      workHistory: rawApplicant.workHistory || rawApplicant.seekerId?.workHistory || [],
      resume: getApplicantResumeUrl(rawApplicant),
      careerNote: getApplicantCareerNote(rawApplicant),
      appliedDate: rawApplicant.appliedDate || rawApplicant.submittedAt || rawApplicant.createdAt || "",
      status: rawApplicant.status || "Applied",
    };
  });

  const jobTitle = data?.data?.job?.jobTitle || recruiterDashboardData?.data?.jobs?.[0]?.jobTitle || "Applicants";
  const stats = data?.data?.stats ?? {
    totalApplicants: 0,
    shortlisted: 0,
    interviewed: 0,
    rejected: 0,
  };
  const pagination = data?.data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  };

  const selectedCandidate = useMemo(
    () => {
      if (selectedIds.length) {
        return normalizedApplicants.find((applicant) => selectedIds.includes(applicant.applicationId));
      }
      return normalizedApplicants[0];
    },
    [normalizedApplicants, selectedIds]
  );

  useEffect(() => {
    if (!applicants.length && selectedIds.length > 0) {
      setSelectedIds([]);
    }
  }, [applicants, selectedIds]);

  useEffect(() => {
    setSelectedIds([]);
  }, [resolvedJobId]);

  const toggleSelection = (applicationId: string) => {
    setSelectedIds((current) =>
      current.includes(applicationId) ? current.filter((id) => id !== applicationId) : [...current, applicationId]
    );
  };

  const handleSortToggle = () => {
    setSort((current) => (current === "newest" ? "oldest" : "newest"));
    setPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  const displayedCandidate = selectedCandidate || {
    fullName: "Select a candidate",
    email: "",
    experience: "",
    profileImage: "",
    role: "",
    resume: "",
    status: "",
    careerNote: "",
    applicationId: "",
    workHistory: [],
  };

  const [numPages, setNumPages] = useState<number>();
  const resumeWrapperRef = useRef<HTMLDivElement | null>(null);
  const [resumeWidth, setResumeWidth] = useState(260);

  const selectedApplicationIds = selectedIds;
  const selectedCount = selectedApplicationIds.length;
  const selectedApplicationId = displayedCandidate.applicationId;

  const handleStatusUpdate = async (status: string) => {
    if (!selectedApplicationId) {
      setStatusMessage("Please select a candidate first.");
      return;
    }

    try {
      setStatusMessage(null);
      await updateApplicationStatus({ applicationId: selectedApplicationId, status }).unwrap();
      setStatusMessage(`Status updated to ${status}`);
      refetch();
    } catch (error: any) {
      setStatusMessage(error?.data?.message || "Failed to update status.");
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (!selectedApplicationIds.length) {
      setStatusMessage("Please select one or more applications first.");
      return;
    }

    try {
      setStatusMessage(null);
      await bulkUpdateStatus({ applicationIds: selectedApplicationIds, status }).unwrap();
      setSelectedIds([]);
      setStatusMessage(`Bulk status updated to ${status}`);
      refetch();
    } catch (error: any) {
      setStatusMessage(error?.data?.message || "Failed to update bulk status.");
    }
  };

  const handleDownloadResume = async () => {
    if (!selectedApplicationId) {
      setStatusMessage("Please select a candidate first.");
      return;
    }

    try {
      const result = await triggerDownloadResume(selectedApplicationId).unwrap();
      const resumeUrl = result?.data?.resumeUrl;
      if (resumeUrl) {
        window.open(resumeUrl, "_blank");
      } else {
        setStatusMessage("Resume URL not found.");
      }
    } catch (error: any) {
      setStatusMessage(error?.data?.message || "Unable to download resume.");
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplicationId) {
      setStatusMessage("Please select a candidate first.");
      return;
    }

    if (!interviewDate || !meetingLink || !interviewer) {
      setStatusMessage("Please fill interview date, meeting link, and interviewer.");
      return;
    }

    try {
      setStatusMessage(null);
      await scheduleInterview({
        applicationId: selectedApplicationId,
        interviewDate,
        meetingLink,
        interviewer,
        notes: interviewNotes,
      }).unwrap();
      setStatusMessage("Interview scheduled successfully.");
      setIsInterviewFormOpen(false);
      setInterviewDate("");
      setMeetingLink("");
      setInterviewer("");
      setInterviewNotes("");
      refetch();
    } catch (error: any) {
      setStatusMessage(error?.data?.message || "Failed to schedule interview.");
    }
  };

  useEffect(() => {
    const element = resumeWrapperRef.current;
    if (!element) return;

    const resize = () => {
      setResumeWidth(Math.max(260, element.clientWidth - 24));
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function onLoadSuccess({ numPages }: any) {
    setNumPages(numPages);
  }

  return (
    <div className="min-h-screen bg-[#F6EEE7] dark:bg-[#171717] text-[#3E2F2B] dark:text-[#ededed]">
      <CareersHeader variant="jobposter" activeTab="Application" />

      <main className="mx-auto max-w-[1400px] px-4 md:px-5 py-6 space-y-6">
        <PageHeader
          title={`${jobTitle} Applicants`}
          subtitle="Review and manage candidate applications for this role with a clear, structured list and fast filtering."
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Applicants", stats.totalApplicants],
            ["Shortlisted", stats.shortlisted],
            ["Interviewed", stats.interviewed],
            ["Rejected", stats.rejected],
          ].map(([title, value]) => (
            <div key={title} className="bhn-stat">
              <div className="bhn-stat-label">
                <span>{title}</span>
              </div>
              <div className="bhn-stat-value">{value}</div>
            </div>
          ))}
        </section>

        <Card padded={false}>
          <div className="bhn-card-header">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search candidate..."
                className="pl-12"
              />
            </div>
          </div>

          <div className="px-5 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => handleFilterChange(option.value)}
                className={["bhn-chip", filter === option.value ? "bhn-chip-active" : ""].filter(Boolean).join(" ")}
              >
                {option.label}
              </button>
            ))}
          </div>
          {selectedApplicationIds.length > 0 && (
            <div className="mx-5 mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#E7E0D8] dark:border-[#374151] bg-[#FFF8F2] dark:bg-[#2a2018] p-4 text-sm text-[#4F4339] dark:text-[#a89080]">
              <span className="font-semibold">{selectedApplicationIds.length} selected</span>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleBulkStatusUpdate("Shortlisted")}
                disabled={isBulkStatusLoading}
              >
                Bulk Shortlist
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleBulkStatusUpdate("Rejected")}
                disabled={isBulkStatusLoading}
              >
                Bulk Reject
              </Button>
              <Button
                type="button"
                variant="soft"
                size="sm"
                onClick={() => handleBulkStatusUpdate("Reviewed")}
                disabled={isBulkStatusLoading}
              >
                Bulk Review
              </Button>
            </div>
          )}
          {statusMessage && (
            <div className="bhn-alert bhn-alert-info mx-5 mt-4 text-sm">
              {statusMessage}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.6fr_0.95fr] p-5">
            <div className="space-y-4">
              {isDashboardLoading || (isLoading && resolvedJobId) ? (
                <div className="px-6 py-12 text-center text-gray-400">Loading applicants...</div>
              ) : isError ? (
                <div className="px-6 py-12 text-center text-gray-400">{(error as { message?: string })?.message || "Unable to load applicants."}</div>
              ) : !resolvedJobId ? (
                <div className="px-6 py-12 text-center text-gray-400">No job is available yet to load applicants.</div>
              ) : applicants.length === 0 ? (
                <EmptyState
                  icon={<Users size={28} />}
                  title="No applicants found"
                  description="No applicants match the current filters."
                />
              ) : (
                <div className="bhn-table-wrap">
                  <table className="bhn-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Experience</th>
                        <th>Skills</th>
                        <th>Applied</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {normalizedApplicants.map((applicant) => (
                        <tr key={applicant.applicationId}>
                          <td>
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(applicant.applicationId)}
                                onChange={() => toggleSelection(applicant.applicationId)}
                                className="h-4 w-4 rounded border-gray-300 text-[#7A3E1B] dark:text-[#c9a882] focus:ring-[#7A3E1B] dark:focus:ring-[#c9a882]"
                              />
                              <Avatar
                                src={applicant.profileImage || ""}
                                name={applicant.fullName || "?"}
                                size="md"
                              />
                              <div className="min-w-0">
                                <Link
                                  href={`/jobposter/profileview?applicationId=${applicant.applicationId}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    router.push(`/jobposter/profileview?applicationId=${applicant.applicationId}`);
                                  }}
                                  className="text-sm font-semibold text-[#3E2F2B] dark:text-[#ededed] truncate hover:text-[#7A3E1B] dark:hover:text-[#c9a882]"
                                >
                                  {applicant.fullName || "Untitled"}
                                </Link>
                                <p className="text-[11px] text-gray-500 truncate">{applicant.email || "No email"}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="text-sm font-medium text-[#3E2F2B] dark:text-[#ededed]">{applicant.experience || "Fresher"}</p>
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-1.5">
                              {(applicant.skills || []).length > 0 ? (
                                (applicant.skills || []).slice(0, 3).map((skill: string) => (
                                  <Badge key={skill} tone="neutral">
                                    {skill}
                                  </Badge>
                                ))
                              ) : (
                                <Badge tone="neutral">No skills listed</Badge>
                              )}
                            </div>
                          </td>
                          <td className="text-sm text-gray-600 whitespace-nowrap">
                            {applicant.appliedDate ? new Date(applicant.appliedDate).toLocaleDateString() : "—"}
                          </td>
                          <td>
                            <Badge tone={statusTone(applicant.status || "Applied")}>
                              {applicant.status || "Applied"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
                <span>{applicants.length} of {stats.totalApplicants} applicants</span>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#E7DDD3] dark:border-[#374151] bg-[#F6E0F8] dark:bg-[#2a1828] px-3 py-2 text-sm text-[#4F4339] dark:text-[#a89080]">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-full p-2 hover:bg-[#EAD7C6] dark:hover:bg-[#a05a30] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>{pagination.currentPage} / {pagination.totalPages}</span>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                    className="rounded-full p-2 hover:bg-[#EAD7C6] dark:hover:bg-[#a05a30] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <Card className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 font-semibold">Candidate Details</p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#3E2F2B] dark:text-[#ededed]">{displayedCandidate.fullName}</h2>
                    <p className="mt-2 text-sm text-gray-500">{(displayedCandidate as any).role || "Candidate profile"}</p>
                  </div>
                  <button onClick={() => alert('Options: View Profile, Message, Schedule Interview')} className="rounded-3xl bg-[#F4ECE6] dark:bg-[#2a2a2a] p-3 text-[#6B3E2E] dark:text-[#c9a882] hover:bg-[#E9D8C9] dark:hover:bg-[#2a2a2a] transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="space-y-4 text-center">
                  <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-[#F8F1EB] dark:bg-[#2a2018] p-1 shadow-sm">
                    {displayedCandidate.profileImage ? (
                      <img
                        src={displayedCandidate.profileImage}
                        alt={displayedCandidate.fullName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center rounded-full bg-[#EDE2D8] dark:bg-[#2a2018] text-lg font-semibold text-[#7A4A34] dark:text-[#c9a882]">
                        {displayedCandidate.fullName?.charAt(0) ?? "?"}
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-[#32BD58] border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#3E2F2B] dark:text-[#ededed]">{displayedCandidate.fullName}</p>
                    <p className="text-sm text-gray-500">{displayedCandidate.experience || "Fresher"} experience</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={handleDownloadResume}
                    disabled={!selectedApplicationId || isDownloadLoading}
                    variant={selectedApplicationId ? "primary" : "secondary"}
                    className="text-xs h-12"
                    icon={<Download size={14} />}
                  >
                    {isDownloadLoading ? "Downloading..." : "Download CV"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsInterviewFormOpen((current) => !current)}
                    className="text-xs h-12"
                    icon={<Calendar size={14} />}
                  >
                    Schedule Call
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="soft"
                    onClick={() => handleStatusUpdate("Reviewed")}
                    disabled={!selectedApplicationId || isStatusLoading}
                  >
                    Mark Reviewed
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleStatusUpdate("Shortlisted")}
                    disabled={!selectedApplicationId || isStatusLoading}
                  >
                    Shortlist
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => handleStatusUpdate("Rejected")}
                    disabled={!selectedApplicationId || isStatusLoading}
                  >
                    Reject
                  </Button>
                  <a
                    href={displayedCandidate.email ? `mailto:${displayedCandidate.email}` : undefined}
                    className={`rounded-full ${displayedCandidate.email ? "bg-[#F1E8DF] dark:bg-[#2a2a2a] text-[#4F4339] dark:text-[#a89080] hover:bg-[#EAD7C6] dark:hover:bg-[#a05a30]" : "bg-gray-200 text-gray-500 cursor-not-allowed"} px-4 py-2 text-xs font-semibold transition`}
                    aria-disabled={!displayedCandidate.email}
                    onClick={(e) => { if (!displayedCandidate.email) e.preventDefault(); }}
                  >
                    Email Candidate
                  </a>
                </div>
                {isInterviewFormOpen && (
                  <div className="rounded-2xl border border-[#E8E8E8] dark:border-[#374151] bg-white dark:bg-[#171717] p-4 space-y-4">
                    <p className="text-sm font-semibold text-[#3E2F2B] dark:text-[#ededed]">Schedule Interview</p>
                    <Field label="Interview Date">
                      <Input
                        type="datetime-local"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                      />
                    </Field>
                    <Field label="Meeting Link">
                      <Input
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                      />
                    </Field>
                    <Field label="Interviewer">
                      <Input
                        value={interviewer}
                        onChange={(e) => setInterviewer(e.target.value)}
                      />
                    </Field>
                    <Field label="Notes">
                      <Textarea
                        value={interviewNotes}
                        onChange={(e) => setInterviewNotes(e.target.value)}
                        placeholder="Notes (optional)"
                      />
                    </Field>
                    <Button
                      type="button"
                      block
                      onClick={handleScheduleInterview}
                      disabled={isScheduleLoading}
                    >
                      {isScheduleLoading ? "Scheduling..." : "Confirm Schedule"}
                    </Button>
                  </div>
                )}

                <div ref={resumeWrapperRef} className="rounded-2xl border border-dashed border-[#E8DDD5] dark:border-[#374151] bg-[#F8FAFB] dark:bg-[#1a1a1a] p-3 w-full">
                  <p className="text-center text-xs mb-3">Resume Preview</p>

                  {displayedCandidate.resume ? (
                    <PdfDocument
                      file={displayedCandidate.resume}
                      onLoadSuccess={onLoadSuccess}
                      loading="Loading Resume..."
                    >
                      <PdfPage pageNumber={1} width={resumeWidth} />
                    </PdfDocument>
                  ) : (
                    <p className="text-center text-sm text-gray-500">No resume available</p>
                  )}
                </div>

                  <div className="rounded-2xl bg-[#FFF6EE] dark:bg-[#2a2018] border border-[#F8E5D7] dark:border-[#374151] p-5 space-y-4">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-gray-400 font-semibold">
                      <span>Work History</span>
                      <span>{(displayedCandidate as any).workHistory?.length ?? 0} roles</span>
                    </div>
                    <div className="space-y-3 text-sm text-[#3E2F2B] dark:text-[#ededed]">
                      {(displayedCandidate as any).workHistory?.length > 0 ? (
                        (displayedCandidate as any).workHistory.map((wh: any, idx: number) => (
                          <div key={idx}>
                            <p className="font-semibold">{wh.title || wh.role || wh.position} {wh.company ? `• ${wh.company}` : ''}</p>
                            <p className="text-[10px] text-gray-500">{wh.startDate || wh.from || ''} — {wh.endDate || wh.to || wh.current ? 'Present' : ''}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No work history available.</p>
                      )}
                    </div>
                  </div>

                <div className="rounded-2xl border border-[#E8E8E8] dark:border-[#374151] bg-[#F8F8F8] dark:bg-[#1a1a1a] p-5">
                  <div className="flex items-center gap-3 text-sm text-[#3E2F2B] dark:text-[#ededed]">
                    <Mail size={16} />
                    <span>{displayedCandidate.email || "No email provided"}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E8E8E8] dark:border-[#374151] bg-[#F8F8F8] dark:bg-[#1a1a1a] p-5">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 font-semibold">Career Note</p>
                  <p className="mt-2 text-sm text-[#3E2F2B] dark:text-[#ededed]">
                    {displayedCandidate.careerNote || "No career note available for this candidate."}
                  </p>
                </div>
              </Card>
            </aside>
          </div>
        </Card>
      </main>
    </div>
  );
}