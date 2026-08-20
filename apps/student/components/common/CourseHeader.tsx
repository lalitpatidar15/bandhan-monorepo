"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
    Bell,
    Settings,
    Search,
    Menu,
    X,
    LogOut,
} from "lucide-react";
import { clearAcademySession } from "@/lib/session";
import AcademyLogo from "@/components/common/AcademyLogo";

export default function InstructorHeader() {
    const [mobileMenu, setMobileMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        {
            name: "Dashboard",
            path: "/instructor/dashboard",
        },
        {
            name: "My Courses",
            path: "/instructor/performance",
        },
        {
            name: "Analytics",
            path: "/instructor/analytics",
        },
        {
            name: "Earnings",
            path: "/instructor/earnings",
        },
    ];

return (
        <header className="w-full bg-[var(--bhn-surface-2)] border-b border-[var(--bhn-border)]">
            <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">

                {/* LEFT SIDE */}
                <div className="flex items-center gap-6 lg:gap-4">

                    {/* LOGO */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

                        <AcademyLogo className="h-8 sm:h-9 w-auto object-contain" />

                    </div>

                    {/* DESKTOP NAVIGATION */}
                    <nav className="hidden lg:flex items-center gap-1">

                        {navItems.map((item) => {
                            const isActive =
                                item.path === "/instructor/performance"
                                    ? pathname.startsWith("/instructor/performance")
                                    : pathname === item.path;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className={`bhn-navlink ${isActive ? "bhn-navlink-active" : ""}`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}

                    </nav>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-3 sm:gap-5">

                    {/* SEARCH */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery.trim()) {
                                router.push(`/instructor/search?q=${encodeURIComponent(searchQuery.trim())}`);
                            }
                        }}
                        className="hidden md:block relative"
                    >
<Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]"
                        />

                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[180px] lg:w-[220px] h-10 rounded-full bg-[var(--bhn-surface-3)] pl-10 pr-4 text-sm outline-none border border-transparent focus:border-[var(--bhn-brand-400)]"
                        />
                    </form>

                    {/* ICONS */}
                    <button
                        onClick={() => router.push("/instructor/notifications")}
                        className="text-[var(--bhn-text-muted)] hover:text-[var(--bhn-brand-700)] transition"
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                    </button>

                    <button
                        onClick={() => {
                            clearAcademySession();
                            router.replace("/instructor/login");
                        }}
                        className="text-[var(--bhn-text-muted)] hover:text-[var(--bhn-error-600)] transition"
                        aria-label="Logout"
                    >
                        <LogOut size={18} />
                    </button>

                    <button
                        onClick={() => router.push("/instructor/profile")}
                        className="hidden sm:block text-[var(--bhn-text-muted)] hover:text-[var(--bhn-brand-700)] transition"
                        aria-label="Settings"
                    >
                        <Settings size={18} />
                    </button>

                    {/* PROFILE */}
                    <button
                        onClick={() => router.push("/instructor/profile")}
                        className="w-9 h-9 rounded-full overflow-hidden border border-[var(--bhn-border-strong)]"
                        aria-label="Profile"
                    >
                        <img
                            src="/profile.png"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </button>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        onClick={() => setMobileMenu(!mobileMenu)}
                        className="lg:hidden text-[var(--bhn-text-muted)]"
                    >
                        {mobileMenu ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            {mobileMenu && (
                <div className="lg:hidden border-t border-[var(--bhn-border)] px-4 py-4 bg-[var(--bhn-surface-2)]">

                    {/* MOBILE SEARCH */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery.trim()) {
                                router.push(`/instructor/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                setMobileMenu(false);
                            }
                        }}
                        className="relative mb-5 md:hidden"
                    >
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]"
                        />

                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 rounded-full bg-[var(--bhn-surface-3)] pl-10 pr-4 text-sm outline-none border border-transparent focus:border-[var(--bhn-brand-400)]"
                        />
                    </form>

                    {/* MOBILE NAV */}
                    <nav className="flex flex-col gap-1">

                        {navItems.map((item) => {

                            const isActive =
                                item.path === "/instructor/performance"
                                    ? pathname.startsWith("/instructor/performance")
                                    : pathname === item.path;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    onClick={() => setMobileMenu(false)}
                                    className={`bhn-navlink ${isActive ? "bhn-navlink-active" : ""}`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}

                    </nav>
                </div>
            )}
        </header>
    );
}
