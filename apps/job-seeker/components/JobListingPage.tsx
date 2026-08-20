"use client";

import { useEffect, useMemo, useState } from "react";
import { CareersHeader } from "@/components/CareersHeader";
import { JobCard } from "./JobCard";
import { FilterSidebar } from "./FilterSidebar";
import { Button, EmptyState, Spinner } from "@bandhan/ui";
import { BriefcaseBusiness, SearchX } from "lucide-react";
import { useGetJobsQuery } from "../app/Jobseeker/redux/services/JobsApi";

type SortOption =
    | "most-relevant"
    | "newest-first"
    | "oldest-first"
    | "salary-high"
    | "salary-low"
    | "a-z"
    | "z-a";
type RemoteFilterValue = "all" | "remote" | "onsite";

type ApiJob = Record<string, unknown>;
const DEFAULT_SALARY = 0;
const PAGE_SIZE = 4;

function getJobsFromResponse(response: unknown) {
    if (!response || typeof response !== "object") {
        return [];
    }

    const record = response as Record<string, unknown>;
    if (Array.isArray(record.jobs)) {
        return record.jobs;
    }

    if (record.data && typeof record.data === "object") {
        const nested = record.data as Record<string, unknown>;
        if (Array.isArray(nested.jobs)) {
            return nested.jobs;
        }
    }

    return [];
}

function getTotalJobsFromResponse(response: unknown) {
    if (!response || typeof response !== "object") {
        return undefined;
    }

    const record = response as Record<string, unknown>;
    if (typeof record.totalJobs === "number") {
        return record.totalJobs;
    }

    if (record.data && typeof record.data === "object") {
        const nested = record.data as Record<string, unknown>;
        if (typeof nested.totalJobs === "number") {
            return nested.totalJobs;
        }
    }

    return undefined;
}

function formatSalaryText(job: ApiJob) {
    if (typeof job.salary === "string") {
        return job.salary;
    }
    if (typeof job.salary === "number") {
        return `₹${job.salary}`;
    }

    const salaryMin = typeof job.salaryMin === "number" ? job.salaryMin : typeof job.salaryMin === "string" ? Number(job.salaryMin) : undefined;
    if (typeof salaryMin !== "number" || Number.isNaN(salaryMin)) {
        return "Salary not disclosed";
    }

    const salaryMax = typeof job.salaryMax === "number" ? job.salaryMax : typeof job.salaryMax === "string" ? Number(job.salaryMax) : undefined;
    if (typeof salaryMax === "number" && !Number.isNaN(salaryMax)) {
        return `₹${salaryMin} - ₹${salaryMax}`;
    }

    return `₹${salaryMin}`;
}

function getSalaryMinValue(job: ApiJob) {
    if (typeof job.salaryMin === "number") {
        return job.salaryMin;
    }

    if (typeof job.salaryMin === "string") {
        const parsed = Number(job.salaryMin);
        return Number.isNaN(parsed) ? undefined : parsed;
    }

    return undefined;
}

