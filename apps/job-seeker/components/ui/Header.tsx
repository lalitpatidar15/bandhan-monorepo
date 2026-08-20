"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Search, Bell, Settings2, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetProfileQuery } from "@/app/Jobseeker/redux/services/ProfileApi";
import { useGetCompanyProfileQuery } from "@/app/jobposter/redux/services/RecruiterProfileApi";
import { clearJobPortalSession } from "@/lib/session";

function useUnreadCount(variant: "jobs" | "jobposter" | "default") {
  if (variant === "jobposter") {
    const { data } = require("@/app/jobposter/redux/services/JobApi").useGetUnreadCountQuery();
    return data?.unreadCount ?? 0;
  }
  if (variant === "jobs") {
    const { data } = require("@/app/Jobseeker/redux/services/JobsApi").useGetUnreadCountQuery();
    return data?.unreadCount ?? 0;
  }
  return 0;
}

interface HeaderProps {
  stepLabel?: string;
  variant?: "default" | "jobs" | "detail" | "jobposter";
  activeTab?: string;
}

const navItems = [
  { label: "Dashboard", href: "/Jobseeker/dashboard" },
  { label: "Jobs", href: "/Jobseeker/jobs" },
  { label: "Applications", href: "/Jobseeker/applications" },
  { label: "Messages", href: "/Jobseeker/messages" },
  { label: "Payments", href: "/Jobseeker/payments" },
];

const navItemsJobposter = [
  { label: "Dashboard", href: "/jobposter/dashboard" },
  { label: "Jobs", href: "/jobposter/jobpost" },
  { label: "Applications", href: "/jobposter/Application" },
  { label: "Messages", href: "/jobposter/messages" },
  { label: "Payments", href: "/jobposter/payments" },
];

