"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setJobPortalSession } from "@/lib/session";

const apiUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return raw.endsWith("/api") ? raw : `${raw.replace(/\/$/, "")}/api`;
};

export default function JobSsoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing secure sign-in…");

  useEffect(() => {
    const code = searchParams.get("sso");
    const role = searchParams.get("role");
    if (!code || (role !== "jobseeker" && role !== "recruiter")) {
      setMessage("This sign-in link is missing or invalid.");
      return;
    }

    window.history.replaceState(null, "", window.location.pathname);
    fetch(`${apiUrl()}/auth/sso/exchange`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, role }), credentials: "include",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.token) throw new Error("No session returned");
        setJobPortalSession(result.token, role);
        router.replace(role === "recruiter" ? "/jobposter/dashboard" : "/Jobseeker/dashboard");
      })
      .catch(() => setMessage("This sign-in link has expired. Please return to the central login page and try again."));
  }, [router, searchParams]);

  return <main className="flex min-h-screen items-center justify-center bg-[#FEF1E7] p-6 text-center text-[#2D1F16]"><p>{message}</p></main>;
}
