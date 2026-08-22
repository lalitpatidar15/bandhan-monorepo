"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { centralLoginUrl, clearAcademySession } from "@/lib/session";

type NavbarProps = {
  title?: string;
  userName?: string;
};

export default function Navbar({
  title = "Dashboard",
  userName = "User",
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="h-14 bg-[var(--bhn-surface)] border-b border-[var(--bhn-border)] flex items-center justify-between px-6">
      {/* Left */}
      <h1 className="bhn-pageheader-title text-lg">{title}</h1>

      {/* Right */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2"
        >
          <div className="bhn-avatar bhn-avatar-sm bg-[var(--bhn-surface-3)] text-[var(--bhn-text-muted)]">
            {userName[0]}
          </div>
          <span className="text-sm">{userName}</span>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-lg shadow-[var(--bhn-shadow)]">
            <button
              onClick={() => router.push("/student/profile")}
              className="w-full text-left px-4 py-2 hover:bg-[var(--bhn-surface-2)] text-sm"
            >
              Profile
            </button>
            <button
              onClick={() => router.push("/student/profile")}
              className="w-full text-left px-4 py-2 hover:bg-[var(--bhn-surface-2)] text-sm"
            >
              Settings
            </button>
            <button
              onClick={() => {
                clearAcademySession();
                window.location.assign(centralLoginUrl());
              }}
              className="w-full text-left px-4 py-2 hover:bg-[var(--bhn-error-50)] text-[var(--bhn-error-600)] text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
