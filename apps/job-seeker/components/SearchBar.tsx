import { useState } from "react";
import { Button } from "./ui/button";

interface SearchBarProps {
  jobsFound?: number;
}

export function SearchBar({ jobsFound = 0 }: SearchBarProps) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    alert(`Searching for: ${keyword} in ${location}`);
  };

  return (
    <section className="rounded-3xl border border-brown-200 dark:border-[#374151] bg-white dark:bg-[#171717] p-4 shadow-[0_35px_80px_-40px_rgba(0,0,0,0.18)]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm uppercase tracking-[0.24em] text-brown-700/80 dark:text-[#b89b7d]">Home &gt; Jobs</p>
        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-full bg-[#F4E4DC] dark:bg-[#2a2018] px-4 py-2 text-xs uppercase tracking-[0.24em] text-brown-700 dark:text-[#c9a882]">{jobsFound.toLocaleString()} Jobs Found</span>
          <span className="text-sm text-brown-700/80 dark:text-[#b89b7d]">Personalized recommendations based on your profile</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
        <label className="relative block">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-400">🔍</span>
          <input
            type="search"
            placeholder="Job title / keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-3xl border border-brown-200 dark:border-[#374151] bg-[#FCF3EE] dark:bg-[#1a1a1a] py-4 pl-12 pr-4 text-sm text-brown-950 dark:text-[#ededed] outline-none transition focus:border-brown-400 focus:ring-2 focus:ring-brown-100"
          />
        </label>
        <label className="relative block">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-400">📍</span>
          <input
            type="search"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-3xl border border-brown-200 dark:border-[#374151] bg-[#FCF3EE] dark:bg-[#1a1a1a] py-4 pl-12 pr-4 text-sm text-brown-950 dark:text-[#ededed] outline-none transition focus:border-brown-400 focus:ring-2 focus:ring-brown-100"
          />
        </label>
        <div className="flex items-end">
          <Button type="button" variant="primary" className="h-full w-full py-4" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>
    </section>
  );
}
