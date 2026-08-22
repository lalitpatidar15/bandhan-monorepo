"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAcademySession } from "@/lib/session";
import { SsoLoadingScreen } from "@bandhan/ui";

const apiUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return raw.endsWith("/api") ? raw : `${raw.replace(/\/$/, "")}/api`;
};

export default function AcademySsoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("sso");
    const role = searchParams.get("role");
    if (!code || (role !== "student" && role !== "instructor")) {
      setError("This sign-in link is missing or invalid.");
      return;
    }

    window.history.replaceState(null, "", window.location.pathname);
    fetch(`${apiUrl()}/auth/sso/exchange`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, role }), credentials: "include",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.token) throw new Error("No session returned");
        setAcademySession(result.token, role);
        localStorage.setItem(role === "instructor" ? "instructor" : "user", JSON.stringify(result.user));
        router.replace(role === "instructor" ? "/instructor/dashboard" : "/student/courses");
      })
      .catch(() => setError("This sign-in link has expired. Please return to the central login page and try again."));
  }, [router, searchParams]);

  if (!error) return <SsoLoadingScreen portalName="your learning portal" />;
  return <main className="flex min-h-screen items-center justify-center bg-[#F8F5F2] p-6 text-center text-[#2D201B]"><p>{error}</p></main>;
}
