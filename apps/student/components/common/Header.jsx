"use client";

import { Bell, User, Menu, X, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAcademySession, readTokenRole } from "@/lib/session";
import AcademyLogo from "@/components/common/AcademyLogo";

const tabs = [
  { name: "Home", path: "/student/courses" },
  // { name: "Practice", path: "/student/courses#practice-tests" },
  { name: "My Courses", path: "/student/mycourse" },
  { name: "Wishlist", path: "/student/wishlist" },
];

export default function Header() {

  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(Boolean(token && readTokenRole(token) === "student"));
  }, [pathname]);

return (
    <div className="bg-[var(--bhn-surface)] shadow-[var(--bhn-shadow-sm)] border-b border-[var(--bhn-border)]">

      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4">

        {/* LOGO */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/student/courses")}
        >

          <AcademyLogo className="h-8 sm:h-9 w-auto object-contain" />

        </div>

        {/* DESKTOP TABS */}
        <nav className="hidden md:flex gap-1 items-center" >

          {tabs.map((tab) => {

            const isActive =
              tab.path === "/student/courses"
                ? pathname.startsWith("/student/courses") ||
                pathname.startsWith("/student/view_details") ||
                pathname.startsWith("/student/enroll")
                : tab.path.includes("#")
                  ? false

                : tab.path === "/student/mycourse"
                  ? pathname.startsWith("/student/mycourse") ||
                  pathname.startsWith("/student/allcourse") ||
                  pathname.startsWith("/student/course-player") ||
                  pathname.startsWith("/student/progress")

                  : pathname === tab.path;

            return (
              <div
                key={tab.name}
                onClick={() => router.push(tab.path)}
                className={`bhn-navlink cursor-pointer ${isActive ? "bhn-navlink-active" : ""}`}
              >
                {tab.name}
              </div>
            );
          })}

        </nav>

{/* RIGHT */}
        <div className="hidden md:flex gap-4 items-center text-[var(--bhn-text-muted)]">

          {!isAuthenticated ? (
            <button
              onClick={() => router.push(`/student/auth?next=${encodeURIComponent(`${pathname}${window.location.search}`)}`)}
              className="bhn-btn bhn-btn-primary rounded-[var(--bhn-radius)] px-4 py-2 text-sm font-semibold"
            >
              Login to enroll
            </button>
          ) : (
            <>

          {/* NOTIFICATION */}
          <div
            onClick={() => router.push("/student/notification")}
            className="cursor-pointer hover:text-[var(--bhn-brand-700)] transition-all duration-200"
          >

            <Bell size={20} />

          </div>

          <button
            onClick={() => {
              clearAcademySession();
              router.replace("/student/auth");
            }}
            className="hover:text-[var(--bhn-brand-700)]"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>

          {/* PROFILE */}
          <div
            onClick={() => router.push("/student/profile")}
            className="flex items-center gap-2 cursor-pointer hover:text-[var(--bhn-brand-700)] transition-all duration-200"
          >

            <User size={20} />

          </div>

            </>
          )}

        </div>

{/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="md:hidden text-[var(--bhn-text)]"
        >

          {mobileMenu ? <X size={26} /> : <Menu size={26} />}

        </button>

      </div>

      {/* MOBILE MENU */}
      {mobileMenu && (

        <div className="md:hidden border-t border-[var(--bhn-border)] px-4 py-4 bg-[var(--bhn-surface)]">

          {/* TABS */}
          <nav className="flex flex-col gap-1">

            {tabs.map((tab) => {

              const isActive = pathname === tab.path;

              return (
                <div
                  key={tab.name}
                  onClick={() => {
                    router.push(tab.path);
                    setMobileMenu(false);
                  }}
                  className={`bhn-navlink cursor-pointer ${isActive ? "bhn-navlink-active" : ""}`}
                >
                  {tab.name}
                </div>
              );
            })}

          </nav>

          {/* MOBILE ACTIONS */}
          <div className="flex items-center gap-6 mt-6 pt-5 border-t border-[var(--bhn-border)] text-[var(--bhn-text-muted)]">

            {!isAuthenticated ? (
              <button
                onClick={() => {
                  router.push(`/student/auth?next=${encodeURIComponent(`${pathname}${window.location.search}`)}`);
                  setMobileMenu(false);
                }}
                className="bhn-btn bhn-btn-primary px-4 py-2 text-sm font-semibold"
              >
                Login to enroll
              </button>
            ) : (
              <>

            <div
              onClick={() => {
                router.push("/student/notification");
                setMobileMenu(false);
              }}
              className="flex items-center gap-2 cursor-pointer hover:text-[var(--bhn-brand-700)]"
            >

              <Bell size={20} />

              <span className="text-sm">
                Notifications
              </span>

            </div>

            <button
              onClick={() => {
                clearAcademySession();
                setMobileMenu(false);
                router.replace("/student/auth");
              }}
              className="flex items-center gap-2 text-[var(--bhn-error-600)]"
            >
              <LogOut size={20} /> <span className="text-sm">Logout</span>
            </button>

            <div
              onClick={() => {
                router.push("/student/profile");
                setMobileMenu(false);
              }}
              className="flex items-center gap-2 cursor-pointer hover:text-[var(--bhn-brand-700)]"
            >

              <User size={20} />

              <span className="text-sm">
                Profile
              </span>

            </div>

              </>
            )}

          </div>

        </div>

      )}

    </div>
  );
}
