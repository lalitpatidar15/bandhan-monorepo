"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SsoLoadingScreen } from "@bandhan/ui";
import { setAcademySession, type AcademyRole } from "@/lib/session";

const apiUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "https://api.bandhaneventshub.com/api";
  return raw.endsWith("/api") ? raw : `${raw.replace(/\/$/, "")}/api`;
};

function StudentSsoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("sso");
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const fragmentToken = fragment.get("token");
    const requestedRole = searchParams.get("role") || fragment.get("role");
    const role: AcademyRole = requestedRole === "instructor" ? "instructor" : "student";

    if (!code && !fragmentToken) {
      queueMicrotask(() => setError("This sign-in link is missing or invalid."));
      return;
    }

    window.history.replaceState(null, "", window.location.pathname);

    const applySession = (token: string, userName: string, userId?: string) => {
      setAcademySession(token, role);
      localStorage.setItem("user", JSON.stringify({ role, fullName: userName }));
      if (role === "student" && userId) localStorage.setItem("studentId", userId);
      if (role === "instructor") localStorage.setItem("instructor", "true");
      router.replace(role === "instructor" ? "/instructor/dashboard" : "/student/dashboard");
    };

    if (fragmentToken) {
      applySession(fragmentToken, fragment.get("name") || "");
      return;
    }

    fetch(`${apiUrl()}/auth/sso/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code, role }),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.token) throw new Error("No session returned");
        applySession(result.token, result.user?.fullName || result.user?.name || "", result.user?.id);
      })
      .catch(() => setError("This sign-in link has expired. Please return to the central login page and try again."));
  }, [router, searchParams]);

  if (!error) return <SsoLoadingScreen portalName="your learning portal" />;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bhn-bg)] p-6 text-center text-[var(--bhn-text)]">
      <div>
        <p>{error}</p>
        <a className="mt-4 inline-block underline" href="/student/auth">Return to login</a>
      </div>
    </main>
  );
}

export default function StudentSsoCallbackPage() {
  return (
    <Suspense fallback={<SsoLoadingScreen portalName="your learning portal" />}>
      <StudentSsoCallbackContent />
    </Suspense>
  );
}
