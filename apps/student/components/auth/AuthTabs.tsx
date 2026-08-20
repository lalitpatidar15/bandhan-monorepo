"use client";

import { useRouter, usePathname } from "next/navigation";

export default function AuthTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const isStudent = pathname.includes("student");
  const isInstructor = pathname.includes("instructor");

  return (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
      <button
        onClick={() => router.push("/student/auth")}
        className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
          isStudent
            ? "bg-white shadow text-black"
            : "text-gray-500"
        }`}
      >
        Student
      </button>

      <button
        onClick={() => router.push("/instructor/login")}
        className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
          isInstructor
            ? "bg-white shadow text-black"
            : "text-gray-500"
        }`}
      >
        Instructor
      </button>
    </div>
  );
}
