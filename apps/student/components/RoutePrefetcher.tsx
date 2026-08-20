"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROUTES = [
  "/student/courses",
  "/student/allcourse",
  "/student/mycourse",
  "/student/notification",
  "/student/profile",
  "/student/wishlist",
  "/instructor/dashboard",
  "/instructor/performance",
  "/instructor/analytics",
  "/instructor/earnings",
  "/instructor/profile",
  "/instructor/content",
  "/instructor/curriculum",
];

export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      ROUTES.forEach((route) => router.prefetch(route));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}
