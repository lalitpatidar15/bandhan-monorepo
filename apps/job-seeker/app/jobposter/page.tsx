"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function JobPosterRoot() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated, or to dashboard if authenticated
    // For now, redirect to login
    router.push("/jobposter/login");
  }, [router]);

  return null;
}