export function Header({
  stepLabel,
  variant = "default",
  activeTab = "",
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const normalizedActiveTab = activeTab?.trim().toLowerCase();

  const isActiveNavItem = (item: { label: string; href: string }) => {
    if (!normalizedActiveTab) return false;

    const label = item.label.toLowerCase();
    const hrefKey = item.href.split("/").pop()?.toLowerCase();

    if (normalizedActiveTab === label || normalizedActiveTab === hrefKey) return true;
    if (label.endsWith("s") && normalizedActiveTab === label.slice(0, -1)) return true;
    if (normalizedActiveTab.endsWith("s") && normalizedActiveTab.slice(0, -1) === label) return true;

    return false;
  };

  /* ================= JOBS HEADER ================= */
  if (variant === "jobs") {
    return (
      <header className="w-full bg-white border-b border-[#E8D7CB] sticky top-0 z-50">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-6">
            <CareersLogo />

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-5 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`pb-1 border-b-2 transition ${
                    isActiveNavItem(item)
                      ? "border-[#5E3E1B] text-[#7E3E1B] font-semibold"
                      : "border-transparent text-[#8B6F63] hover:border-[#DEC3B3]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3">

            <Link href="/Jobseeker/notifications" className="relative">
              <button className="h-9 w-9 flex items-center justify-center rounded-full bg-[#F7EFEA] hover:bg-[#E9D6C5]">
                <Bell className="h-4 w-4" />
              </button>
              <UnreadBadge variant="jobs" />
            </Link>

            {/* Avatar */}
            <UserMenu variant="jobs" />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden ml-1"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-[#E8D7CB] px-4 py-4 space-y-4 bg-white">
            {/* Mobile Nav */}
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-medium ${
                    activeTab === item.label
                      ? "text-[#7E3E1B]"
                      : "text-[#8B6F63]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    );
  }



   if (variant === "jobposter") {
    return (
      <header className="w-full bg-white border-b border-[#E8D7CB] sticky top-0 z-50">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-6">
            <CareersLogo />

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-5 text-sm">
              {navItemsJobposter.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`pb-1 border-b-2 transition ${
                    isActiveNavItem(item)
                      ? "border-[#5E3E1B] text-[#7E3E1B] font-semibold"
                      : "border-transparent text-[#8B6F63] hover:border-[#DEC3B3]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/jobposter/notifications" className="relative">
              <button className="h-9 w-9 flex items-center justify-center rounded-full bg-[#F7EFEA] hover:bg-[#E9D6C5]">
                <Bell className="h-4 w-4" />
              </button>
              <UnreadBadge variant="jobposter" />
            </Link>

            {/* Avatar */}
            <UserMenu variant="jobposter" />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden ml-1"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-[#E8D7CB] px-4 py-4 space-y-4 bg-white">
            {/* Mobile Nav */}
            <nav className="flex flex-col gap-3">
              {navItemsJobposter.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-medium ${
                    activeTab === item.label
                      ? "text-[#7E3E1B]"
                      : "text-[#8B6F63]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    );
  }
  /* ================= DETAIL HEADER ================= */
  if (variant === "detail") {
    const detailNav = ["Find Jobs", "Companies", "Salaries", "Resources"];

    return (
      <header className="w-full bg-white border-b border-[#E8D7CB] px-4 md:px-6 py-4 flex justify-between items-center">
        <CareersLogo />

        <div className="hidden md:flex items-center gap-6 text-sm">
          {detailNav.map((item) => (
            <button
              key={item}
              className="text-[#8B6F63] hover:text-[#5E3D2C]"
              onClick={() => alert(`Navigate to ${item}`)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded-full bg-[#F7EFEA] flex items-center justify-center" onClick={() => alert('Settings clicked')}>
            <Settings2 className="h-4 w-4" />
          </button>

          <Link href="/jobposter/notifications" className="relative">
            <button className="h-9 w-9 rounded-full bg-[#F7EFEA] flex items-center justify-center">
              <Bell className="h-4 w-4" />
            </button>
            <UnreadBadge variant="jobposter" />
          </Link>

          <UserMenu variant="default" />
        </div>
      </header>
    );
  }

  /* ================= DEFAULT HEADER ================= */
  return (
    <header className="bg-white px-4 md:px-6 py-4 border-b border-[#E8D7CB] flex justify-between items-center">
      <CareersLogo />

      <div className="flex items-center gap-3">
        {stepLabel && (
          <span className="hidden sm:inline-block rounded-full bg-[#F4E0D5] px-4 py-2 text-xs font-semibold">
            {stepLabel}
          </span>
        )}

        <UserMenu variant="default" />
      </div>
    </header>
  );
}

function CareersLogo() {
  return <Image src="/Group1.png" alt="Bandhan Careers" width={433} height={96} className="h-8 w-auto rounded-md bg-[#2A1C16] px-2 py-1" priority />;
}

function UserMenu({ variant }: { variant: "jobs" | "jobposter" | "default" }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { data: seekerProfileData } = useGetProfileQuery(undefined, { skip: variant !== "jobs" });
  const { data: companyProfileData } = useGetCompanyProfileQuery(undefined, { skip: variant !== "jobposter" });

  const seekerProfile = seekerProfileData?.data as { fullName?: string; profilePhoto?: string; profileImage?: string } | undefined;
  const companyProfile = companyProfileData?.data;

  const avatarImage = variant === "jobposter"
    ? companyProfile?.companyLogo
    : seekerProfile?.profilePhoto || seekerProfile?.profileImage;

  const avatarLabel = variant === "jobposter"
    ? companyProfile?.companyName?.[0]?.toUpperCase() || "U"
    : seekerProfile?.fullName?.[0]?.toUpperCase() || "U";

  const updatePath = variant === "jobposter" ? "/jobposter/profilesetup" : "/Jobseeker/profile";
  const loginPath = variant === "jobposter" ? "/jobposter/login" : "/Jobseeker/login";
  const updateLabel = variant === "jobposter" ? "Update company profile" : "Update profile";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearJobPortalSession();
    setMenuOpen(false);
    router.push(loginPath);
  };

  const handleUpdate = () => {
    setMenuOpen(false);
    router.push(updatePath);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7E553A] text-white text-sm font-semibold overflow-hidden"
      >
        {avatarImage ? (
          <img src={avatarImage} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <span>{avatarLabel}</span>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-3 text-sm text-slate-900">
            <button
              type="button"
              onClick={handleUpdate}
              className="w-full text-left rounded-xl px-3 py-2 hover:bg-slate-100"
            >
              {updateLabel}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left rounded-xl px-3 py-2 text-red-600 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UnreadBadge({ variant }: { variant: "jobs" | "jobposter" | "default" }) {
  const count = useUnreadCount(variant);
  if (count === 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-[#C56A2D] text-[10px] font-bold text-white px-1 leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}