export function JobListingPage() {
    const { data, isLoading, isError, error } = useGetJobsQuery();

    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchLocation, setSearchLocation] = useState("");
    const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
    const [selectedExperience, setSelectedExperience] = useState("");
    const [selectedSalary, setSelectedSalary] = useState(DEFAULT_SALARY);
    const [remoteFilter, setRemoteFilter] = useState<RemoteFilterValue>("all");
    const [visibleJobs, setVisibleJobs] = useState(PAGE_SIZE);
    const [sortBy, setSortBy] = useState<SortOption>("most-relevant");

    // Map API items to UI-friendly shape
    const jobs = useMemo(() => {
        const apiJobs = getJobsFromResponse(data);

        return apiJobs.map((job: ApiJob, index: number) => {
            const recruiter = typeof job.recruiterId === "object" && job.recruiterId !== null ? (job.recruiterId as ApiJob) : undefined;
            const companyName = typeof job.companyName === "string" ? job.companyName : typeof recruiter?.companyName === "string" ? recruiter.companyName : "Unknown Company";
            const companyLogo = typeof recruiter?.companyLogo === "string" ? recruiter.companyLogo : typeof job.companyLogo === "string" ? job.companyLogo : undefined;
            const location = typeof job.location === "string" ? job.location : "Remote";
            const title = typeof job.title === "string" ? job.title : typeof job.jobTitle === "string" ? job.jobTitle : "Untitled Role";
            const details = typeof job.jobDescription === "string" ? job.jobDescription : typeof job.description === "string" ? job.description : typeof job.aboutRole === "string" ? job.aboutRole : "No description provided.";
            const jobType = typeof job.jobType === "string" ? job.jobType : typeof job.employmentType === "string" ? job.employmentType : "Full-time";
            const badgeText = jobType.toUpperCase();
            const salaryText = formatSalaryText(job);
            const salaryMinValue = getSalaryMinValue(job);
            const salaryInLakhs = typeof salaryMinValue === "number" ? salaryMinValue / 100000 : undefined;
            const jobId = typeof job.jobId === "string" ? job.jobId : typeof job.id === "string" ? job.id : typeof job._id === "string" ? job._id : typeof job.jobId === "number" ? String(job.jobId) : "";

            return {
                title,
                company: companyName,
                location,
                salary: salaryText,
                badgeText,
                tags: [(Boolean(job.remoteAvailable) ? "Remote" : "On-site")].filter(Boolean),
                details,
                href: jobId ? `/Jobseeker/job-detail?jobId=${encodeURIComponent(jobId)}` : "/Jobseeker/job-detail",
                jobId,
                isSaved: Boolean(job.isSaved || job.saved),
                companyLogo,
                experienceLevel: typeof job.experienceLevel === "string" ? job.experienceLevel : undefined,
                remoteAvailable: Boolean(job.remoteAvailable),
                jobType,
                salaryInLakhs,
                sortIndex: index,
            };
        });
    }, [data]);

    // Filters + sorting are preserved (same as before)
    const filteredJobs = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        const location = searchLocation.trim().toLowerCase();

        const baseJobs = jobs.filter((job) => {
            const keywordMatch = !keyword || job.title.toLowerCase().includes(keyword) || job.company.toLowerCase().includes(keyword);
            const locationMatch = !location || job.location.toLowerCase().includes(location);
            const normalizedJobType = (job.jobType || "Full-time").toLowerCase();
            const jobTypeMatch = selectedJobTypes.length === 0 || selectedJobTypes.some((type) => type.toLowerCase() === normalizedJobType);
            const experienceMatch = !selectedExperience || job.experienceLevel === selectedExperience;
            const salaryMatch = typeof job.salaryInLakhs === "number" ? job.salaryInLakhs >= selectedSalary : true;
            const remoteMatch = remoteFilter === "all" || (remoteFilter === "remote" ? job.remoteAvailable : !job.remoteAvailable);

            return keywordMatch && locationMatch && jobTypeMatch && experienceMatch && salaryMatch && remoteMatch;
        });

        const sortedJobs = [...baseJobs];

        sortedJobs.sort((left, right) => {
            switch (sortBy) {
                case "newest-first":
                    return right.sortIndex - left.sortIndex;
                case "oldest-first":
                    return left.sortIndex - right.sortIndex;
                case "salary-high":
                    return (right.salaryInLakhs ?? -Infinity) - (left.salaryInLakhs ?? -Infinity);
                case "salary-low":
                    return (left.salaryInLakhs ?? Infinity) - (right.salaryInLakhs ?? Infinity);
                case "a-z":
                    return left.title.localeCompare(right.title);
                case "z-a":
                    return right.title.localeCompare(left.title);
                case "most-relevant":
                default:
                    return 0;
            }
        });

        return sortedJobs;
    }, [jobs, searchKeyword, searchLocation, selectedJobTypes, selectedExperience, selectedSalary, remoteFilter, sortBy]);

    // Reset visibleJobs when filters/search/sort change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisibleJobs(Math.min(PAGE_SIZE, filteredJobs.length || PAGE_SIZE));
    }, [searchKeyword, searchLocation, selectedJobTypes, selectedExperience, selectedSalary, remoteFilter, sortBy, filteredJobs.length]);

    const isFilterActive = Boolean(
        searchKeyword || searchLocation || selectedJobTypes.length > 0 || selectedExperience || selectedSalary !== DEFAULT_SALARY || remoteFilter !== "all"
    );

    // Effective total depends on whether a filter/search is active
    const totalAvailable = getTotalJobsFromResponse(data) ?? jobs.length;
    const effectiveTotal = isFilterActive ? filteredJobs.length : totalAvailable;

    // Buttons
    const showLoadMore =
        visibleJobs < effectiveTotal;
    const showViewLess =
        visibleJobs > PAGE_SIZE;

    // Handlers
    const handleLoadMore = () => {
        setVisibleJobs((prev) =>
            Math.min(prev + PAGE_SIZE, effectiveTotal)
        );
    };

    const handleViewLess = () => {
        setVisibleJobs((prev) =>
            Math.max(prev - PAGE_SIZE, PAGE_SIZE)
        );
    };

    const toggleJobType = (value: string) => {
        if (value === "all") {
            setSelectedJobTypes([]);
            return;
        }

        setSelectedJobTypes((prev) => {
            const next = prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value];
            return next.length === 0 ? [] : next;
        });
    };

    const clearFilters = () => {
        setSearchKeyword("");
        setSearchLocation("");
        setSelectedJobTypes([]);
        setSelectedExperience("");
        setSelectedSalary(DEFAULT_SALARY);
        setRemoteFilter("all");
        setSortBy("most-relevant");
        setVisibleJobs(PAGE_SIZE);
    };

    return (
        <div className="min-h-screen bg-[#FFF8F4] text-brown-950">
            <CareersHeader variant="jobs" activeTab="Jobs" />

            <div className="px-4 sm:px-6 lg:px-5 py-3 text-xs text-[#8A7A72] bg-[#FFF6F1]">
                <span className="text-[#2D201B] font-medium">Home</span>
                <span className="mx-2">/</span>
                <span>Jobs</span>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-6">
                <div className="space-y-6 w-full">
                    <div className="flex flex-col sm:flex-row gap-3 bhn-card bhn-card-pad shadow-sm">
                        <input
                            type="text"
                            placeholder="Job title / keyword"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="bhn-input flex-1"
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="bhn-input flex-1"
                        />
                        <Button
                            onClick={() => setVisibleJobs(PAGE_SIZE)}
                            className="w-full sm:w-auto"
                        >
                            Search
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
                        <div className="hidden md:block">
                            <FilterSidebar
                                jobs={jobs}
                                selectedJobTypes={selectedJobTypes}
                                onJobTypeChange={toggleJobType}
                                selectedExperience={selectedExperience}
                                onExperienceChange={setSelectedExperience}
                                selectedSalary={selectedSalary}
                                onSalaryChange={setSelectedSalary}
                                remoteFilter={remoteFilter}
                                onRemoteFilterChange={setRemoteFilter}
                                onClearFilters={clearFilters}
                            />
                        </div>

                        <div className="space-y-6 w-full">
                            <div className="bhn-card bhn-card-pad flex flex-col gap-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-base font-bold text-[#2D201B]">
                                            {isLoading ? "Loading jobs..." : `${data?.totalJobs ?? jobs.length} Jobs Found`}
                                        </p>
                                        <p className="text-sm text-[#8A7A72] mt-1">Personalized recommendations based on your profile</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-[#8A7A72]">Sort by:</span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                                            className="bhn-select w-auto"
                                        >
                                            <option value="most-relevant">Most Relevant</option>
                                            <option value="newest-first">Newest First</option>
                                            <option value="oldest-first">Oldest First</option>
                                            <option value="salary-high">Salary High → Low</option>
                                            <option value="salary-low">Salary Low → High</option>
                                            <option value="a-z">A-Z</option>
                                            <option value="z-a">Z-A</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {isLoading && (
                                    <div className="bhn-card">
                                        <Spinner center />
                                        <p className="pb-8 text-center text-sm text-[#8A7A72]">Loading available jobs...</p>
                                    </div>
                                )}

                                {!isLoading && isError && (
                                    <div className="bhn-card">
                                        <EmptyState
                                            icon={<BriefcaseBusiness size={28} />}
                                            title="Unable to load jobs"
                                            description={(error as { data?: { message?: string } } | undefined)?.data?.message || "Unable to load jobs right now."}
                                        />
                                    </div>
                                )}

                                {!isLoading && !isError && filteredJobs.length === 0 && (
                                    <div className="bhn-card">
                                        <EmptyState
                                            icon={<SearchX size={28} />}
                                            title="No jobs found"
                                            description={searchKeyword || searchLocation ? "No jobs match your search criteria." : "No jobs are available right now."}
                                        />
                                    </div>
                                )}

                                {!isLoading && !isError && filteredJobs.length > 0 && (
                                    <>
                                        {filteredJobs.slice(0, visibleJobs).map((job, index) => (
                                            <JobCard key={`${job.title}-${index}`} {...job} />
                                        ))}
                                    </>
                                )}
                            </div>

                            {effectiveTotal > PAGE_SIZE && (
                                <div className="flex justify-center gap-3 pt-6">
                                    {showLoadMore && (
                                        <Button
                                            onClick={handleLoadMore}
                                            className="px-10 py-3 rounded-xl"
                                        >
                                            Load More Jobs
                                        </Button>
                                    )}

                                    {showViewLess && (
                                        <Button
                                            variant="secondary"
                                            onClick={handleViewLess}
                                            className="px-10 py-3 rounded-xl"
                                        >
                                            View Less
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}