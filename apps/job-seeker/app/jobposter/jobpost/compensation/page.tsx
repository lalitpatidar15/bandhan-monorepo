"use client";

import { Suspense, useState, useEffect } from "react";
import { MapPin, Briefcase, Layers, DollarSign, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { CareersHeader } from "@/components/CareersHeader";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetJobByIdQuery, useUpdateJobMutation } from "../../redux/services/JobApi";
import Link from "next/link";

function CompensationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("jobId") ?? null;

  const { data: jobData, isLoading } = useGetJobByIdQuery(jobId ?? "", { skip: !jobId });
  const [updateJob, { isLoading: isSaving }] = useUpdateJobMutation();

  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobData?.data) return;
    const d = jobData.data;
    setMinSalary(d.salaryMin?.toString() ?? "");
    setMaxSalary(d.salaryMax?.toString() ?? "");
    setLocation(d.location ?? "");
    setRemote(d.remoteAvailable ?? false);
  }, [jobData]);

  const handleSave = async () => {
    if (!jobId) { setError("No job ID found. Please start from Job Details."); return; }
    try {
      await updateJob({
        jobId,
        body: {
          jobTitle: jobData?.data?.jobTitle || "",
          salaryMin: Number(minSalary) || 0,
          salaryMax: Number(maxSalary) || 0,
          location,
          remoteAvailable: remote,
        },
      }).unwrap();
      router.push(`/jobposter/jobpost/review?jobId=${jobId}`);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to save compensation details.");
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
            <Link href={`/jobposter/jobpost?jobId=${jobId}`} className="flex items-center gap-3 text-sm p-2 rounded-lg text-gray-500 hover:bg-white/50 transition-colors"><Briefcase size={18} /> Job Details</Link>
            <Link href={`/jobposter/jobpost?jobId=${jobId}`} className="flex items-center gap-3 text-sm p-2 rounded-lg text-gray-500 hover:bg-white/50 transition-colors"><Layers size={18} /> Requirements</Link>
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg text-[#6B3E2E] dark:text-[#c9a882] bg-white dark:bg-[#171717] shadow-sm font-semibold"><DollarSign size={18} /> Compensation</div>
            <Link href={`/jobposter/jobpost/review?jobId=${jobId}`} className="flex items-center gap-3 text-sm p-2 rounded-lg text-gray-500 hover:bg-white/50 transition-colors"><CheckCircle size={18} /> Review</Link>
          </div>
        </aside>

        <div className="flex-1 p-4 md:p-6 max-w-3xl">
          <div className="mb-6">
            <h1 className="text-xl font-semibold font-serif">Compensation & Location</h1>
            <p className="text-sm text-gray-500 mt-1">Set the salary range and work location for this position.</p>
          </div>

          <div className="bg-white dark:bg-[#171717] p-5 md:p-6 rounded-2xl border shadow-sm space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">MINIMUM SALARY</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input value={minSalary} onChange={(e) => setMinSalary(e.target.value)} placeholder="Minimum Salary" className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-3 text-sm focus:border-[#6B3E2E] dark:focus:border-[#c9a882] focus:ring-1 focus:ring-[#6B3E2E] dark:focus:ring-[#c9a882] outline-none" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">MAXIMUM SALARY</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} placeholder="Maximum Salary" className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-3 text-sm focus:border-[#6B3E2E] dark:focus:border-[#c9a882] focus:ring-1 focus:ring-[#6B3E2E] dark:focus:ring-[#c9a882] outline-none" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">LOCATION</p>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter Job Location" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-[#6B3E2E] dark:focus:border-[#c9a882] focus:ring-1 focus:ring-[#6B3E2E] dark:focus:ring-[#c9a882] outline-none" />
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#F8F1EB] dark:bg-[#1a1a1a] p-4 rounded-xl border border-[#ebdcd0] dark:border-[#374151]">
              <span className="text-sm font-medium">Remote work available?</span>
              <div onClick={() => setRemote(!remote)} className={`w-11 h-6 rounded-full cursor-pointer relative transition-colors duration-200 ${remote ? "bg-[#6B3E2E] dark:bg-[#b86a3a]" : "bg-gray-300"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${remote ? "left-6" : "left-1"}`} />
              </div>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

          <div className="flex items-center justify-between mt-6">
            <Link href={`/jobposter/jobpost?jobId=${jobId}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#6B3E2E] dark:hover:text-[#c9a882] transition-colors"><ArrowLeft size={16} /> Back to Details</Link>
            <div className="flex gap-3">
              <Button disabled={isSaving || isLoading} onClick={handleSave}>
                {isSaving ? "Saving..." : "Save & Continue"} <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompensationPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F4ECE6] dark:bg-[#171717]" />}><CompensationPageContent /></Suspense>;
}
