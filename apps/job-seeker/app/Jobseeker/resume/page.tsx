"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CareersHeader } from "@/components/CareersHeader";
import { Stepper } from "@/components/ui/Stepper";
import { FileUpload } from "@/components/ui/FileUpload";
import { Footer } from "@/components/ui/Footer";
import {
  useGetResumeQuery,
  useReplaceResumeMutation,
  useUploadResumeMutation,
} from "../redux/services/ProfileApi";

export default function ResumeUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumeRemoved, setResumeRemoved] = useState(false);
  const [uploadResume] = useUploadResumeMutation();
  const [replaceResume] = useReplaceResumeMutation();
  const { data: resumeData, isLoading: isResumeLoading } = useGetResumeQuery();
  const existingResume = !resumeRemoved && resumeData?.data?.resumeUrl
    ? {
        fileName: resumeData.data.fileName || "Current resume",
        resumeUrl: resumeData.data.resumeUrl,
      }
    : undefined;

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleContinue = async () => {
    if (!file) {
      if (existingResume) {
        router.push("/Jobseeker/dashboard");
        return;
      }
      return alert("Upload resume first");
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      if (existingResume) {
        await replaceResume(formData).unwrap();
      } else {
        await uploadResume(formData).unwrap();
      }
      router.push("/Jobseeker/dashboard");
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message || "Unable to upload resume. Please try again."
          : "Unable to upload resume. Please try again.";

      console.error("Resume upload failed", error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1EB] text-brown-950 flex flex-col">
      <CareersHeader stepLabel="Step 1 of 2" />

      <div className="border-b border-[#E8DED6] bg-[#F6F1EB]">
        <Stepper currentStep={2} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:py-16">
        <div className="w-full max-w-xl sm:max-w-2xl">
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-xl sm:text-2xl font-semibold text-brown-950 mb-3">Upload Your Resume</h1>
            <p className="text-sm sm:text-base text-brown-700/80">We&apos;ll use this to match you with relevant jobs</p>
          </div>

          <div className="space-y-6">
            {isResumeLoading ? (
              <div className="rounded-3xl border border-[#E8D8CC] bg-white p-8 text-center text-sm text-brown-700/80">
                Loading your resume...
              </div>
            ) : (
              <FileUpload
                onFileSelect={handleFileSelect}
                label={""}
                existingResume={existingResume}
                onExistingResumeDeleted={() => setResumeRemoved(true)}
              />
            )}

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full rounded-3xl bg-[#8B3E05] py-4 font-semibold text-white transition hover:bg-[#6B2E04] disabled:opacity-60"
            >
              {loading ? "Saving..." : file ? (existingResume ? "Update Resume" : "Upload & Continue") : "Continue"}
            </button>

            {/* Skip Button */}
            <button
              type="button"
              onClick={() => router.push("/Jobseeker/dashboard")}
              className="group w-full rounded-xl border border-[#D8C5B8] bg-white px-5 py-3 text-xs uppercase tracking-[0.32em] font-medium text-[#7A3E2B] shadow-sm transition-all duration-300 hover:bg-[#7A3E2B] hover:text-white hover:border-[#7A3E2B] hover:shadow-lg active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                Skip & Upload Later
              </span>
            </button>

            {/* Security Notice */}
            <div className="flex items-start gap-3 rounded-2xl bg-[#FFF4EE] p-5 text-sm text-brown-700/80">
              <span className="text-lg mt-0.5">🔒</span>
              <p className="leading-6">
                <span className="font-semibold text-brown-950">Your resume is secure and private.</span> We only use it to match you with relevant jobs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
