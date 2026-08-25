"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle,
  Layers,
  Users,
  Clock,
  X,
} from "lucide-react";
import { CareersHeader } from "@/components/CareersHeader";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCreateJobMutation, useGetJobByIdQuery, useUpdateJobMutation, useSaveDraftMutation, usePublishJobMutation } from "../redux/services/JobApi";
import { useGetCatalogOptionsQuery } from "../redux/services/RecruiterProfileApi";

function CreateJobPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState({
    title: "",
    category: "",
    type: "",
    level: "",
    minSalary: "",
    maxSalary: "",
    location: "",
    description: "",
    requirements: "",
    skills: [] as string[],
    remote: false,
    applicationDeadline: "",
    openings: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const { data: catalogOptions } = useGetCatalogOptionsQuery();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const isSaving = isCreating || isUpdating;
  const [saveDraftApi, { isLoading: isSavingDraft }] = useSaveDraftMutation();
  const [publishJob] = usePublishJobMutation();
  const isAnySaving = isSaving || isSavingDraft;
  const jobIdFromUrl = searchParams?.get("jobId") ?? null;
  const jobCategories = catalogOptions?.data?.jobCategories || [];
  const jobTypes = catalogOptions?.data?.jobTypes || [];
  const experienceLevels = catalogOptions?.data?.experienceLevels || [];

  useEffect(() => {
    if (jobIdFromUrl) {
      setJobId(jobIdFromUrl);
    }
  }, [jobIdFromUrl]);

  const { data: fetchedJobData, isLoading: isLoadingDraft } = useGetJobByIdQuery(jobId ?? "", {
    skip: !jobId,
  });

  useEffect(() => {
    if (!fetchedJobData?.data) return;

    const data = fetchedJobData.data;
    setJob((prev) => ({
      ...prev,
      title: data.jobTitle ?? prev.title,
      category: data.jobCategory ?? prev.category,
      type: data.jobType ?? prev.type,
      level: data.experienceLevel ?? prev.level,
      minSalary: data.salaryMin?.toString() ?? prev.minSalary,
      maxSalary: data.salaryMax?.toString() ?? prev.maxSalary,
      location: data.location ?? prev.location,
      description: data.aboutRole ?? prev.description,
      requirements: (data.responsibilities ?? []).join("\n") || prev.requirements,
      skills: data.skills ?? prev.skills,
      remote: data.remoteAvailable ?? prev.remote,
      applicationDeadline: data.applicationDeadline ?? prev.applicationDeadline,
      openings: data.openings?.toString() ?? prev.openings,
    }));
  }, [fetchedJobData]);

  const update = (key: string, value: any) =>
    setJob({ ...job, [key]: value });

  const addSkill = () => {
    const value = newSkill.trim();
    if (!value) return;
    if (job.skills.includes(value)) {
      setNewSkill("");
      return;
    }
    update("skills", [...job.skills, value]);
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    update("skills", job.skills.filter((item) => item !== skill));
  };

  const buildPayload = () => ({
    jobTitle: job.title || "Untitled Job",
    jobCategory: job.category,
    jobType: job.type,
    experienceLevel: job.level,
    salaryMin: Number(job.minSalary) || 0,
    salaryMax: Number(job.maxSalary) || 0,
    location: job.location,
    remoteAvailable: job.remote,
    aboutRole: job.description,
    responsibilities: job.requirements
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    skills: job.skills,
    applicationDeadline: job.applicationDeadline,
    openings: Number(job.openings) || 0,
  });

  const saveDraft = async () => {
    try {
      const payload = buildPayload();

      let idToSave = jobId;
      if (!idToSave) {
        const createResp = await createJob(payload).unwrap();
        idToSave = createResp.data?.jobId ?? null;
        if (idToSave) {
          setJobId(idToSave);
          router.replace(`/jobposter/jobpost?jobId=${idToSave}`);
        }
      }

      if (!idToSave) {
        setStatusType("error");
        setStatusMessage("Unable to determine job id to save draft.");
        return false;
      }

      const draftResp = await saveDraftApi({ jobId: idToSave }).unwrap();
      setStatusType("success");
      setStatusMessage(draftResp.message || "Draft saved successfully.");
      alert(draftResp.message || "Draft saved successfully.");
      return true;
    } catch (error: any) {
      setStatusType("error");
      setStatusMessage(error?.data?.message || "Unable to save draft right now.");
      alert(error?.data?.message || "Unable to save draft right now.");
      return false;
    }
  };

  const saveAndContinue = async () => {
    if (!job.title.trim() || !job.category || !job.type || !job.level) {
      const message = "Enter a job title and select the job category, job type, and experience level.";
      setStatusType("error");
      setStatusMessage(message);
      alert(message);
      return false;
    }

    try {
      const payload = buildPayload();
      if (jobId) {
        await updateJob({ jobId, body: payload }).unwrap();
        await publishJob({ jobId }).unwrap();
        setStatusType("success");
        setStatusMessage("Job saved. Redirecting to dashboard...");
        router.replace("/jobposter/dashboard");
        return true;
      }

      const createResp = await createJob(payload).unwrap();
      const newJobId = createResp.data?.jobId ?? null;
      if (newJobId) {
        setJobId(newJobId);
        await publishJob({ jobId: newJobId }).unwrap();
        setStatusType("success");
        setStatusMessage("Job created. Redirecting to dashboard...");
        router.replace("/jobposter/dashboard");
        return true;
      }

      setStatusType("error");
      setStatusMessage("Unable to create new job.");
      alert("Unable to create new job.");
      return false;
    } catch (error: any) {
      setStatusType("error");
      setStatusMessage(error?.data?.message || "Unable to save job right now.");
      alert(error?.data?.message || "Unable to save job right now.");
      return false;
    }
  };

  const completionScore = useMemo(() => {
    const checks = [
      job.title.length > 0,
      !!job.minSalary && !!job.maxSalary,
      job.description.length > 20,
      job.skills.length > 0,
      job.location.length > 0,
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [job]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F4ECE6] dark:bg-[#171717] text-[#3E2F2B] dark:text-[#ededed]">
      <CareersHeader variant="jobposter" activeTab="jobpost" />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">

        {/* SIDEBAR */}
        <aside className={`${isSidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-64 self-start bg-[#F8F1EB] dark:bg-[#1a1a1a] border-r p-6 space-y-6 transition-all lg:sticky lg:top-16`}>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Steps</p>
          <div className="space-y-4">
            <button onClick={() => scrollToSection("job-details")} className="w-full flex items-center gap-3 text-left text-sm p-2 rounded-lg text-[#6B3E2E] dark:text-[#c9a882] bg-white dark:bg-[#171717] shadow-sm font-semibold"><Briefcase size={18} /> Job Details</button>
            <button onClick={() => scrollToSection("requirements")} className="w-full flex items-center gap-3 text-left text-sm p-2 rounded-lg text-gray-500 hover:bg-white/50 transition-colors"><Layers size={18} /> Requirements</button>
            <button onClick={() => scrollToSection("compensation")} className="w-full flex items-center gap-3 text-left text-sm p-2 rounded-lg text-gray-500 hover:bg-white/50 transition-colors"><DollarSign size={18} /> Compensation</button>
            <button onClick={() => scrollToSection("review")} className="w-full flex items-center gap-3 text-left text-sm p-2 rounded-lg text-gray-500 hover:bg-white/50 transition-colors"><CheckCircle size={18} /> Review</button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 p-4 md:p-5 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">

          {/* LEFT COLUMN: FORM */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-xl font-semibold font-serif">Basic Info</h2>
              <p className="text-sm text-gray-500">
                Start with the core details of your job opening.
              </p>
            </div>

            <Card id="job-details" className="scroll-mt-24">
              <Label>JOB TITLE</Label>
              <Input
                value={job.title}
                placeholder="Software Engineer"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update("title", e.target.value)
                }
                className="placeholder:text-gray-400"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>JOB CATEGORY</Label>
                  <Select
                    value={job.category}
                    onChange={(e: any) => update("category", e.target.value)}
                    options={jobCategories}
                  />
                </div>
                <div>
                  <Label>JOB TYPE</Label>
                  <Select
                    value={job.type}
                    onChange={(e: any) => update("type", e.target.value)}
                    options={jobTypes}
                  />
                </div>
              </div>

              <Label>EXPERIENCE LEVEL</Label>
              <div className="flex flex-wrap gap-2">
                {experienceLevels.map((lvl: string) => (
                  <Tag key={lvl} active={job.level === lvl} onClick={() => update("level", lvl)}>
                    {lvl}
                  </Tag>
                ))}
              </div>
            </Card>

            <Card id="compensation" className="scroll-mt-24 p-4 rounded-2xl border border-[#E8DDD5] dark:border-[#374151] shadow-sm">

              {/* Heading */}
              <div className="mb-6 border-b border-[#E8DDD5] dark:border-[#374151] pb-3">
                <h3 className="text-xl font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">
                  Salary & Location
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Set the salary range and work location for this position.
                </p>
              </div>

              {/* Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] dark:text-[#7a7a7a] text-sm">
                    ₹
                  </span>

                  <Input
                    value={job.minSalary}
                    className="pl-8 text-[#2D201B] dark:text-[#ededed] placeholder:text-[#9A9A9A] dark:placeholder:text-[#7a7a7a]"
                    placeholder="Minimum Salary"
                    onChange={(e: any) =>
                      update("minSalary", e.target.value)
                    }
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] dark:text-[#7a7a7a] text-sm">
                    ₹
                  </span>

                  <Input
                    value={job.maxSalary}
                    className="pl-8 text-[#2D201B] dark:text-[#ededed] placeholder:text-[#9A9A9A] dark:placeholder:text-[#7a7a7a]"
                    placeholder="Maximum Salary"
                    onChange={(e: any) =>
                      update("maxSalary", e.target.value)
                    }
                  />
                </div>

              </div>

              {/* Location */}

              <div className="relative mt-5">

                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] dark:text-[#7a7a7a]"
                  size={18}
                />

                <Input
                  value={job.location}
                  className="pl-10 text-[#2D201B] dark:text-[#ededed] placeholder:text-[#9A9A9A] dark:placeholder:text-[#7a7a7a]"
                  placeholder="Enter Job Location"
                  onChange={(e: any) =>
                    update("location", e.target.value)
                  }
                />

              </div>

              {/* Remote */}

              <div className="mt-6 pt-5 border-t border-[#E8DDD5] dark:border-[#374151]">

                <Toggle
                  label="Remote work available?"
                  checked={job.remote}
                  onChange={() =>
                    update("remote", !job.remote)
                  }
                />

              </div>

            </Card>

            <Card id="requirements" className="scroll-mt-24 p-4 rounded-2xl border border-[#E8DDD5] dark:border-[#374151] shadow-sm">

              {/* Heading */}
              <div className="mb-6 border-b border-[#E8DDD5] dark:border-[#374151] pb-3">
                <h3 className="text-xl font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">
                  Job Description & Requirements
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Provide a clear job overview and list the required skills or qualifications.
                </p>
              </div>

              <div className="space-y-5">

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-bold text-[#2D201B] dark:text-[#ededed] mb-2">
                    Job Description
                  </label>

                  <textarea
                    rows={5}
                    value={job.description}
                    placeholder="Describe the role, key responsibilities, daily tasks, and what the candidate will work on..."
                    className="w-full rounded-xl border border-[#E8DDD5] dark:border-[#374151] p-4 text-sm text-[#2D201B] dark:text-[#ededed] placeholder:text-[#9A9A9A] dark:placeholder:text-[#7a7a7a] focus:ring-2 focus:ring-[#6B3E2E] dark:focus:ring-[#c9a882] focus:border-[#6B3E2E] dark:focus:border-[#c9a882] outline-none resize-none"
                    onChange={(e: any) =>
                      update("description", e.target.value)
                    }
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-bold text-[#2D201B] dark:text-[#ededed] mb-2">
                    Requirements
                  </label>

                  <textarea
                    rows={5}
                    placeholder="Example:
                    • Bachelor's degree in Computer Science
                    • 2+ years of experience
                    • Strong React & Node.js knowledge
                    • Excellent communication skills"
                    className="w-full rounded-xl border border-[#E8DDD5] dark:border-[#374151] p-4 text-sm text-[#2D201B] dark:text-[#ededed] placeholder:text-[#9A9A9A] dark:placeholder:text-[#7a7a7a] focus:ring-2 focus:ring-[#6B3E2E] dark:focus:ring-[#c9a882] focus:border-[#6B3E2E] dark:focus:border-[#c9a882] outline-none resize-none"
                    value={job.requirements}
                    onChange={(e: any) =>
                      update("requirements", e.target.value)
                    }
                  />
                </div>

              </div>

            </Card>

            <Card id="review" className="scroll-mt-24">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">Skills & Tags</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Add the top skills and tags that describe this role.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="flex items-center gap-2 bg-[#D4A574] dark:bg-[#2a2018] text-white px-3 py-1.5 rounded-full text-xs md:text-sm hover:bg-[#bc8858] dark:hover:bg-[#a05a30] transition-colors"
                  >
                    {s}
                    <X size={14} />
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Add a skill or tag"
                  className="flex-1 border border-[#E8DDD5] dark:border-[#374151] rounded-xl px-4 py-3 text-sm text-[#2D201B] dark:text-[#ededed] focus:border-[#6B3E2E] dark:focus:border-[#c9a882] focus:ring-1 focus:ring-[#6B3E2E] dark:focus:ring-[#c9a882] outline-none"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="inline-flex items-center justify-center rounded-xl bg-[#6B3E2E] dark:bg-[#b86a3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#563225] dark:hover:bg-[#a05a30] transition-colors"
                >
                  + Add Skill
                </button>
              </div>
            </Card>

            <Card>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">Application Settings</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Set the deadline and number of openings for this job post.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>APPLICATION DEADLINE</Label>
                  <Input
                    type="date"
                    value={job.applicationDeadline}
                    onChange={(e: any) => update("applicationDeadline", e.target.value)}
                    className="text-[#2D201B] dark:text-[#ededed]"
                  />
                </div>

                <div>
                  <Label>NUMBER OF OPENINGS</Label>
                  <Input
                    type="number"
                    min={1}
                    value={job.openings}
                    onChange={(e: any) => update("openings", e.target.value)}
                    placeholder="2"
                    className="text-[#2D201B] dark:text-[#ededed]"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: PREVIEW & CHECKLIST */}
          <div className="space-y-6">
            <Card className=" top-5">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live Preview</p>
              <div className="mt-2">
                <h3 className="font-semibold text-lg leading-tight">{job.title || "Untitled Position"}</h3>
                <p className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <MapPin size={12} /> {job.location} • ₹{job.minSalary} - ₹{job.maxSalary}
                </p>
                <p className="text-sm mt-3 text-gray-600 line-clamp-3">{job.description}</p>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">Completion Checklist</h3>
              <p className="text-sm text-gray-500 mt-1">
                Complete these items to make your job post ready to publish.
              </p>

              <div className="space-y-3 mt-4">
                <Check label="Job title" ok={job.title.length > 0} />
                <Check label="Salary range" ok={!!job.minSalary && !!job.maxSalary} />
                <Check label="Description" ok={job.description.length > 20} />
                <Check label="Skills & tags" ok={job.skills.length > 0} />
                <Check label="Location" ok={job.location.length > 0} />
              </div>
              <div className="mt-4 rounded-xl bg-[#F8F1EB] dark:bg-[#1a1a1a] p-3 text-sm text-[#6B3E2E] dark:text-[#c9a882]">
                Completion: {completionScore}%
              </div>
            </Card>

            <Card className="bg-[#FBEAE0] dark:bg-[#2a2018] border-none shadow-sm">
              <div className="flex gap-3">
                <div className="text-xl">💡</div>
                <div>
                  <h3 className="font-medium text-sm">Pro Tip</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Listings with salary ranges get 40% more applicants on average.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* PAGE ACTION BAR */}
      <div className="bg-white dark:bg-[#171717] border-t p-4 md:p-4 flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
        <div className="order-2 md:order-1 w-full md:w-auto">
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${statusType === "error"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-green-200 bg-green-50 text-green-700"
            }`}>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${statusType === "error" ? "bg-red-500" : "bg-green-500"}`} />
              <span>
                {statusMessage || (isLoadingDraft ? "Loading saved draft..." : "Draft will be saved when you click Save Draft")}
              </span>
            </div>
            {jobId && <div className="mt-1 text-xs opacity-80">Draft ID: {jobId}</div>}
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto order-1 md:order-2">
          <button
            type="button"
            onClick={saveDraft}
            disabled={isAnySaving}
            className="flex-1 md:flex-none px-4 py-2 bg-[#F4ECE6] dark:bg-[#171717] rounded-lg text-sm font-medium hover:bg-[#ebdcd0] dark:hover:bg-[#2a2a2a] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isAnySaving ? "Saving..." : "Save Draft"}
          </button>
          <Button
            onClick={saveAndContinue}
            className="flex-1 md:flex-none px-5 py-3 bg-[#6B3E2E] dark:bg-[#b86a3a] text-white rounded-lg text-sm font-medium hover:bg-[#5A3425] dark:hover:bg-[#a05a30] transition-colors"
          >
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

/* UI COMPONENTS (Kept consistent with your style) */

function Card({ children, className = "" }: any) {
  return <div className={`bg-white dark:bg-[#171717] p-5 md:p-4 rounded-2xl border shadow-sm space-y-4 ${className}`}>{children}</div>;
}

function Input({ className = "", ...props }: any) {
  return <input {...props} className={`w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-[#6B3E2E] dark:focus:border-[#c9a882] focus:ring-1 focus:ring-[#6B3E2E] dark:focus:ring-[#c9a882] outline-none transition-all ${className}`} />;
}

function Select({ options, ...props }: any) {
  return (
    <select {...props} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-[#6B3E2E] dark:focus:border-[#c9a882] outline-none bg-white dark:bg-[#171717]">
      <option value="">Select an option</option>
      {(options || []).map((option: string) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function Label({ children }: any) {
  return <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{children}</p>;
}

function Tag({ children, active, ...props }: any) {
  return (
    <span {...props}
      className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-all ${active ? "bg-[#6B3E2E] dark:bg-[#b86a3a] text-white shadow-md" : "bg-[#F4ECE6] dark:bg-[#171717] text-[#3E2F2B] dark:text-[#ededed] hover:bg-[#ebdcd0] dark:hover:bg-[#2a2a2a]"
        }`}>
      {children}
    </span>
  );
}

function Toggle({ label, checked, onChange }: any) {
  return (
    <div className="flex justify-between items-center bg-[#F8F1EB] dark:bg-[#1a1a1a] p-4 rounded-xl border border-[#ebdcd0] dark:border-[#374151]">
      <span className="text-sm font-medium">{label}</span>
      <div
        onClick={onChange}
        className={`w-11 h-6 rounded-full cursor-pointer relative transition-colors duration-200 ${checked ? "bg-[#6B3E2E] dark:bg-[#b86a3a]" : "bg-gray-300"
          }`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${checked ? "left-6" : "left-1"}`} />
      </div>
    </div>
  );
}

function Check({ label, ok }: any) {
  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle className="text-green-600" size={16} />
        ) : (
          <X className="text-gray-400" size={16} />
        )}
        <span className={ok ? "text-gray-700" : "text-gray-500"}>{label}</span>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ok ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
        {ok ? "Done" : "Pending"}
      </span>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4ECE6] dark:bg-[#171717] text-[#3E2F2B] dark:text-[#ededed]" />}>
      <CreateJobPageContent />
    </Suspense>
  );
}
