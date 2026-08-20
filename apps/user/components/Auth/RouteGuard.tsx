"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function isValidToken(token: string) {
  try {
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function clearSession() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  document.cookie = "bandhan_user_token=; Path=/; Max-Age=0; SameSite=Lax";
}

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const protectedRoute = pathname === "/userdashboard" || pathname.startsWith("/userdashboard/") || pathname.startsWith("/dashboard/");
  const hasValidSession =
    hydrated &&
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("auth_token") && isValidToken(localStorage.getItem("auth_token")!));

  useEffect(() => {
    if (!hydrated || !protectedRoute || hasValidSession) return;

    clearSession();
    const returnTo = `${pathname}${window.location.search}`;
    router.replace(`/login?next=${encodeURIComponent(returnTo)}`);
  }, [hasValidSession, hydrated, pathname, protectedRoute, router]);

  if (protectedRoute && !hasValidSession) {
    return <div className="min-h-screen bg-[#FAF5EE]" aria-label="Checking authentication" />;
  }
  return children;
}
