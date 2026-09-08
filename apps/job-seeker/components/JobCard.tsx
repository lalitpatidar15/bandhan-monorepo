import Link from "next/link";
import { useState } from "react";
import type { MouseEvent } from "react";
import { Badge } from "@bandhan/ui";
import { Bookmark, Building2, MapPin } from "lucide-react";
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
  selected?: boolean;
  onSelect?: () => void;
}

function JobSaveButton({ jobId, initialSaved }: { jobId?: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [saveJob, { isLoading: isSaving }] = useSaveJobMutation();
  const [removeSavedJob, { isLoading: isRemoving }] = useRemoveSavedJobMutation();

  const loading = isSaving || isRemoving;

  const handleToggle = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
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
  const { title, company, location, salary, tags, badgeText, details, href, companyLogo, jobId, isSaved, selected, onSelect } = props;
  return (
    <article
      onClick={onSelect}
      className={[
        "bhn-card p-4 transition-all",
        onSelect ? "cursor-pointer" : "",
        selected ? "border-[var(--bhn-brand-500)] shadow-[0_0_0_2px_var(--bhn-brand-100)]" : "hover:border-[var(--bhn-border-strong)]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bhn-surface-2)] flex-shrink-0 overflow-hidden text-[var(--bhn-brand-700)]">
            {companyLogo ? (
              <img src={companyLogo} alt={`${company} logo`} className="h-full w-full object-cover" />
            ) : (
              <Building2 size={21} />
            )}
        </div>

        <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <Badge tone="brand">{badgeText}</Badge>
              {tags.map((tag) => (
                <Badge key={tag} tone="neutral">
                  {tag}
                </Badge>
              ))}
            </div>

            <h3 className="mb-1.5 line-clamp-2 text-base font-bold text-[var(--bhn-text)]">{title}</h3>

            <p className="mb-2 text-sm text-[var(--bhn-text-muted)]">
              <span className="font-medium text-[var(--bhn-text)]">{company}</span>
              <span className="mt-1 flex items-center gap-1"><MapPin size={13} />{location}</span>
            </p>

            <p className="text-sm font-semibold text-[var(--bhn-text)]">{salary}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--bhn-text-muted)]">{details}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
          <JobSaveButton jobId={jobId} initialSaved={Boolean(isSaved)} />
          {href ? <Link href={href} onClick={(event) => event.stopPropagation()} className="text-xs font-bold text-[var(--bhn-brand-700)] hover:underline">View role</Link> : null}
        </div>
      </div>
    </article>
  );
}
