"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { CareersHeader } from "@/components/CareersHeader";
import { useGetJobDetailsQuery, useGetJobSeekerApplicationsQuery } from "../../redux/services/JobsApi";

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-[#F5E8E0] text-[#9B7B6F]",
  REVIEWED: "bg-[#F5E8E0] text-[#9B7B6F]",
  SHORTLISTED: "bg-[#E6F4EA] text-[#2E7D32]",
  OFFER: "bg-[#EAF2FF] text-[#3562A8]",
  HIRED: "bg-[#E6F4EA] text-[#2E7D32]",
  REJECTED: "bg-[#FFE5E5] text-[#D96969]",
};

export default function ApplicationDetailsPage() {
  const params = useParams<{ applicationId: string }>();
  const applicationId = params?.applicationId || "";

  const { data: applicationsResponse, isLoading: applicationsLoading, isFetching } = useGetJobSeekerApplicationsQuery({
    page: 1,
    limit: 100,
  });

  const application = useMemo(() => {
    const items = applicationsResponse?.data ?? [];
    return items.find((item) => (item.applicationId || item.id || item._id) === applicationId);
  }, [applicationId, applicationsResponse]);

  const jobId = application?.jobId || "";
  const { data: jobDetailsResponse, isLoading: jobLoading } = useGetJobDetailsQuery(jobId, {
    skip: !jobId,
  });

  const timeline = [
    { label: "Applied", done: Boolean((application?.timeline as { applied?: boolean } | undefined)?.applied) },
    { label: "Reviewed", done: Boolean((application?.timeline as { reviewed?: boolean } | undefined)?.reviewed) },
    { label: "Interview", done: Boolean((application?.timeline as { interview?: boolean } | undefined)?.interview) },
    { label: "Offer", done: Boolean((application?.timeline as { offer?: boolean } | undefined)?.offer) },
  ];

  const jobData = jobDetailsResponse?.data;
  const loading = applicationsLoading || isFetching || jobLoading;
  const status = application?.status?.toUpperCase() || "SUBMITTED";

  return (
    <div className="min-h-screen bg-[#FBF4ED] text-[#3D2B1F] flex flex-col">
      <CareersHeader variant="jobs" activeTab="Applications" />

      <div className="flex flex-1">
        <main className="flex-1 w-full px-4 py-5 sm:px-6 md:px-5 lg:px-10 xl:px-12 space-y-6">

          <div>
            <p className="text-xs text-[#A48871] uppercase tracking-widest font-semibold mb-2">
              Home • Applications • Details
            </p>
            <h1 className="text-2xl sm:text-xl font-semibold text-[#3D2B1F] mb-1">Application Details</h1>
            <p className="text-sm text-[#7E5F49]">Review the job, company, and current application progress.</p>
          </div>

          {loading ? (
            <div className="bg-white p-5 rounded-3xl border border-[#E8D1C2] text-center text-sm text-[#7E5F49]">
              Loading application details...
            </div>
          ) : !application ? (
            <div className="bg-white p-5 rounded-3xl border border-[#E8D1C2] text-center text-sm text-[#7E5F49]">
              This application could not be found.
            </div>
          ) : (
            <>
              <section className="bg-white border border-[#E8D1C2] rounded-3xl p-5 sm:p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#3D2B1F]">
                      {application.jobTitle || jobData?.jobTitle || "Untitled role"}
                    </h2>
                    <p className="text-sm text-[#7E5F49] mt-1">
                      {application.companyName || jobData?.company?.companyName || "Unknown Company"} • {application.location || jobData?.location || "Remote"}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[status] || statusColors.SUBMITTED}`}>
                    {status}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-[#FFF2E9] p-4">
                    <p className="text-[10px] text-[#A48871] font-semibold uppercase tracking-widest mb-1">Applied On</p>
                    <p className="text-sm font-semibold text-[#3D2B1F]">{application.appliedDate || application.createdAt || "N/A"}</p>
                  </div>
                  <div className="rounded-2xl bg-[#FFF2E9] p-4">
                    <p className="text-[10px] text-[#A48871] font-semibold uppercase tracking-widest mb-1">Job Type</p>
                    <p className="text-sm font-semibold text-[#3D2B1F]">{application.jobType || jobData?.jobType || "Not specified"}</p>
                  </div>
                  <div className="rounded-2xl bg-[#FFF2E9] p-4">
                    <p className="text-[10px] text-[#A48871] font-semibold uppercase tracking-widest mb-1">Salary</p>
                    <p className="text-sm font-semibold text-[#3D2B1F]">
                      {typeof jobData?.salaryMin === "number"
                        ? `₹${jobData.salaryMin.toLocaleString()}${typeof jobData.salaryMax === "number" ? ` - ₹${jobData.salaryMax.toLocaleString()}` : ""}`
                        : "Salary not disclosed"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#FFF2E9] p-4">
                    <p className="text-[10px] text-[#A48871] font-semibold uppercase tracking-widest mb-1">Deadline</p>
                    <p className="text-sm font-semibold text-[#3D2B1F]">{jobData?.applicationDeadline || "Open until filled"}</p>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-[#E8D1C2] rounded-3xl p-5 sm:p-4 space-y-4">
                <h3 className="text-lg font-semibold text-[#3D2B1F]">Application Progress</h3>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {timeline.map((step, idx) => (
                    <div key={step.label} className="flex items-center flex-1 min-w-fit">
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? "bg-[#C97755] text-white" : "bg-[#E0B08A] text-[#8B6F5E]"}`}>
                        {step.done ? "✓" : idx + 1}
                      </div>
                      <div className="ml-2 mr-3 text-sm font-medium text-[#3D2B1F]">{step.label}</div>
                      {idx < timeline.length - 1 ? <div className={`flex-1 h-0.5 ${step.done ? "bg-[#C97755]" : "bg-[#E0B08A]"}`} /> : null}
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white border border-[#E8D1C2] rounded-3xl p-5 sm:p-4 space-y-4">
                <h3 className="text-lg font-semibold text-[#3D2B1F]">Role Summary</h3>
                <p className="text-sm leading-7 text-[#7E5F49]">
                  {jobData?.aboutRole || "Full job details are not available yet for this application."}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href={jobId ? `/Jobseeker/job-detail?jobId=${encodeURIComponent(jobId)}` : "/Jobseeker/jobs"} className="text-sm font-semibold text-[#C97755] hover:text-[#A05F45] transition-colors">
                    View Job Posting →
                  </Link>
                  <Link href="/Jobseeker/applications" className="text-sm font-semibold text-[#7E5F49] hover:text-[#3D2B1F] transition-colors">
                    Back to Applications
                  </Link>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}