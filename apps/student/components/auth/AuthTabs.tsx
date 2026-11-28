"use client";

import { usePathname } from "next/navigation";
import { centralLoginUrl } from "@/lib/session";

export default function AuthTabs() {
  const pathname = usePathname();

  const isStudent = pathname.includes("student");
  const isInstructor = pathname.includes("instructor");

  return (
    <div className="flex bg-[var(--bhn-brand-50)] rounded-lg p-1 mb-6">
      <button
        onClick={() => window.location.assign(centralLoginUrl())}
        className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
          isStudent
            ? "bg-[var(--bhn-brand-600)] shadow text-white"
            : "text-[var(--bhn-brand-800)]"
        }`}
      >
        Student
      </button>

      <button
        onClick={() => window.location.assign(centralLoginUrl())}
        className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
          isInstructor
            ? "bg-[var(--bhn-brand-600)] shadow text-white"
            : "text-[var(--bhn-brand-800)]"
        }`}
      >
        Instructor
      </button>
    </div>
  );
}
