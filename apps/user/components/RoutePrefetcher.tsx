"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROUTES = [
  "/products",
  "/products/Venue",
  "/products/service-listing",
  "/dashboard",
  "/booking",
  "/cart",
  "/checkout",
  "/feed",
  "/communities",
  "/notification",
  "/planner",
  "/refunds",
  "/quote",
  "/vendor/profile",
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
