"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { SsoLoadingScreen } from "@bandhan/ui";

function SellerSsoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("sso");
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const fragmentToken = fragment.get("token");
    if (!code && !fragmentToken) {
      queueMicrotask(() => setError("This sign-in link is missing or invalid."));
      return;
    }

    // Remove the short-lived grant from the address bar before exchanging it.
    window.history.replaceState(null, "", window.location.pathname);

    if (fragmentToken) {
      localStorage.setItem("sellerToken", fragmentToken);
      localStorage.setItem("authToken", fragmentToken);
      localStorage.setItem("userName", fragment.get("name") || "Seller");
      router.replace("/sellerDashboard");
      return;
    }

    apiPost<{ token?: string; user?: { id?: string; fullName?: string; name?: string } }>("/auth/sso/exchange", { code, role: "seller" })
      .then((result) => {
        if (!result.token) throw new Error("No session was returned");
        localStorage.setItem("sellerToken", result.token);
        localStorage.setItem("authToken", result.token);
        if (result.user?.id) localStorage.setItem("sellerUserId", result.user.id);
        localStorage.setItem("userName", result.user?.fullName || result.user?.name || "Seller");
        router.replace("/sellerDashboard");
      })
      .catch(() => setError("This sign-in link has expired. Please return to the central login page and try again."));
  }, [router, searchParams]);

  if (!error) return <SsoLoadingScreen portalName="your seller portal" />;
  return <main className="flex min-h-screen items-center justify-center bg-[#F7F1EB] p-6 text-center text-[#3A2B22]"><p>{error}</p></main>;
}

export default function SellerSsoCallbackPage() {
  return (
    <Suspense fallback={<SsoLoadingScreen portalName="your seller portal" />}>
      <SellerSsoCallbackContent />
    </Suspense>
  );
}
