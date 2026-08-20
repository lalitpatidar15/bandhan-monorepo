"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bookmark,
  Share2,
  MapPin,
  Check,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

import { CareersHeader } from "@/components/CareersHeader";
import { Card } from "@/components/ui/card";
import {
  useGetJobDetailsQuery,
  useGetJobShareQuery,
  useSaveJobMutation,
  useRemoveSavedJobMutation,
} from "@/app/Jobseeker/redux/services/JobsApi";

function formatSalary(min?: number | string, max?: number | string, currency = "₹") {
  const toNumber = (value?: number | string) => {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }

    return undefined;
  };

  const minValue = toNumber(min);
  const maxValue = toNumber(max);

  if (typeof minValue === "number" && typeof maxValue === "number") {
    return `${currency}${minValue.toLocaleString()} - ${currency}${maxValue.toLocaleString()} per year`;
  }

  if (typeof minValue === "number") {
    return `${currency}${minValue.toLocaleString()} per year`;
  }

  return "Salary not disclosed";
}

function JobDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("jobId") || "";
  const { data, isLoading, isError, error } = useGetJobDetailsQuery(jobId, {
    skip: !jobId,
  });

  const job = useMemo(() => {
    const detail = data?.data;
    const company = detail?.company;

    return {
      jobId: detail?.jobId || jobId,
      title: detail?.jobTitle || "Untitled Role",
      companyName: company?.companyName || "Company not disclosed",
      companyLogo: company?.companyLogo || "/logo.png",
      location: detail?.location || "Remote",
      salary: formatSalary(detail?.salaryMin, detail?.salaryMax, detail?.salaryCurrency),
      tags: [
        detail?.remoteAvailable ? "REMOTE" : "ON-SITE",
        (detail?.jobType || "FULL-TIME").toUpperCase(),
        (detail?.experienceLevel || "MID-LEVEL").toUpperCase(),
      ],
      aboutRole: detail?.aboutRole || "A great opportunity is waiting for the right candidate.",
      responsibilities: Array.isArray(detail?.responsibilities) ? detail.responsibilities.filter(Boolean) : [],
      skills: Array.isArray(detail?.skills) ? detail.skills.filter(Boolean) : [],
      postedOn: detail?.postedOn,
      totalApplicants: detail?.totalApplicants ?? 0,
      totalViews: detail?.totalViews ?? 0,
      jobCategory: detail?.jobCategory,
      similarJobs: Array.isArray(detail?.similarJobs) ? detail.similarJobs : [],
      applicationDeadline: detail?.applicationDeadline,
      openings: detail?.openings,
      benefits: Array.isArray(detail?.benefits) ? detail.benefits.filter(Boolean) : [],
    };
  }, [data, jobId]);

  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saveJob, { isLoading: isSaving }] = useSaveJobMutation();
  const [removeSavedJob, { isLoading: isRemoving }] = useRemoveSavedJobMutation();
  const { refetch: refetchShare } = useGetJobShareQuery(job.jobId || "", { skip: true });

  const handleSaveToggle = async () => {
    if (!job.jobId) {
      setShareMessage("Unable to save: missing job id");
      setTimeout(() => setShareMessage(""), 2500);
      return;
    }

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      if (nextSaved) {
        await saveJob(job.jobId).unwrap();
      } else {
        await removeSavedJob(job.jobId).unwrap();
      }
    } catch (err: any) {
      setIsSaved(!nextSaved);
      setShareMessage(err?.data?.message || err?.message || "Unable to update saved job");
      setTimeout(() => setShareMessage(""), 3000);
    }
  };

  const handleShare = async () => {
    if (!job.jobId) {
      setShareMessage("No job selected to share");
      setTimeout(() => setShareMessage(""), 2500);
      return;
    }

    // Immediately show native share / clipboard using a locally-constructed URL
    setIsSharing(true);
    const localShareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/Jobseeker/job-detail?jobId=${encodeURIComponent(
      job.jobId || "",
    )}`;
    const localTitle = job.title;

    try {
      if (navigator.share) {
        await navigator.share({ title: localTitle, url: localShareUrl });
        setShareMessage("Shared successfully");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(localShareUrl);
        setShareMessage("Copied link to clipboard");
      } else {
        // fallback prompt
        // eslint-disable-next-line no-alert
        window.prompt("Copy this link", localShareUrl);
        setShareMessage("Link shown — copy it manually");
      }
    } catch (err: any) {
      // If native share failed, still proceed to try fetching canonical link
      setShareMessage(err?.message || "Share cancelled or failed");
    }

    // In background, request server's canonical share URL and update clipboard if different
    try {
      const result = await refetchShare();
      if (!(result as any).error) {
        const data = (result as any).data as any;
        const canonical = data?.data?.shareUrl;
        if (canonical && canonical !== localShareUrl && navigator.clipboard) {
          await navigator.clipboard.writeText(canonical);
          setShareMessage("Copied canonical link to clipboard");
        }
      }
    } catch (error) {
      console.error("Unable to fetch canonical share URL:", error);
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareMessage(""), 3000);
    }
  };

  const errorMessage =
    typeof (error as { data?: { message?: string } } | undefined)?.data?.message === "string"
      ? (error as { data?: { message?: string } }).data?.message
      : "Unable to load this job right now.";

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#2D1F1A] flex flex-col">
      <CareersHeader variant="jobs" activeTab="Jobs" />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-5">
        <p className="text-xs sm:text-sm text-gray-500 pt-4">Jobs &gt; {job.title}</p>
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-5 py-5">
          <div className="mx-auto px-4 flex flex-col lg:flex-row gap-5">
            <div className="space-y-8 py-6 w-full lg:w-[70%]">
              <Card className="bg-white p-5 sm:p-4 rounded-3xl border border-[#F1E1D7] shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center overflow-hidden shrink-0">
                      <img src={job.companyLogo} alt="Company Logo" className="object-contain w-8 h-8" />
                    </div>

                    <div className="space-y-4 w-full">
                      <div>
                        <h1 className="text-2xl sm:text-2xl md:text-6xl lg:text-2xl font-serif font-semibold leading-tight text-[#2D1F1A]">
                          {job.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B3E2E] mt-3">
                          <span className="text-sm opacity-90">{job.companyName}</span>
                          {job.jobCategory ? (
                            <>
                              <span className="hidden sm:block w-1 h-1 bg-[#E7D6CC] rounded-full" />
                              <span className="hidden sm:block text-sm text-[#8B7368]">{job.jobCategory}</span>
                            </>
                          ) : null}
                          <span className="hidden sm:block w-1 h-1 bg-[#E7D6CC] rounded-full" />
                          <div className="flex items-center gap-1 text-sm text-[#8B7368]">
                            <MapPin size={14} className="text-[#8B7368]" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs tracking-wider uppercase bg-[#FDEDE6] text-[#6B3E2E] px-3 py-1 rounded-full font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="bg-[#FCF3EE] px-5 py-3 rounded-2xl text-sm font-semibold w-fit text-[#6B3E2E] mt-3">{job.salary}</div>
                    </div>
                  </div>

                  <div className="hidden lg:flex w-14 h-14 rounded-2xl bg-black items-center justify-center overflow-hidden shrink-0">
                    <img src={job.companyLogo} alt="Company Logo" className="object-contain w-8 h-8" />
                  </div>
                </div>
              </Card>

              {isLoading ? (
                <div className="rounded-3xl border border-[#E9DDD5] bg-white p-5 text-center text-sm text-[#8A7A72]">
                  Loading job details...
                </div>
              ) : isError ? (
                <div className="rounded-3xl border border-[#E9DDD5] bg-white p-5 text-center text-sm text-[#8A7A72]">
                  {errorMessage}
                </div>
              ) : !jobId ? (
                <div className="rounded-3xl border border-[#E9DDD5] bg-white p-5 text-center text-sm text-[#8A7A72]">
                  Select a job to view the full details.
                </div>
              ) : (
                <>
                  <section>
                    <h2 className="text-2xl font-semibold mb-3 text-[#3E2D26]">About the Role</h2>
                    <p className="text-sm sm:text-[15px] text-[#7C6A63] leading-8">{job.aboutRole}</p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4 text-[#3E2D26]">Responsibilities</h2>
                    {job.responsibilities.length > 0 ? (
                      <ul className="space-y-4">
                        {job.responsibilities.map((item, index) => (
                          <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm text-[#7C6A63]">
                            <div className="mt-1 flex h-5 w-5 items-center justify-center border border-[#7A3F23] rounded-full shrink-0">
                              <Check size={14} className="text-[#7A3F23]" />
                            </div>
                            <span className="leading-7">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">Responsibilities will be shared soon.</p>
                    )}
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4 text-[#3E2D26]">Skills & Requirements</h2>
                    {job.skills.length > 0 ? (
                      <ul className="space-y-4">
                        {job.skills.map((item, index) => (
                          <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm text-[#7C6A63]">
                            <div className="mt-1 flex h-5 w-5 items-center justify-center border border-[#7A3F23] border-dashed rounded-full shrink-0">
                              <Check size={14} className="text-[#7A3F23]" />
                            </div>
                            <span className="leading-7">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">No specific skill list was provided for this role.</p>
                    )}
                  </section>

                  {job.benefits && job.benefits.length > 0 && (
                    <section>
                      <h2 className="text-xl font-semibold mb-4 text-[#3E2D26]">Why join this team</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {job.benefits.map((item, index) => (
                          <div key={index} className="bg-[#FFF4EE] p-5 rounded-2xl border border-[#F3E5DC]">
                            <div className="mb-3">
                              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                                <Check size={18} className="text-[#7A3F23]" />
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-[#3E2D26] text-sm">{item}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>

            <div className="w-full lg:w-[32%]">
              <div className="xl:sticky xl:top-6 space-y-6">

                {/* Right Side Card */}
                <Card className="bg-white border border-[#E8DDD5] rounded-3xl p-4 shadow-sm">

                  {/* Company Info */}
                  <div className="flex items-center gap-4 pb-5 border-b border-[#F3E5DC]">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#E8DDD5] bg-[#FFF8F4] flex items-center justify-center shrink-0">
                      <img
                        src={job.companyLogo}
                        alt="Company Logo"
                        className="w-10 h-10 object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[16px] font-semibold text-[#2D201B] line-clamp-2">
                        {job.title}
                      </h3>

                      <p className="text-sm text-[#8A7A72] mt-1 truncate">
                        {job.companyName}
                      </p>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="mt-6">
                    <Link href={`/Jobseeker/apply?jobId=${encodeURIComponent(job.jobId)}`}>
                      <button className="w-full h-12 rounded-xl bg-[#8B3E05] hover:bg-[#6B2E04] text-white font-semibold transition-all">
                        Apply Now
                      </button>
                    </Link>
                  </div>

                  {/* Save Share */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={handleSaveToggle}
                      disabled={isSaving || isRemoving}
                      className={`h-11 rounded-xl border flex items-center justify-center gap-2 transition disabled:opacity-60 ${
                        isSaved
                          ? "border-[#8B3E05] bg-[#8B3E05] text-white"
                          : "border-[#E8DDD5] text-[#5E463A] hover:bg-[#FFF4EE]"
                      }`}
                    >
                      <Bookmark size={16} />
                      <span className="text-sm font-medium">{isSaved ? "Saved" : "Save"}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="h-11 rounded-xl border border-[#E8DDD5] flex items-center justify-center gap-2 text-[#5E463A] hover:bg-[#FFF4EE] transition disabled:opacity-60"
                    >
                      <Share2 size={16} />
                      <span className="text-sm font-medium">{isSharing ? "Sharing…" : "Share"}</span>
                    </button>
                  </div>

                  {shareMessage ? (
                    <div className="mt-2 text-xs text-[#6B3E2E]">{shareMessage}</div>
                  ) : null}

                  {/* Job Info */}
                  <div className="mt-6 border-t border-[#F3E5DC] pt-5 space-y-4">

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8A7A72]">Posted</span>
                      <span className="font-medium text-[#2D201B]">
                        {job.postedOn || "Recently posted"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8A7A72]">Applicants</span>
                      <span className="font-medium text-[#2D201B]">
                        {job.totalApplicants ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8A7A72]">Views</span>
                      <span className="font-medium text-[#2D201B]">
                        {job.totalViews ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8A7A72]">Deadline</span>
                      <span className="font-medium text-[#2D201B] text-right">
                        {job.applicationDeadline || "Not specified"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8A7A72]">Openings</span>
                      <span className="font-medium text-[#2D201B]">
                        {job.openings ?? 0}
                      </span>
                    </div>

                  </div>

                  {/* Verified */}
                  <div className="mt-6 space-y-3">

                    <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                      <CheckCircle size={18} className="text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-green-700">
                        Verified Company
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-[#F8F8F8] border border-[#ECECEC] px-4 py-3">
                      <ShieldCheck size={18} className="text-gray-500 shrink-0" />
                      <span className="text-sm font-medium text-gray-600">
                        Secure application process
                      </span>
                    </div>

                  </div>

                </Card>

                {/* Similar Jobs */}
                <section className="bg-[#F8F2ED] border border-[#E8DDD5] rounded-3xl p-4">

                  <h2 className="text-lg font-semibold text-[#2D201B] mb-5">
                    You might also like
                  </h2>

                  <div className="space-y-4">

                    {job.similarJobs.length > 0 ? (
                      job.similarJobs.map((item, index) => (
                        <Link
                          key={item.jobId || index}
                          href={`/Jobseeker/job-detail?jobId=${encodeURIComponent(item.jobId || "")}`}
                          className="block rounded-2xl bg-white border border-[#E8DDD5] p-4 hover:shadow-md transition"
                        >
                          <p className="text-sm font-semibold text-[#2D201B] line-clamp-2">
                            {item.jobTitle || "Similar role"}
                          </p>

                          <p className="text-xs text-[#8A7A72] mt-2">
                            {item.companyName || "Company"} • {item.location || "Remote"}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-2xl bg-white border border-[#E8DDD5] p-5 text-center">
                        <p className="text-sm text-[#8A7A72]">
                          No similar roles found
                        </p>
                      </div>
                    )}

                  </div>

                </section>

              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t bg-white mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-6 text-sm text-gray-500 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Bandhan Careers</p>
          <div className="flex flex-wrap gap-4">
            <span className="cursor-pointer hover:text-black transition" onClick={() => router.push("/privacy-policy")}>Privacy Policy</span>
            <span className="cursor-pointer hover:text-black transition" onClick={() => router.push("/terms")}>Terms</span>
            <span className="cursor-pointer hover:text-black transition" onClick={() => router.push("/cookie-policy")}>Cookie Policy</span>
            <span className="cursor-pointer hover:text-black transition" onClick={() => router.push("/support")}>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF8F4] text-[#2D1F1A]" />}>
      <JobDetailPageContent />
    </Suspense>
  );
}
