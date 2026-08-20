"use client";

import { Suspense, useState } from "react";
import { MapPin, Briefcase, Layers, DollarSign, CheckCircle, X, ArrowLeft, Clock, Users } from "lucide-react";
import { CareersHeader } from "@/components/CareersHeader";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetJobByIdQuery, useUpdateJobMutation } from "../../redux/services/JobApi";
import { useCreateJobMutation, useSaveDraftMutation } from "../../redux/services/JobApi";
import Link from "next/link";

function ReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("jobId") ?? null;

  const { data: jobData, isLoading } = useGetJobByIdQuery(jobId ?? "", { skip: !jobId });
  const [updateJob, { isLoading: isSaving }] = useUpdateJobMutation();
  const [saveDraftApi] = useSaveDraftMutation();
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  const job = jobData?.data;

  const checks = [
    { label: "Job title", ok: !!job?.jobTitle },
    { label: "Salary range", ok: !!job?.salaryMin && !!job?.salaryMax },
    { label: "Description", ok: (job?.aboutRole?.length ?? 0) > 20 },
    { label: "Skills & tags", ok: (job?.skills?.length ?? 0) > 0 },
    { label: "Location", ok: !!job?.location },
  ];
  const completionScore = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  const handlePublish = async () => {
    if (!jobId) return;
    try {
      await saveDraftApi({ jobId }).unwrap();
      await updateJob({
        jobId,
        body: {
          jobTitle: job?.jobTitle || "",
          jobCategory: job?.jobCategory,
          jobType: job?.jobType,
          experienceLevel: job?.experienceLevel,
          salaryMin: job?.salaryMin,
          salaryMax: job?.salaryMax,
          location: job?.location,
          remoteAvailable: job?.remoteAvailable,
          aboutRole: job?.aboutRole,
          responsibilities: job?.responsibilities,
          skills: job?.skills,
          applicationDeadline: job?.applicationDeadline,
          openings: job?.openings,
        },
      }).unwrap();
      setStatusType("success");
      setStatusMsg("Job published successfully! Redirecting to dashboard...");
      setTimeout(() => router.push("/jobposter/dashboard"), 1500);
    } catch (err: any) {
      setStatusType("error");
      setStatusMsg(err?.data?.message || "Failed to publish job.");
    }
  };

  if (!jobId) {
    return (
      <div className="min-h-screen bg-[#F4ECE6] dark:bg-[#171717] text-[#3E2F2B] dark:text-[#ededed] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">No job selected. Please start from Job Details.</p>
          <Link href="/jobposter/jobpost" className="text-[#6B3E2E] dark:text-[#c9a882] underline">Create a new job</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4ECE6] dark:bg-[#171717] text-[#3E2F2B] dark:text-[#ededed]">
      <CareersHeader variant="jobposter" activeTab="jobpost" />
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        <aside className="hidden lg:block w-64 bg-[#F8F1EB] dark:bg-[#1a1a1a] border-r p-6 space-y-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Steps</p>
          <div className="space-y-4">
            <Link href={`/jobposter/jobpost?jobId=${jobId}`} className="flex items-center gap-3 text-sm p-2 rounded-lg text-gray-500 hover:bg-white/50"><Briefcase size={18} /> Job Details</Link>
            <Link href={`/jobposter/jobpost?jobId=${jobId}`} className="flex items-center gap-3 text-sm p-2 rounded-lg text-gray-500 hover:bg-white/50"><Layers size={18} /> Requirements</Link>
            <Link href={`/jobposter/jobpost/compensation?jobId=${jobId}`} className="flex items-center gap-3 text-sm p-2 rounded-lg text-gray-500 hover:bg-white/50"><DollarSign size={18} /> Compensation</Link>
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg text-[#6B3E2E] dark:text-[#c9a882] bg-white dark:bg-[#171717] shadow-sm font-semibold"><CheckCircle size={18} /> Review</div>
          </div>
        </aside>

        <div className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold font-serif">Review Your Job Post</h1>
            <p className="text-sm text-gray-500 mt-1">Review all details before publishing.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-5">
              <div className="bg-white dark:bg-[#171717] p-5 md:p-6 rounded-2xl border shadow-sm">
                <h2 className="text-lg font-semibold font-serif mb-4">Job Preview</h2>
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{job?.jobTitle || "Untitled Position"}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-2">
                    {job?.location && <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>}
                    {job?.jobType && <span className="flex items-center gap-1"><Briefcase size={14} /> {job.jobType}</span>}
                    {job?.experienceLevel && <span className="flex items-center gap-1"><Users size={14} /> {job.experienceLevel}</span>}
                    {job?.salaryMin && job?.salaryMax && <span className="flex items-center gap-1"><DollarSign size={14} /> ₹{job.salaryMin} - ₹{job.salaryMax}</span>}
                  </div>
                </div>
                {job?.aboutRole && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{job.aboutRole}</p>
                  </div>
                )}
                {job?.responsibilities && job.responsibilities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Requirements</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {job.responsibilities.map((r: string, i: number) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
                {job?.skills && job.skills.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((s: string, i: number) => (
                        <span key={i} className="bg-[#D4A574] dark:bg-[#2a2018] text-white px-3 py-1 rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {job?.remoteAvailable && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Remote work available</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  {job?.openings && <span className="flex items-center gap-1"><Users size={14} /> {job.openings} opening(s)</span>}
                  {job?.applicationDeadline && <span className="flex items-center gap-1"><Clock size={14} /> Apply by {job.applicationDeadline}</span>}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white dark:bg-[#171717] p-5 rounded-2xl border shadow-sm space-y-4">
                <h3 className="font-semibold font-serif">Completion Checklist</h3>
                <div className="space-y-3">
                  {checks.map((c) => (
                    <div key={c.label} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        {c.ok ? <CheckCircle className="text-green-600" size={16} /> : <X className="text-gray-400" size={16} />}
                        <span className={c.ok ? "text-gray-700" : "text-gray-500"}>{c.label}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.ok ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>{c.ok ? "Done" : "Pending"}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-[#F8F1EB] dark:bg-[#1a1a1a] p-3 text-sm text-[#6B3E2E] dark:text-[#c9a882]">Completion: {completionScore}%</div>
              </div>

              <div className="bg-[#FBEAE0] dark:bg-[#2a2018] rounded-2xl border-none p-4 shadow-sm">
                <div className="flex gap-3">
                  <div className="text-xl">💡</div>
                  <div><h3 className="font-medium text-sm">Almost there!</h3><p className="text-xs text-gray-600 mt-1">Review everything carefully before publishing. You can always edit later.</p></div>
                </div>
              </div>
            </div>
          </div>

          {statusMsg && (
            <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${statusType === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${statusType === "error" ? "bg-red-500" : "bg-green-500"}`} />
                <span>{statusMsg}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <Link href={`/jobposter/jobpost/compensation?jobId=${jobId}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#6B3E2E] dark:hover:text-[#c9a882] transition-colors"><ArrowLeft size={16} /> Back to Compensation</Link>
            <Button onClick={handlePublish} disabled={isSaving || isLoading || completionScore < 100} className="bg-green-700 hover:bg-green-800">
              {isSaving ? "Publishing..." : "Publish Job"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F4ECE6] dark:bg-[#171717]" />}><ReviewPageContent /></Suspense>;
}
