import Link from "next/link";
import { useState } from "react";
import { Button, Badge } from "@bandhan/ui";
import { Bookmark } from "lucide-react";
import { useSaveJobMutation, useRemoveSavedJobMutation } from "@/app/Jobseeker/redux/services/JobsApi";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  badgeText: string;
  details: string;
  href?: string;
  companyLogo?: string;
  jobId?: string;
  isSaved?: boolean;
}

const badgeIcons: Record<string, string> = {
  REMOTE: "💻",
  HYBRID: "🏢",
  "ON-SITE": "📍",
};

function JobSaveButton({ jobId, initialSaved }: { jobId?: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [saveJob, { isLoading: isSaving }] = useSaveJobMutation();
  const [removeSavedJob, { isLoading: isRemoving }] = useRemoveSavedJobMutation();

  const loading = isSaving || isRemoving;

  const handleToggle = async () => {
    if (!jobId) {
      alert("Unable to save: missing job id");
      return;
    }

    // optimistic
    setSaved((s) => !s);

    try {
      if (!saved) {
        await saveJob(jobId).unwrap();
      } else {
        await removeSavedJob(jobId).unwrap();
      }
    } catch (err: any) {
      // revert optimistic
      setSaved((s) => !s);
      console.error("save/unsave job error:", err);
      alert(err?.data?.message || err?.message || "Unable to update saved jobs.");
    }
  };

  return (
    <button
      aria-pressed={saved}
      aria-label={saved ? "Saved" : "Save job"}
      disabled={loading}
      onClick={handleToggle}
      className={`rounded-lg p-1 transition-all ${loading ? "opacity-60 cursor-wait" : "cursor-pointer hover:scale-105"}`}
    >
      <span className={`inline-flex items-center justify-center p-1 rounded-md transition-colors ${saved ? "bg-[#8B3E05] dark:bg-[#b86a3a] text-white" : "bg-transparent text-[#C79D7A] dark:text-[#a89080] hover:bg-[#FFF4EC] dark:hover:bg-[#2a2018]"}`}>
        <Bookmark className="w-5 h-5" />
      </span>
    </button>
  );
}

export function JobCard(props: JobCardProps) {
  const { title, company, location, salary, tags, badgeText, details, href, companyLogo, jobId, isSaved } = props;
  return (
    <article className="bhn-card bhn-card-hover bhn-card-pad hover:cursor-default">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Left: Company Logo + Job Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Company Logo */}
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#F3E4D8] dark:bg-[#2a2018] flex-shrink-0 text-2xl overflow-hidden">
            {companyLogo ? (
              <img src={companyLogo} alt={`${company} logo`} className="h-full w-full object-cover" />
            ) : (
              badgeIcons[badgeText] || "💼"
            )}
          </div>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge tone="brand">{badgeText}</Badge>
              {tags.map((tag) => (
                <Badge key={tag} tone="neutral">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Job Title */}
            <h3 className="text-lg font-bold text-[#2D201B] dark:text-[#ededed] mb-2 line-clamp-2">{title}</h3>

            {/* Company + Location */}
            <p className="text-sm text-[#8A7A72] dark:text-[#a89080] mb-2">
              <span className="font-medium">{company}</span>
              <span className="mx-1">•</span>
              <span>{location}</span>
            </p>

            {/* Salary */}
            <p className="text-sm font-semibold text-[#2D201B] dark:text-[#ededed] mb-3">{salary}</p>

            {/* Description */}
            <p className="text-sm text-[#8A7A72] dark:text-[#a89080] leading-relaxed line-clamp-2">{details}</p>
          </div>
        </div>

        {/* Right: Apply Button */}
        <div className="flex lg:flex-col items-center justify-between lg:items-end gap-3">
          <div className="text-right">
            <JobSaveButton jobId={jobId} initialSaved={Boolean(isSaved)} />
          </div>
          {href ? (
            <Link href={href} className="w-full lg:w-auto">
              <Button className="w-full lg:w-auto text-white text-xs font-semibold py-2 px-6 rounded-lg">
                Apply Now
              </Button>
            </Link>
          ) : (
            <Button className="w-full lg:w-auto text-white text-xs font-semibold py-2 px-6 rounded-lg" onClick={() => alert(`Apply for: ${title} at ${company}`)}>
              Apply Now
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}