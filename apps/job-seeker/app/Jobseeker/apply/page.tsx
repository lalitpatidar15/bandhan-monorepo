"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CareersHeader } from "@/components/CareersHeader";
import { Footer } from "../../../components/ui/Footer";
import { Card } from "../../../components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Info, Clock, Users } from "lucide-react";
import {
  useGetApplyPageQuery,
  useGetDraftQuery,
  useReplaceResumeMutation,
  useSaveDraftMutation,
  useSubmitApplicationMutation,
} from "@/app/Jobseeker/redux/services/JobsApi";

const formatSalary = (min?: number, max?: number, currency = "₹") => {
  if (typeof min === "number" && typeof max === "number") {
    return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
  }
  if (typeof min === "number") {
    return `${currency}${min.toLocaleString()}`;
  }
  return "Salary not disclosed";
};

const getResumeDisplayName = (resumeUrl?: string, fallback = "Current resume") => {
  if (!resumeUrl) {
    return fallback;
  }

  try {
    const parsedUrl = new URL(resumeUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    const fileName = parsedUrl.pathname.split("/").filter(Boolean).pop();
    return fileName ? decodeURIComponent(fileName) : fallback;
  } catch {
    const fallbackName = resumeUrl.split("/").filter(Boolean).pop();
    return fallbackName ? decodeURIComponent(fallbackName) : fallback;
  }
};

const getErrorMessage = (errorResponse: unknown, fallback: string) => {
  if (errorResponse && typeof errorResponse === "object" && "data" in errorResponse) {
    const response = errorResponse as { data?: { message?: string } };
    if (response.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
};

const showFeedback = (setFeedbackMessage: (message: string | null) => void, message: string) => {
  setFeedbackMessage(message);

  if (typeof window !== "undefined") {
    window.alert(message);
  }
};

function ApplyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("jobId") || "";
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading, isError, error } = useGetApplyPageQuery(jobId, {
    skip: !jobId,
  });
  const { data: draftData } = useGetDraftQuery(jobId, {
    skip: !jobId,
  });
  const [replaceResume, { isLoading: isReplacingResume }] = useReplaceResumeMutation();
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation();
  const [submitApplication, { isLoading: isSubmitting }] = useSubmitApplicationMutation();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeName, setResumeName] = useState("Current resume");
  const [cover, setCover] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [salaryType, setSalaryType] = useState("Fixed");
  const [question, setQuestion] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [applicationState, setApplicationState] = useState<"idle" | "draft-saved" | "submitted">("idle");

  const applyData = data?.data;

  useEffect(() => {
    const currentResumeUrl = applyData?.resume?.resumeUrl || "";
    const currentResumeName = applyData?.resume?.resumeName || getResumeDisplayName(currentResumeUrl);

    if (currentResumeUrl || currentResumeName) {
      queueMicrotask(() => {
        setResumeUrl(currentResumeUrl);
        setResumeName(currentResumeName);
      });
    }
  }, [applyData?.resume?.resumeUrl, applyData?.resume?.resumeName]);

  useEffect(() => {
    const draft = draftData?.data;

    if (!draft) {
      return;
    }

    queueMicrotask(() => {
      setCover(draft.coverLetter || "");
      setExpectedSalary(
        typeof draft.expectedSalary === "number"
          ? String(draft.expectedSalary)
          : draft.expectedSalary
            ? String(draft.expectedSalary)
            : ""
      );
      setSalaryType(draft.salaryType || "Fixed");
      setQuestion(draft.additionalAnswer || "");

      if (draft.resume) {
        setResumeUrl(draft.resume);
        setResumeName(getResumeDisplayName(draft.resume));
      }

      const isSubmitted = draft.status === "submitted" || draft.status === "completed" || draft.status === "applied";
      setApplicationState(isSubmitted ? "submitted" : "draft-saved");
    });
  }, [draftData?.data]);

  const openResumePicker = () => {
    fileInputRef.current?.click();
  };

  const handleResumeSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setResumeFile(file);
    setFeedbackMessage("Uploading resume...");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const result = await replaceResume(formData).unwrap();
      const uploadedResumeUrl = result?.data?.resume || "";
      setResumeUrl(uploadedResumeUrl);
      setResumeName(getResumeDisplayName(uploadedResumeUrl));
      setFeedbackMessage(result?.message || "Resume uploaded successfully.");
    } catch (errorResponse: unknown) {
      setFeedbackMessage(getErrorMessage(errorResponse, "Unable to upload resume."));
    } finally {
      setResumeFile(null);
      event.target.value = "";
    }
  };

  const handleSaveDraft = async () => {
    if (!jobId) {
      showFeedback(setFeedbackMessage, "Please open this page from a job listing.");
      return;
    }

    if (!resumeUrl) {
      showFeedback(setFeedbackMessage, "Please upload a resume before saving your draft.");
      return;
    }

    if (applicationState === "submitted") {
      const message = "This application has already been submitted and cannot be saved again.";
      showFeedback(setFeedbackMessage, message);
      return;
    }

    if (applicationState === "draft-saved") {
      const message = "A draft for this application already exists. Please submit it instead of saving again.";
      showFeedback(setFeedbackMessage, message);
      return;
    }

    const attemptSave = async (attempts = 3) => {
      let lastError: unknown = null;
      for (let i = 1; i <= attempts; i++) {
        try {
          const payload: any = {
            coverLetter: cover,
            salaryType,
            additionalAnswer: question,
            resume: resumeUrl,
          };

          if (expectedSalary) payload.expectedSalary = Number(expectedSalary);

          const result = await saveDraft({ jobId, payload }).unwrap();
          return result;
        } catch (err: any) {
          lastError = err;
          const status = err?.status ?? err?.originalStatus ?? err?.data?.status ?? null;

          // If service unavailable, wait and retry (exponential backoff)
          if ((status === 503 || status === 502 || status === 504) && i < attempts) {
            const delay = 500 * i; // 500ms, 1s, 1.5s
            console.warn(`saveDraft attempt ${i} failed with status ${status}, retrying after ${delay}ms`);
            // eslint-disable-next-line no-await-in-loop
            await new Promise((res) => setTimeout(res, delay));
            continue;
          }

          // Non-retryable or last attempt: rethrow
          throw err;
        }
      }

      throw lastError;
    };

    try {
      showFeedback(setFeedbackMessage, "Saving draft...");
      const result = await attemptSave(3);
      setApplicationState("draft-saved");
      showFeedback(setFeedbackMessage, result?.message || "Draft saved successfully.");
    } catch (errorResponse: unknown) {
      console.error("saveDraft error after retries:", errorResponse);

      // Provide a clearer message for service availability issues
      const status = (errorResponse as any)?.status ?? (errorResponse as any)?.originalStatus ?? null;
      if (status === 503) {
        showFeedback(setFeedbackMessage, "Service is temporarily unavailable. Please try again in a few minutes.");
      } else {
        showFeedback(setFeedbackMessage, getErrorMessage(errorResponse, "Unable to save draft."));
      }
    }
  };

  const handleSubmit = async () => {
    if (!jobId) {
      showFeedback(setFeedbackMessage, "Please open this page from a job listing.");
      return;
    }

    if (!resumeUrl) {
      showFeedback(setFeedbackMessage, "Please upload a resume before submitting your application.");
      return;
    }

    if (applicationState === "submitted") {
      const message = "This application has already been submitted.";
      showFeedback(setFeedbackMessage, message);
      return;
    }

    try {
      const payload: any = {
        coverLetter: cover,
        salaryType,
        additionalAnswer: question,
        resume: resumeUrl,
      };

      if (expectedSalary) payload.expectedSalary = Number(expectedSalary);

      const result = await submitApplication({ jobId, payload }).unwrap();

      setApplicationState("submitted");
      const applicationId = result?.data?.applicationId;
      showFeedback(setFeedbackMessage, result?.message || "Application submitted successfully.");
      router.replace(applicationId ? `/Jobseeker/applications/${applicationId}` : "/Jobseeker/applications");
    } catch (errorResponse: unknown) {
      console.error("submitApplication error:", errorResponse);
      showFeedback(
        setFeedbackMessage,
        getErrorMessage(errorResponse, "Unable to submit application.")
      );
    }
  };

  const salaryText = useMemo(
    () => formatSalary(applyData?.salaryMin, applyData?.salaryMax, applyData?.salaryCurrency || "₹"),
    [applyData]
  );

  const titleText = applyData?.jobTitle || "Apply for this role";
  const companyText = applyData?.company?.companyName || "Company";
  const companyDescription = applyData?.company?.description || "This team is looking for a strong fit for the role.";
  const locationText = applyData?.location || "Remote";
  const employmentText = applyData?.jobType || "Full-time";
  const experienceText = applyData?.experienceLevel || "Not specified";
  const postedOnText = applyData?.postedOn ? new Date(applyData.postedOn).toLocaleDateString() : "Recently posted";
  const applicantsText = applyData?.totalApplicants ?? 0;
  const errorMessage = isError
    ? (error as { data?: { message?: string } } | undefined)?.data?.message || "Unable to load application details."
    : undefined;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FEF3EB] text-[#3E2C23]">
      <CareersHeader variant="jobs" activeTab="Jobs" />
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 md:px-6 md:py-6 lg:px-5 lg:py-8 xl:px-5 2xl:px-6">
        <main className="grid w-full grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#9C7C6B] sm:text-xs">
                Jobs &gt; {titleText} &gt; Apply
              </p>
              <h1 className="break-words text-2xl font-semibold tracking-[-0.03em] sm:text-xl lg:text-2xl">
                {titleText}
              </h1>
              <p className="max-w-2xl break-words text-sm text-[#7A5C4D]">
                Apply to {companyText} for this position.
              </p>
            </div>

            {feedbackMessage ? (
              <div className="w-full overflow-hidden rounded-2xl border border-[#E8D4C2] bg-[#FFF7EE] px-4 py-3 text-sm text-[#6E4A34] break-words">
                {feedbackMessage}
              </div>
            ) : null}

            {isLoading ? (
              <div className="w-full overflow-hidden rounded-3xl border border-[#E8D4C2] bg-white p-4 text-center text-sm text-[#7A5C4D] shadow-sm sm:p-4">
                Loading application details...
              </div>
            ) : isError ? (
              <div className="w-full overflow-hidden rounded-3xl border border-[#E8D4C2] bg-white p-4 text-center text-sm text-[#7A5C4D] shadow-sm sm:p-4">
                {errorMessage}
              </div>
            ) : !jobId ? (
              <div className="w-full overflow-hidden rounded-3xl border border-[#E8D4C2] bg-white p-4 text-center text-sm text-[#7A5C4D] shadow-sm sm:p-4">
                Missing job identifier. Please open this page from the job details screen.
              </div>
            ) : null}

            <Card className="w-full overflow-hidden rounded-3xl border border-[#E8D4C2] bg-white p-4 shadow-sm sm:p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#9C7C6B]">COVER LETTER</p>
                  <p className="mt-2 break-words text-sm text-[#7A5C4D]">Personalized proposals get more responses</p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-[#FFF5EB] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#7A5C4D]">
                  Optional
                </span>
              </div>

              <textarea
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="Explain why you're a good fit..."
                className="mt-4 min-h-[180px] w-full resize-y overflow-hidden rounded-3xl border border-[#EAD5C9] bg-[#FCF6F0] p-3 text-sm text-[#3E2C23] outline-none transition focus:border-[#D6B6A4] focus:ring-2 focus:ring-[#EDD8CA] sm:min-h-[200px] sm:p-5 md:p-5"
              />

              <div className="mt-3 flex justify-end text-xs text-[#9C7C6B]">{cover.length} / 2500</div>
            </Card>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-6">
              <Card className="w-full overflow-hidden rounded-3xl border border-[#E8D4C2] bg-white p-4 shadow-sm sm:p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[#9C7C6B]">EXPECTED SALARY</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    type="number"
                    placeholder="0"
                    className="w-full min-w-0 flex-1 rounded-3xl border border-[#EAD5C9] bg-[#FCF3EE] p-3 text-sm text-[#3E2C23] outline-none"
                  />
                  <select
                    value={salaryType}
                    onChange={(e) => setSalaryType(e.target.value)}
                    className="w-full rounded-3xl border border-[#EAD5C9] bg-white px-5 py-3 text-sm font-semibold text-[#3E2C23] shadow-sm outline-none sm:w-auto"
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Negotiable">Negotiable</option>
                  </select>
                </div>
                <p className="mt-3 text-xs text-[#9C7C6B]">Set a realistic expectation</p>
              </Card>

              <Card className="w-full overflow-hidden rounded-3xl border border-[#E8D4C2] bg-white p-4 shadow-sm sm:p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[#9C7C6B]">RESUME</p>

                {resumeFile ? (
                  <div className="mt-4 flex flex-col gap-3 rounded-3xl bg-[#FCF3EE] p-4 text-sm text-[#3E2C23] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#7A5C4D]">
                        <FileText size={18} />
                      </span>
                      <div className="min-w-0 break-words">{resumeFile.name}</div>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9C7C6B]">
                      Uploading...
                    </span>
                  </div>
                ) : resumeUrl ? (
                  <div className="mt-4 rounded-3xl bg-[#FCF3EE] p-4 text-sm text-[#3E2C23]">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">Current resume available</p>
                        <p className="mt-1 break-words text-[#7A5C4D]">{resumeName}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-3 rounded-3xl bg-[#FCF3EE] p-4 text-sm text-[#3E2C23]">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#7A5C4D]">
                      <FileText size={18} />
                    </span>
                    <span className="min-w-0 break-words">No resume uploaded</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handleResumeSelection}
                />

                <button
                  type="button"
                  onClick={openResumePicker}
                  disabled={isReplacingResume}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[#EAD5C9] bg-[#FFF4EC] px-3 py-3 text-sm font-semibold text-[#7A5C4D] transition hover:bg-[#F9E9DA] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-4"
                >
                  <Upload size={18} className="shrink-0" />
                  <span className="min-w-0 break-words text-center">{resumeUrl ? "Replace resume" : "Upload different resume"}</span>
                </button>
              </Card>
            </div>

            <Card className="w-full overflow-hidden rounded-3xl border border-[#E8D4C2] bg-white p-4 shadow-sm sm:p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[#9C7C6B]">ADDITIONAL QUESTIONS</p>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Tell us about your experience with design systems"
                className="mt-4 min-h-[140px] w-full resize-y overflow-hidden rounded-3xl border border-[#EAD5C9] bg-[#FCF3EE] p-4 text-sm text-[#3E2C23] outline-none transition focus:border-[#D6B6A4] focus:ring-2 focus:ring-[#EDD8CA] sm:min-h-[160px] sm:p-5"
              />
            </Card>
          </div>

          <aside className="order-first min-w-0 space-y-4 sm:order-none sm:space-y-6 lg:order-none">
            <Card className="w-full overflow-hidden rounded-3xl border border-[#E8D4C2] bg-[#FFF1E8] p-4 shadow-sm sm:p-4 lg:sticky lg:top-4">
              <div className="space-y-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#9C7C6B]">{titleText}</p>
                  <h2 className="mt-2 break-words text-2xl font-semibold text-[#3E2C23]">{companyText}</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#3E2C23]">
                    {applyData?.remoteAvailable ? "Remote" : "On-site"}
                  </span>
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#3E2C23]">
                    {employmentText}
                  </span>
                </div>

                <div className="grid gap-3 border-t border-[#E8D4C2] pt-5 text-sm text-[#5E463B]">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <span className="font-medium">Salary Range</span>
                    <span className="min-w-0 break-words text-right font-semibold text-[#3E2C23]">{salaryText}</span>
                  </div>
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <span className="font-medium">Experience</span>
                    <span className="min-w-0 break-words text-right font-semibold text-[#3E2C23]">{experienceText}</span>
                  </div>
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <span className="font-medium">Location</span>
                    <span className="min-w-0 break-words text-right font-semibold text-[#3E2C23]">{locationText}</span>
                  </div>
                </div>

                <div className="grid gap-3 border-t border-[#E8D4C2] pt-5 text-sm text-[#5E463B]">
                  <div className="flex min-w-0 items-center gap-2">
                    <Users size={16} className="shrink-0 text-[#7A5C4D]" />
                    <span className="min-w-0 break-words font-semibold">{applicantsText} APPLICANTS</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <Clock size={16} className="shrink-0 text-[#7A5C4D]" />
                    <span className="min-w-0 break-words">POSTED {postedOnText}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="w-full overflow-hidden rounded-3xl border border-[#E8D4C2] bg-white p-4 shadow-sm sm:p-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#FFF4EC] text-[#7A5C4D]">
                  <FileText size={18} />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[#3E2C23]">About the Company</p>
                  <p className="mt-2 break-words text-sm leading-6 text-[#7A5C4D]">
                    {companyDescription}
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </main>

        <div className="mt-4 w-full overflow-hidden rounded-3xl border border-[#E8D4C2] bg-white p-4 shadow-sm sm:mt-4 sm:p-4 md:p-4 lg:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3 text-sm text-[#7A5C4D]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#FFF0DE] text-[#7A5C4D]">
                <Info size={18} />
              </span>
              <span className="min-w-0 break-words">Ready to submit your application?</span>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button variant="secondary" className="w-full sm:w-auto" onClick={handleSaveDraft} disabled={isSavingDraft || applicationState === "submitted"}>
                {isSavingDraft ? "Saving..." : "Save Draft"}
              </Button>
              <Button variant="primary" className="w-full sm:w-auto" onClick={handleSubmit} disabled={isSubmitting || applicationState === "submitted"}>
                {isSubmitting ? "Submitting..." : "SUBMIT APPLICATION"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FEF3EB] text-[#3E2C23]" />}>
      <ApplyPageContent />
    </Suspense>
  );
}
