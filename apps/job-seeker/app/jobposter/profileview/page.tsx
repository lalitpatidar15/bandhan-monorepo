"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CareersHeader } from "@/components/CareersHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/Footer";
import {
  User,
  FileText,
  Clock,
  MessageSquare,
  Download,
  ChevronDown,
} from "lucide-react";
import { useGetCandidateProfileQuery, useSaveInternalNoteMutation, useLazyDownloadResumeQuery, useUpdateApplicationStatusMutation } from "../redux/services/JobApi";

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function ApplicantDetailPage() {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setApplicationId(params.get("applicationId") ?? "");
    }
  }, []);

  const [activeTab, setActiveTab] = useState<"Overview" | "Resume" | "Timeline" | "Evaluations">("Resume");
  const [status, setStatus] = useState("Shortlisted");
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");

  const { data, isLoading, isError } = useGetCandidateProfileQuery(applicationId, {
    skip: !applicationId,
  });

  const profile = data?.data?.candidate;
  const job = data?.data?.job;
  const app = data?.data;

  useEffect(() => {
    if (app?.status) {
      setStatus(app.status);
    }
  }, [app?.status]);

  useEffect(() => {
    if (app?.internalNote) {
      setNotes([`"${app.internalNote}"`]);
    }
  }, [app?.internalNote]);

  const [saveInternalNote, { isLoading: isSaving }] = useSaveInternalNoteMutation();
  const [downloadResumeTrigger, { isLoading: isDownloading }] = useLazyDownloadResumeQuery();
  const [updateApplicationStatus, { isLoading: isStatusLoading }] = useUpdateApplicationStatusMutation();

  const handleUpdateStatus = async (newStatus: string) => {
    if (!applicationId) {
      alert("No applicationId provided");
      return;
    }

    setStatus(newStatus);

    try {
      await updateApplicationStatus({ applicationId, status: newStatus }).unwrap();
      alert(`Status updated to ${newStatus}`);
    } catch (error: any) {
      setStatus(app?.status ?? "Shortlisted");
      alert(error?.data?.message || error?.message || "Unable to update status.");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    if (!applicationId) {
      alert("No applicationId provided");
      return;
    }

    try {
      await saveInternalNote({ applicationId, internalNote: newNote }).unwrap();
      setNotes([...notes, `"${newNote}" — Recruiter, Just Now`]);
      setNewNote("");
    } catch (error: any) {
      alert(error?.data?.message || error?.message || "Unable to save note");
    }
  };

  const handleDownloadResume = async () => {
    if (!applicationId) {
      alert("No applicationId provided");
      return;
    }

    try {
      const res = await downloadResumeTrigger(applicationId).unwrap();
      const url = res?.data?.resumeUrl;
      if (url) {
        window.open(url, "_blank");
      } else if (profile?.resume) {
        window.open(profile.resume, "_blank");
      } else {
        alert("Resume not available");
      }
    } catch (error: any) {
      alert(error?.data?.message || error?.message || "Unable to download resume");
    }
  };

  if (!applicationId) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#2C2520] flex items-center justify-center">
        <div className="rounded-3xl border border-[#E7DDD5] bg-white p-4 text-center shadow-sm">
          <p className="text-lg font-semibold">No applicationId provided.</p>
          <p className="mt-2 text-sm text-[#6B5C52]">Please open this page with a valid applicationId query parameter.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#2C2520] flex items-center justify-center">
        <div className="rounded-3xl border border-[#E7DDD5] bg-white p-4 text-center shadow-sm">
          <p className="text-lg font-semibold">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#2C2520] flex items-center justify-center">
        <div className="rounded-3xl border border-[#E7DDD5] bg-white p-4 text-center shadow-sm">
          <p className="text-lg font-semibold">Unable to load candidate profile.</p>
          <p className="mt-2 text-sm text-[#6B5C52]">Please check the applicationId and try again.</p>
        </div>
      </div>
    );
  }

  const name = profile?.fullName || "Candidate Name";
  const location = profile?.location || "Location not specified";
  const skills = profile?.skills ?? [];
  const workHistory = profile?.workHistory ?? [];
  const education = profile?.education ?? [];

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C2520] flex flex-col font-sans antialiased">
      <CareersHeader variant="jobposter" activeTab="Applications" />

      <main className="flex-1 px-6 md:px-12 lg:px-20 py-6 max-w-7xl mx-auto w-full space-y-4">
        <nav className="text-xs text-gray-500 font-medium tracking-wide">
          Jobs &nbsp;›&nbsp; {job?.jobTitle || "Applicant"} &nbsp;›&nbsp; Applicants &nbsp;›&nbsp; <span className="text-[#1A1A1A] font-semibold">{name}</span>
        </nav>

        <div className="grid lg:grid-cols-[2.2fr_1fr] gap-6 items-start">
          <div className="space-y-6">
            <div className="bg-[#FFF9F5] border border-[#F0E4DC] rounded-[24px] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0 border border-gray-100">
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#6B5C52] font-semibold">
                    {name.split(" ").map((part) => part.charAt(0)).join("")}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[26px] font-serif font-bold text-[#2A1B14] leading-tight">{name}</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {profile?.experienceLevel || "Experience not specified"} • {location}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-w-xs sm:justify-end">
                    {skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="bg-white text-[11px] text-gray-700 px-3 py-1 rounded-full border border-[#EBE3DC] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold bg-[#F4ECE6] text-[#5A4D44] px-2.5 py-1 rounded tracking-wider uppercase">
                    {profile?.experienceLevel || "Experience"}
                  </span>
                  <span className="text-[10px] font-bold bg-[#C87A53] text-white px-2.5 py-1 rounded tracking-wider uppercase">
                    {app?.status || "Status"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex bg-[#F2EAE3] p-1 rounded-xl max-w-md border border-[#E6DDD6]">
              {(["Overview", "Resume", "Timeline", "Evaluations"] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                      isActive ? "bg-white text-[#6D3D27] shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab === "Overview" && <User className="w-3.5 h-3.5" />}
                    {tab === "Resume" && <FileText className="w-3.5 h-3.5" />}
                    {tab === "Timeline" && <Clock className="w-3.5 h-3.5" />}
                    {tab === "Evaluations" && <MessageSquare className="w-3.5 h-3.5" />}
                    {tab}
                  </button>
                );
              })}
            </div>

            <Card className="bg-white p-5 rounded-[24px] border border-[#EFE6DF] shadow-sm min-h-[420px]">
              {activeTab === "Overview" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-serif font-bold text-[#2A1B14]">Candidate Overview</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {profile?.about || "Candidate summary not available."}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-[#FAF6F2] p-4 rounded-xl border border-[#F2ECE7]">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Applied</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">{formatDate(app?.appliedDate)}</p>
                    </div>
                    <div className="bg-[#FAF6F2] p-4 rounded-xl border border-[#F2ECE7]">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Last active</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">{formatDate(profile?.lastActive)}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Resume" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-[#F2ECE7] pb-4">
                    <h3 className="text-lg font-serif font-bold text-[#2A1B14]">Resume Preview</h3>
                    <button
                      onClick={handleDownloadResume}
                      disabled={isDownloading}
                      className="text-xs text-[#6D3D27] font-bold flex items-center gap-1 hover:underline disabled:opacity-60"
                    >
                      <Download className="w-3 h-3" /> {isDownloading ? "Downloading..." : "Download PDF"}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1 relative pl-4 border-l-2 border-[#EADED6]">
                      <div className="flex justify-between items-start text-sm">
                        <p className="font-bold text-[#2A1B14]">{job?.jobTitle || "Role"}</p>
                        <span className="text-xs text-gray-400 font-medium">{job?.experienceLevel || "Experience Level"}</span>
                      </div>
                      <p className="text-xs text-[#A36D53] font-semibold">{job?.location || "Location"}</p>
                      <ul className="list-disc ml-4 mt-2 text-xs text-gray-600 space-y-1.5 leading-relaxed">
                        {profile?.about ? (
                          <li>{profile.about}</li>
                        ) : (
                          <>
                            <li>Candidate profile summary not available.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[#F2ECE7]">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Education</h4>
                    {education.length > 0 ? (
                      education.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-semibold text-[#2B1F17]">{item.degree || item.course || "Degree"}</p>
                            <p>{item.institution || "Institution"}</p>
                          </div>
                          <span className="text-xs text-gray-400 font-medium">{item.year || "Year"}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <p>No education data available.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Timeline" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-serif font-bold text-[#2A1B14]">Application Timeline</h3>
                  <div className="relative border-l border-[#E5DCD5] ml-2 pl-6 space-y-6 text-sm">
                    <div className="relative">
                      <span className="absolute -left-[30px] top-1 bg-[#6D3D27] w-2 h-2 rounded-full ring-4 ring-[#FFF5EE]" />
                      <p className="font-semibold text-gray-800">Submitted application</p>
                      <p className="text-xs text-gray-400">{formatDate(app?.submittedAt)}</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[30px] top-1 bg-gray-300 w-2 h-2 rounded-full ring-4 ring-white" />
                      <p className="font-semibold text-gray-700">Applied for role</p>
                      <p className="text-xs text-gray-400">{formatDate(app?.appliedDate)}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Evaluations" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-serif font-bold text-[#2A1B14]">Interview Evaluations</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#FAF6F2] border border-[#EFE6DF] rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700">Portfolio & Craft Review</span>
                        <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded">-- / 100</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {app?.additionalAnswer ?? "No additional answers provided."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white p-4 rounded-[24px] border border-[#EFE6DF] shadow-sm space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">Application Status</label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    disabled={isStatusLoading}
                    className="w-full border border-[#E5DCD5] rounded-xl px-4 py-3 text-sm bg-[#FAF6F2] font-medium appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#6D3D27] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <Button
                onClick={() => handleUpdateStatus("Shortlisted")}
                disabled={isStatusLoading}
                className="w-full bg-[#6D3D27] hover:bg-[#542E1D] text-white font-medium py-3 rounded-xl text-sm shadow-sm transition-colors disabled:opacity-60"
              >
                {isStatusLoading ? "Updating..." : "Shortlist Candidate"}
              </Button>

              <button
                onClick={() => handleUpdateStatus("Rejected")}
                disabled={isStatusLoading}
                className="w-full border border-[#D97670] text-[#C94A42] font-medium py-2.5 rounded-xl text-sm hover:bg-red-50/50 transition-colors disabled:opacity-60"
              >
                Reject Candidate
              </button>

              <div className="pt-4 border-t border-[#F2ECE7] space-y-3.5 text-sm text-gray-700 font-medium">
                <button
                  type="button"
                  onClick={() => {
                    if (!applicationId) {
                      alert("Application ID not available");
                      return;
                    }
                    const candidateName = profile?.fullName ?? "Candidate";
                    router.push(
                      `/jobposter/messages?applicationId=${applicationId}&candidateName=${encodeURIComponent(candidateName)}`
                    );
                  }}
                  className="w-full text-left flex items-center gap-3 hover:text-[#6D3D27] transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span>Message Candidate</span>
                </button>

                <div className="flex items-center gap-3 cursor-pointer hover:text-[#6D3D27] transition-colors">
                  <Download className="w-4 h-4 text-gray-500" />
                  <button onClick={handleDownloadResume} disabled={isDownloading} className="text-sm text-[#6D3D27] hover:underline disabled:opacity-60">
                    {isDownloading ? "Downloading..." : "Download Resume"}
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-5 rounded-[20px] bg-[#FAF6F2] border border-[#EADED6] text-xs space-y-3 font-medium text-gray-600">
              <div className="flex justify-between items-center">
                <span>Applied</span>
                <span className="font-bold text-[#1A1A1A]">{formatDate(app?.appliedDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Last active</span>
                <span className="font-bold text-[#1A1A1A]">{formatDate(profile?.lastActive)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Recruiter</span>
                <span className="font-bold text-[#1A1A1A]">Recruiter</span>
              </div>
            </Card>

            <Card className="p-5 rounded-[24px] bg-white border border-[#EFE6DF] shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#2A1B14]">
                <span className="text-base text-gray-500">☰</span>
                <h3>Internal Notes</h3>
              </div>

              <div className="space-y-2.5 max-h-[160px] overflow-y-auto">
                {notes.map((note, index) => (
                  <div key={index} className="bg-[#FFF6F0] border border-[#FCEFE6] p-3 rounded-xl text-xs text-[#5C4D44] italic leading-relaxed">
                    {note}
                  </div>
                ))}
              </div>

              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a recruiter note..."
                rows={3}
                className="w-full border border-[#E5DCD5] rounded-xl p-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#6D3D27]"
              />

              <Button
                onClick={handleAddNote}
                disabled={isSaving}
                className="w-full bg-[#524B46] hover:bg-[#3D3733] text-white text-xs font-semibold py-2.5 rounded-xl uppercase tracking-wider transition-colors disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Note"}
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
