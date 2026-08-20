const availableJobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const availableExperiences = ["Junior", "Mid-Level", "Senior", "Lead/Executive"];

interface FilterSidebarProps {
  jobs: Array<{
    title: string;
    company: string;
    location: string;
    salary: string;
    badgeText: string;
    tags: string[];
    details: string;
    href?: string;
    experienceLevel?: string;
    remoteAvailable?: boolean;
    skills?: string[];
    jobType?: string;
  }>;
  selectedJobTypes: string[];
  onJobTypeChange: (value: string) => void;
  selectedExperience: string;
  onExperienceChange: (value: string) => void;
  selectedSalary: number;
  onSalaryChange: (value: number) => void;
  remoteFilter: "all" | "remote" | "onsite";
  onRemoteFilterChange: (value: "all" | "remote" | "onsite") => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  jobs,
  selectedJobTypes,
  onJobTypeChange,
  selectedExperience,
  onExperienceChange,
  selectedSalary,
  onSalaryChange,
  remoteFilter,
  onRemoteFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  return (
    <div className="bhn-card bhn-card-pad sticky top-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-[#2D201B] dark:text-[#ededed]">Filters</h3>
        <button
          type="button"
          className="text-xs font-semibold text-[#8B3E05] dark:text-[#c9a882] hover:text-[#6B2E04] dark:hover:text-[#d4a882] transition"
          onClick={onClearFilters}
        >
          Clear All
        </button>
      </div>

      {/* Job Type */}
      <div className="pb-6 border-b border-[#E8DDD5] dark:border-[#374151]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8A7A72] dark:text-[#a89080] mb-3">
          Job Type
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onJobTypeChange("all")}
            className={["bhn-chip", selectedJobTypes.length === 0 ? "bhn-chip-active" : ""].filter(Boolean).join(" ")}
          >
            All
          </button>
          {availableJobTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onJobTypeChange(type)}
              className={["bhn-chip", selectedJobTypes.includes(type) ? "bhn-chip-active" : ""].filter(Boolean).join(" ")}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="py-6 border-b border-[#E8DDD5] dark:border-[#374151]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8A7A72] dark:text-[#a89080] mb-3">
          Experience
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onExperienceChange("")}
            className={["bhn-chip", selectedExperience === "" ? "bhn-chip-active" : ""].filter(Boolean).join(" ")}
          >
            All
          </button>
          {availableExperiences.map((exp) => (
            <button
              key={exp}
              type="button"
              onClick={() => onExperienceChange(exp)}
              className={["bhn-chip", selectedExperience === exp ? "bhn-chip-active" : ""].filter(Boolean).join(" ")}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="py-6 border-b border-[#E8DDD5] dark:border-[#374151]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8A7A72] dark:text-[#a89080] mb-4">
          Salary Range (In ₹)
        </p>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="50"
            value={selectedSalary}
            onChange={(e) => onSalaryChange(Number(e.target.value))}
            className="w-full h-2 bg-[#E8DDD5] dark:bg-[#374151] rounded-lg appearance-none cursor-pointer accent-[#8B3E05] dark:accent-[#c9a882]"
            style={{
              background: `linear-gradient(to right, #8B3E05 0%, #8B3E05 ${selectedSalary}%, #E8DDD5 ${selectedSalary}%, #E8DDD5 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-[#8A7A72] dark:text-[#a89080]">
            <span>₹0</span>
            <span>₹{selectedSalary}L+</span>
          </div>
        </div>
      </div>

      {/* Work Mode */}
      <div className="py-6 border-b border-[#E8DDD5] dark:border-[#374151]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8A7A72] dark:text-[#a89080] mb-3">
          Work Mode
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", value: "all" as const },
            { label: "Remote", value: "remote" as const },
            { label: "On-site", value: "onsite" as const },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onRemoteFilterChange(option.value)}
              className={["bhn-chip", remoteFilter === option.value ? "bhn-chip-active" : ""].filter(Boolean).join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}