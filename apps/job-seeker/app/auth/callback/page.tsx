"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setJobPortalSession } from "@/lib/session";
import { SsoLoadingScreen } from "@bandhan/ui";

const apiUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return raw.endsWith("/api") ? raw : `${raw.replace(/\/$/, "")}/api`;
};

export default function JobSsoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("sso");
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const fragmentToken = fragment.get("token");
    const role = searchParams.get("role") || fragment.get("role");
    if ((role !== "jobseeker" && role !== "recruiter") || (!code && !fragmentToken)) {
      queueMicrotask(() => setError("This sign-in link is missing or invalid."));
      return;
    }

    window.history.replaceState(null, "", window.location.pathname);
    if (fragmentToken) {
      setJobPortalSession(fragmentToken, role);
      const name = fragment.get("name");
      if (name) localStorage.setItem("userName", name);
      router.replace(role === "recruiter" ? "/jobposter/dashboard" : "/Jobseeker/dashboard");
      return;
    }

    fetch(`${apiUrl()}/auth/sso/exchange`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, role }), credentials: "include",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.token) throw new Error("No session returned");
        setJobPortalSession(result.token, role);
        router.replace(role === "recruiter" ? "/jobposter/dashboard" : "/Jobseeker/dashboard");
      })
      .catch(() => setError("This sign-in link has expired. Please return to the central login page and try again."));
  }, [router, searchParams]);

  if (!error) return <SsoLoadingScreen portalName="your careers portal" />;
  return <main className="flex min-h-screen items-center justify-center bg-[#FEF1E7] p-6 text-center text-[#2D1F16]"><p>{error}</p></main>;
}
