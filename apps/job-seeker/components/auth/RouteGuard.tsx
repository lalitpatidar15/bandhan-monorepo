"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { centralLoginUrl, clearJobPortalSession, readTokenRole } from "@/lib/session";

const publicPaths = ["/Jobseeker/login", "/Jobseeker/signup", "/jobposter/login", "/jobposter/register", "/jobposter/forgot-password", "/jobposter/privacy-policy", "/jobposter/terms-of-service", "/jobposter/cookie-policy", "/jobposter/contact-support"];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authorizedPath, setAuthorizedPath] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (publicPaths.includes(pathname)) {
      setAuthorizedPath(pathname);
      return;
    }

    if (pathname.startsWith("/Jobseeker/")) {
      if (!token || readTokenRole(token) !== "jobseeker") {
        clearJobPortalSession();
        window.location.assign(centralLoginUrl());
        return;
      }
    } else if (pathname.startsWith("/jobposter/")) {
      if (!token || readTokenRole(token) !== "recruiter") {
        clearJobPortalSession();
        window.location.assign(centralLoginUrl());
        return;
      }
    }

    setAuthorizedPath(pathname);
  }, [pathname]);

  if (authorizedPath !== pathname) {
    return <div className="min-h-screen bg-[#F8F5F2] dark:bg-[#1a1a1a]" />;
  }

  return children;
}
