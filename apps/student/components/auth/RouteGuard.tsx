"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { centralLoginUrl, clearAcademySession, readTokenRole, type AcademyRole } from "@/lib/session";

const studentPublicRoutes = new Set(["/student", "/student/auth", "/student/login", "/student/courses"]);
const instructorPublicRoutes = new Set(["/instructor", "/instructor/login"]);

function requiredRole(pathname: string): AcademyRole | null {
  if (pathname.startsWith("/student/view_details/")) return null;
  if (pathname.startsWith("/student/") && !studentPublicRoutes.has(pathname)) return "student";
  if (pathname.startsWith("/instructor/") && !instructorPublicRoutes.has(pathname)) return "instructor";
  if (["/course-player", "/live-session", "/my-courses"].some((path) => pathname === path || pathname.startsWith(`${path}/`))) return "student";
  return null;
}

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authorizedPath, setAuthorizedPath] = useState<string | null>(null);

  useEffect(() => {
    const role = requiredRole(pathname);
    if (!role) {
      setAuthorizedPath(pathname);
      return;
    }

    const token = localStorage.getItem("token");
    if (token && readTokenRole(token) === role) {
      setAuthorizedPath(pathname);
      return;
    }

    clearAcademySession();
    setAuthorizedPath(null);
    window.location.assign(centralLoginUrl());
  }, [pathname]);

  if (authorizedPath !== pathname) {
    return <div className="min-h-screen bg-[#F8F5F2] dark:bg-[#171717]" aria-label="Checking authentication" />;
  }

  return children;
}
